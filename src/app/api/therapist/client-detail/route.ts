import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
    const role = userData?.role;
    if (role !== 'therapist' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const clientId = request.nextUrl.searchParams.get('clientId');
    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Fetch all bookings for this client
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false });

    // Fetch all sessions for this client
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('session_number', { ascending: true });

    // Fetch all assessments (strip internal data for non-admin)
    const { data: assessments } = await supabase
      .from('diagnostic_assessments')
      .select('id, session_id, client_id, therapist_id, is_baseline, main_complaint, current_symptoms, previous_therapy, nervous_system_pattern, nervous_system_score, emotional_state_score, cognitive_patterns_score, body_symptoms_score, behavioral_patterns_score, life_functioning_score, goal_readiness_score, clinical_condition_brief, therapist_focus, therapy_goal, assessed_at, created_at')
      .eq('client_id', clientId)
      .order('assessed_at', { ascending: true });

    // Fetch session development forms (include internal notes for therapist/admin)
    const { data: devForms } = await supabase
      .from('session_development_forms')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

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
    const { data: clientProfile } = await supabase
      .from('users')
      .select('full_name, email, phone, country')
      .eq('id', clientId)
      .single();

    // Combine bookings and sessions into unified array for SessionsTab
    // Bookings schema: user_id, therapist_id (TEXT), meeting_link, status, type
    // Sessions schema: client_id, therapist_id (UUID), meet_link, status, development_form_submitted
    const mappedBookings = (bookings ?? []).map(b => {
      const linkedSession = (sessions ?? []).find((s: any) => s.booking_id === b.id);
      return {
        ...b,
        id: b.id,
        session_ref_id: linkedSession?.id || null,
        client_id: b.user_id,
        meet_link: b.meeting_link,
        development_form_submitted: linkedSession?.development_form_submitted ?? false,
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

    return NextResponse.json({
      bookings: bookings ?? [],
      sessions: combinedSessions,
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
