import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { BookingService } from '@/lib/services/booking.service';

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const clientId = user.id;

    // Get sessions from BookingService
    const service = new BookingService();
    const { upcomingSessions, pastSessions, pendingSessions, completedSessionIds } =
      await service.getClientSessions(clientId);

    // Fetch diagnostic assessments
    const { data: assessments } = await supabase
      .from('diagnostic_assessments')
      .select('*')
      .eq('client_id', clientId)
      .order('assessed_at', { ascending: true });

    // Fetch all sessions for session_number mapping
    const { data: allClientSessionsFull } = await supabase
      .from('sessions')
      .select('id, booking_id, session_number, status')
      .eq('client_id', clientId);

    const sessionNumberMap = new Map<string, number>();
    (allClientSessionsFull ?? []).forEach((s: any) => {
      if (s.id && s.session_number) sessionNumberMap.set(s.id, s.session_number);
    });

    // Fetch session development forms
    const { data: devFormsRaw } = await supabase
      .from('session_development_forms')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    const devForms = (devFormsRaw ?? [])
      .filter((form: any) => completedSessionIds.includes(form.session_id))
      .map(({ therapist_internal_notes, ...rest }: any) => ({
        ...rest,
        session_number: sessionNumberMap.get(rest.session_id) ?? null,
      }));

    // Fetch session materials
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

    // Fetch therapist info
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

    // Fetch active program
    const { data: program } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', clientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch pending program
    const { data: pendingProgram } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', clientId)
      .eq('status', 'pending')
      .eq('payment_status', 'pending_verification')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch completed programs
    const { data: completedPrograms } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', clientId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    // Build progress data
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

    // Determine program status
    const { data: allBookings } = await supabase
      .from('bookings')
      .select('type, status')
      .eq('user_id', clientId);

    const hasCompletedFreeConsult = (allBookings ?? []).some(b =>
      b.type === 'free_consultation' && b.status === 'completed'
    );

    const bookedFreeConsult = (allBookings ?? []).find(b =>
      b.type === 'free_consultation' && (b.status === 'confirmed' || b.status === 'scheduled')
    );

    const hasActiveProgram = !!program;
    const hasPendingProgram = !!pendingProgram;
    const hasCompletedAllSessions = (completedPrograms ?? []).some(p =>
      p.used_sessions >= p.total_sessions
    );

    let programStatus = 'none';
    if (hasActiveProgram) programStatus = 'active';
    else if (hasPendingProgram) programStatus = 'pending_verification';
    else if (hasCompletedAllSessions) programStatus = 'completed';
    else if (hasCompletedFreeConsult) programStatus = 'consultation_done';

    return NextResponse.json({
      upcomingSessions,
      pastSessions,
      pendingSessions,
      materials,
      progress: progressData,
      assessments: assessments ?? [],
      devForms: devForms ?? [],
      therapist: therapistInfo,
      program: program ?? null,
      pendingProgram: pendingProgram ? {
        id: pendingProgram.id,
        programType: pendingProgram.program_type,
        pricePaid: pendingProgram.price_paid,
        paymentStatus: pendingProgram.payment_status,
        paymentSubmittedAt: pendingProgram.payment_submitted_at,
        therapistName: pendingProgram.therapist_name,
        totalSessions: pendingProgram.total_sessions,
        createdAt: pendingProgram.created_at,
      } : null,
      completedPrograms: completedPrograms ?? [],
      programStatus,
      hasCompletedFreeConsult,
      hasBookedFreeConsult: !!bookedFreeConsult,
      bookedFreeConsult: bookedFreeConsult ? { ...bookedFreeConsult } : null,
      hasCompletedAllSessions,
      completedSessionIds,
    });
  } catch (error) {
    console.error('[Client Dashboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
