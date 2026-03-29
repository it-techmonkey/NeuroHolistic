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

    const supabase = getServiceSupabase();
    const clientId = user.id;

    // Get user email for fallback lookup
    const userEmail = user.email?.toLowerCase();

    // 1. Fetch all bookings for this client (by user_id or email fallback)
    let { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false });

    // If no bookings found by user_id, try by email (for bookings made before user_id was set)
    if ((!bookings || bookings.length === 0) && userEmail) {
      const { data: emailBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', userEmail)
        .order('date', { ascending: false });
      bookings = emailBookings;
    }

    const now = new Date();
    
    // Upcoming: confirmed or scheduled and in the future (or today with future time)
    const upcomingBookings = (bookings ?? []).filter(b => {
      if (b.status !== 'confirmed' && b.status !== 'scheduled') return false;
      const bookingDateTime = new Date(`${b.date}T${b.time}`);
      return bookingDateTime >= now;
    });
    
    // Past: completed, cancelled, or in the past
    const pastBookings = (bookings ?? []).filter(b => {
      if (b.status === 'completed' || b.status === 'cancelled') return true;
      const bookingDateTime = new Date(`${b.date}T${b.time}`);
      return bookingDateTime < now;
    });
    
    // 1.1 Fetch pending sessions for active programs
    const { data: pendingSessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .order('session_number', { ascending: true });

    // 1.2 Fetch all sessions to build mappings
    const { data: allClientSessionsFull } = await supabase
      .from('sessions')
      .select('id, booking_id, session_number, status')
      .eq('client_id', clientId);

    // Build booking_id -> session_id mapping
    const bookingToSessionMap = new Map<string, string>();
    // Build set of completed session IDs for filtering
    const completedSessionIds = new Set<string>();
    
    (allClientSessionsFull ?? []).forEach((s: any) => {
      if (s.booking_id && s.id) {
        bookingToSessionMap.set(s.booking_id, s.id);
      }
      if (s.status === 'completed' && s.id) {
        completedSessionIds.add(s.id);
      }
    });

    // Add session_id to bookings for document filtering
    const addSessionId = (booking: any) => ({
      ...booking,
      session_id: bookingToSessionMap.get(booking.id) || null,
    });

    // 2. Fetch diagnostic assessments
    const { data: assessments } = await supabase
      .from('diagnostic_assessments')
      .select('*')
      .eq('client_id', clientId)
      .order('assessed_at', { ascending: true });

    // 2. Build session_number lookup map from already fetched sessions
    const sessionNumberMap = new Map<string, number>();
    (allClientSessionsFull ?? []).forEach((s: any) => {
      if (s.id && s.session_number) {
        sessionNumberMap.set(s.id, s.session_number);
      }
    });

    // 3. Fetch session development forms (strip therapist_internal_notes)
    const { data: devFormsRaw } = await supabase
      .from('session_development_forms')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    // Filter dev forms to only include those from completed sessions
    // Strip therapist_internal_notes and add session_number from map
    const devForms = (devFormsRaw ?? [])
      .filter((form: any) => completedSessionIds.has(form.session_id))
      .map(({ therapist_internal_notes, ...rest }: any) => ({
        ...rest,
        session_number: sessionNumberMap.get(rest.session_id) ?? null,
      }));

    // 5. Fetch session materials - get all session IDs for this client
    const { data: clientSessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('client_id', clientId)
      .eq('status', 'completed');
    
    const sessionIds = (clientSessions ?? []).map((s: any) => s.id);
    let materials: any[] = [];
    if (sessionIds.length > 0) {
      const { data: materialsData } = await supabase
        .from('session_materials')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false });
      materials = materialsData ?? [];
    }

    // 5. Fetch therapist info
    const { data: therapistAssignment } = await supabase
      .from('therapist_clients')
      .select('therapist_id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let therapistInfo = null;
    if (therapistAssignment) {
      const { data: therapist } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', therapistAssignment.therapist_id)
        .single();
      therapistInfo = therapist;
    }

    // 6. Fetch active program
    const { data: program } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', clientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 6.1 Fetch completed programs for users who finished all sessions
    const { data: completedPrograms } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', clientId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    // 7. Build progress data - only from assessments (dev forms use different schema)
    const progressData = [
      ...(assessments ?? []).map(a => ({
        date: a.assessed_at ?? a.created_at,
        type: 'diagnostic' as const,
        goalReadinessScore: a.goal_readiness_score,
        scores: {
          nervous_system: a.nervous_system_score,
          emotional_state: a.emotional_state_score,
          cognitive_patterns: a.cognitive_patterns_score,
          body_symptoms: a.body_symptoms_score,
          behavioral_patterns: a.behavioral_patterns_score,
          life_functioning: a.life_functioning_score,
        },
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 6.2 Determine user's program status for UI
    const hasCompletedFreeConsult = (bookings ?? []).some(b =>
      b.type === 'free_consultation' && b.status === 'completed'
    );

    // Check if there's a booked free consultation that's not completed yet
    const bookedFreeConsult = (bookings ?? []).find(b =>
      b.type === 'free_consultation' && (b.status === 'confirmed' || b.status === 'scheduled')
    );
    const hasBookedFreeConsult = !!bookedFreeConsult;

    const hasActiveProgram = !!program;
    const hasCompletedAllSessions = (completedPrograms ?? []).some(p =>
      p.used_sessions >= p.total_sessions
    );

    // Determine what action user should see
    let programStatus = 'none';
    if (hasActiveProgram) {
      programStatus = 'active';
    } else if (hasCompletedAllSessions) {
      programStatus = 'completed';
    } else if (hasCompletedFreeConsult) {
      programStatus = 'consultation_done';
    }

    // Debug info - remove in production
    const allPrograms = await supabase
      .from('programs')
      .select('id, status, used_sessions, total_sessions, created_at')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      upcomingSessions: upcomingBookings.map(addSessionId),
      pastSessions: pastBookings.map(addSessionId),
      pendingSessions: pendingSessions ?? [],
      materials,
      progress: progressData,
      assessments: assessments ?? [],
      devForms: devForms ?? [],
      therapist: therapistInfo,
      program: program ?? null,
      completedPrograms: completedPrograms ?? [],
      programStatus, // 'active', 'completed', 'consultation_done', or 'none'
      hasCompletedFreeConsult,
      hasBookedFreeConsult,
      bookedFreeConsult: bookedFreeConsult ? addSessionId(bookedFreeConsult) : null, // The booking details for the upcoming consultation
      hasCompletedAllSessions,
      completedSessionIds: Array.from(completedSessionIds), // For filtering documents on client side
      debug: {
        allPrograms: allPrograms.data || [],
        activeProgram: program || null,
        completedProgramsCount: (completedPrograms ?? []).length,
      },
    });
  } catch (error) {
    console.error('[Client Dashboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
