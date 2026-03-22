import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';
import { getNextConfirmedSession, isUpcomingSession } from '@/lib/booking/session-flow';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    const [{ data: bookings }, { data: program }, { data: sessionAssessments }] = await Promise.all([
      supabase
        .from('bookings')
        .select('id,date,time,type,status,therapist_name,meeting_link')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('programs')
        .select('id,total_sessions,used_sessions,program_type,status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('therapist_session_assessments')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    const scoreList = (sessionAssessments ?? []).map((item) => Number(item.overall_dysregulation_score));
    const averageScore =
      scoreList.length > 0
        ? Number((scoreList.reduce((sum, value) => sum + value, 0) / scoreList.length).toFixed(2))
        : null;
    const nextUpcomingBooking = getNextConfirmedSession(bookings ?? []);
    const completedSessionsCount = (bookings ?? []).filter((booking) => booking.status === 'completed').length;
    const scheduledSessionsCount = (bookings ?? []).filter(
      (booking) => booking.status === 'confirmed' && isUpcomingSession(booking)
    ).length;
    const remainingSessions = program ? Math.max(0, program.total_sessions - program.used_sessions) : null;
    const canScheduleNextSession = Boolean(
      program && program.status === 'active' && remainingSessions !== null && remainingSessions > 0 && !nextUpcomingBooking
    );

    const assessmentByBookingId = new Map(
      (sessionAssessments ?? []).map((assessment) => [assessment.booking_id, assessment])
    );

    const timeline = (bookings ?? []).map((booking) => {
      const sessionAssessment = assessmentByBookingId.get(booking.id);

      return {
        booking,
        sessionAssessment: sessionAssessment
          ? {
              id: sessionAssessment.id,
              overall_dysregulation_score: sessionAssessment.overall_dysregulation_score,
              nervous_system_score: sessionAssessment.nervous_system_score,
              emotional_pattern_score: sessionAssessment.emotional_pattern_score,
              family_imprint_score: sessionAssessment.family_imprint_score,
              incident_load_score: sessionAssessment.incident_load_score,
              body_symptom_score: sessionAssessment.body_symptom_score,
              current_stress_score: sessionAssessment.current_stress_score,
              therapist_notes: sessionAssessment.therapist_notes,
              observations: sessionAssessment.observations,
              recommendations: sessionAssessment.recommendations,
              resource_pdf_url: sessionAssessment.resource_pdf_url,
              resource_mp4_url: sessionAssessment.resource_mp4_url,
              created_at: sessionAssessment.created_at,
            }
          : null,
      };
    });

    const latestAssessment = sessionAssessments?.[0]
      ? {
          id: sessionAssessments[0].id,
          overall_dysregulation_score: sessionAssessments[0].overall_dysregulation_score,
          nervous_system_score: sessionAssessments[0].nervous_system_score,
          emotional_pattern_score: sessionAssessments[0].emotional_pattern_score,
          family_imprint_score: sessionAssessments[0].family_imprint_score,
          incident_load_score: sessionAssessments[0].incident_load_score,
          body_symptom_score: sessionAssessments[0].body_symptom_score,
          current_stress_score: sessionAssessments[0].current_stress_score,
          therapist_notes: sessionAssessments[0].therapist_notes,
          observations: sessionAssessments[0].observations,
          recommendations: sessionAssessments[0].recommendations,
          resource_pdf_url: sessionAssessments[0].resource_pdf_url,
          resource_mp4_url: sessionAssessments[0].resource_mp4_url,
          created_at: sessionAssessments[0].created_at,
        }
      : null;

    return NextResponse.json({
      averageScore,
      sessionsWithAssessment: scoreList.length,
      latestAssessment,
      nextUpcomingBooking: nextUpcomingBooking
        ? {
            ...nextUpcomingBooking,
            sessionNumber: program ? program.used_sessions : null,
          }
        : null,
      summary: {
        programId: program?.id ?? null,
        programType: program?.program_type ?? null,
        totalSessions: program?.total_sessions ?? null,
        usedSessions: program?.used_sessions ?? 0,
        completedSessions: completedSessionsCount,
        scheduledSessions: scheduledSessionsCount,
        remainingSessions,
        canScheduleNextSession,
        nextSchedulableSessionNumber: canScheduleNextSession && program ? program.used_sessions + 1 : null,
      },
      timeline,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
