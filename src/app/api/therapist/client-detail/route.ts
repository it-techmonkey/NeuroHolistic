import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { bookingMatchesTherapist } from '@/lib/bookings/therapist-scope';

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await authClient
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single();
    const role = userData?.role;
    if (role !== 'therapist' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const scopeTherapist = role === 'therapist';

    const clientId = request.nextUrl.searchParams.get('clientId');
    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Check if this is a guest client (ID starts with 'guest_')
    const isGuestClient = clientId.startsWith('guest_');
    const guestEmail = isGuestClient ? clientId.replace('guest_', '') : null;

    // Fetch all bookings for this client
    let bookingsQuery = supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false });

    if (isGuestClient && guestEmail) {
      // For guest clients, fetch by email
      bookingsQuery = bookingsQuery.eq('email', guestEmail);
    } else {
      // For regular clients, fetch by user_id
      bookingsQuery = bookingsQuery.eq('user_id', clientId);
    }

    let { data: bookings } = await bookingsQuery;

    if (scopeTherapist) {
      bookings = (bookings ?? []).filter((b) =>
        bookingMatchesTherapist(b, user.id, userData?.full_name)
      );
    }

    // Fetch all sessions for this client (empty for guest clients)
    let sessions: any[] = [];
    let assessments: any[] = [];
    let devFormsRaw: any[] = [];

    if (!isGuestClient) {
      let sessionsQuery = supabase
        .from('sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('session_number', { ascending: true });
      if (scopeTherapist) {
        sessionsQuery = sessionsQuery.eq('therapist_id', user.id);
      }
      const { data: sessionsData } = await sessionsQuery;
      sessions = sessionsData ?? [];

      let assessmentsQuery = supabase
        .from('diagnostic_assessments')
        .select('id, session_id, client_id, therapist_id, is_baseline, main_complaint, current_symptoms, previous_therapy, nervous_system_pattern, nervous_system_score, emotional_state_score, cognitive_patterns_score, body_symptoms_score, behavioral_patterns_score, life_functioning_score, goal_readiness_score, clinical_condition_brief, therapist_focus, therapy_goal, assessed_at, created_at')
        .eq('client_id', clientId)
        .order('assessed_at', { ascending: true });
      if (scopeTherapist) {
        assessmentsQuery = assessmentsQuery.eq('therapist_id', user.id);
      }
      const { data: assessmentsData } = await assessmentsQuery;
      assessments = assessmentsData ?? [];

      let devFormsQuery = supabase
        .from('session_development_forms')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });
      if (scopeTherapist) {
        devFormsQuery = devFormsQuery.eq('therapist_id', user.id);
      }
      const { data: devFormsData } = await devFormsQuery;
      devFormsRaw = devFormsData ?? [];
    }

    // Map session_id to session_number using the sessions we already fetched
    const sessionNumberMap = new Map<string, number>();
    (sessions ?? []).forEach((s: any) => {
      if (s.id && s.session_number) {
        sessionNumberMap.set(s.id, s.session_number);
      }
    });

    // Add session_number to each dev form
    const devForms = (devFormsRaw ?? []).map((f: any) => ({
      ...f,
      session_number: sessionNumberMap.get(f.session_id) ?? null,
    }));

    // Fetch materials
    const sessionIds = (sessions ?? []).map(s => s.id);
    let materials: any[] = [];
    if (sessionIds.length > 0) {
      const { data: materialsData } = await supabase
        .from('session_materials')
        .select('*')
        .in('session_id', sessionIds)
        .order('uploaded_at', { ascending: false });
      materials = materialsData ?? [];
    }

    // Fetch client profile for auto-fill
    let clientProfile = null;
    if (!isGuestClient) {
      const { data } = await supabase
        .from('users')
        .select('full_name, email, phone, country')
        .eq('id', clientId)
        .single();
      clientProfile = data;
    } else {
      // For guest clients, use booking info
      const guestBooking = (bookings ?? [])[0];
      if (guestBooking) {
        clientProfile = {
          full_name: guestBooking.name,
          email: guestBooking.email,
          phone: guestBooking.phone,
          country: guestBooking.country,
        };
      }
    }

    // Build a set of client IDs / names that have submitted assessments
    // so we can compute assessment_submitted for free consultation bookings
    const assessedClientIds = new Set<string>();
    const assessedClientNames = new Set<string>();
    (assessments ?? []).forEach((a: any) => {
      if (a.client_id) assessedClientIds.add(a.client_id.toLowerCase().trim());
    });
    // Also fetch assessments by therapist for guest clients (where client_id might differ from booking user_id)
    {
      const { data: therapistAssessments } = await supabase
        .from('diagnostic_assessments')
        .select('client_id, client_name, status')
        .eq('therapist_id', user.id)
        .in('status', ['submitted', 'completed']);
      (therapistAssessments ?? []).forEach((a: any) => {
        if (a.client_id) assessedClientIds.add(a.client_id.toLowerCase().trim());
        if (a.client_name) assessedClientNames.add(a.client_name.toLowerCase().trim());
      });
    }

    const mappedBookings = (bookings ?? []).map(b => {
      const linkedSession = (sessions ?? []).find((s: any) => s.booking_id === b.id);

      // Determine if assessment was submitted for this booking's client
      let hasAssessment = false;
      if (b.user_id) {
        hasAssessment = assessedClientIds.has(b.user_id.toLowerCase().trim());
      }
      if (!hasAssessment && b.name) {
        hasAssessment = assessedClientNames.has(b.name.toLowerCase().trim());
      }
      // Also check by client profile full_name
      if (!hasAssessment && clientProfile?.full_name) {
        hasAssessment = assessedClientNames.has(clientProfile.full_name.toLowerCase().trim());
      }

      return {
        ...b,
        id: b.id,
        session_ref_id: linkedSession?.id || null,
        client_id: b.user_id,
        meet_link: b.meeting_link,
        development_form_submitted: linkedSession?.development_form_submitted ?? false,
        assessment_submitted: hasAssessment,
        session_number: linkedSession?.session_number ?? b.session_number ?? null,
      };
    });

    const mappedSessions = (sessions ?? [])
      .filter((s: any) => !s.booking_id)
      .map(s => ({
      ...s,
      id: s.id,
      session_ref_id: s.id,
      client_id: s.client_id,
      meet_link: s.meet_link,
      development_form_submitted: s.development_form_submitted ?? false,
      }));

    // Combine and sort by date (newest first)
    const combinedSessions = [...mappedBookings, ...mappedSessions]
      .filter((item: any) => {
        // Show only actual scheduled/completed sessions in therapist UI
        const hasSchedule = !!item.date && !!item.time;
        const allowedStatus = ['scheduled', 'confirmed', 'completed'].includes(item.status);
        return hasSchedule && allowedStatus;
      })
      .sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0);
      const dateB = new Date(b.date || b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
      });

    // At most one free-consultation row per client (avoid duplicate booking/session entries)
    const seenFreeConsultClient = new Set<string>();
    const dedupedSessions = combinedSessions.filter((item: any) => {
      if (item.type !== 'free_consultation') return true;
      const cid = item.client_id || item.user_id;
      if (!cid) return true;
      if (seenFreeConsultClient.has(cid)) return false;
      seenFreeConsultClient.add(cid);
      return true;
    });

    return NextResponse.json({
      bookings: bookings ?? [],
      sessions: dedupedSessions,
      assessments: assessments ?? [],
      devForms: devForms ?? [],
      materials,
      clientProfile: clientProfile ?? null,
    });
  } catch (error) {
    console.error('[Therapist Client Detail]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
