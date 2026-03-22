import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';
import { getNextConfirmedSession, isUpcomingSession, sortSessionsAsc, sortSessionsDesc } from '@/lib/booking/session-flow';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type RecordMap = Record<string, unknown>;

function computeAverageScore(rows: RecordMap[]) {
  if (!rows.length) return null;

  return Number(
    (
      rows.reduce(
        (sum, row) => sum + Number((row.overall_dysregulation_score as number | null) ?? 0),
        0
      ) / rows.length
    ).toFixed(2)
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

    const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'therapist' && userData?.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    let assignmentsQuery = supabase.from('therapist_clients').select('*');
    if (userData?.role === 'therapist') {
      assignmentsQuery = assignmentsQuery.eq('therapist_id', user.id);
    }

    const { data: assignments, error: assignmentsError } = await assignmentsQuery;
    if (assignmentsError) {
      return NextResponse.json({ error: assignmentsError.message }, { status: 500 });
    }

    const clientIds = Array.from(new Set((assignments ?? []).map((assignment) => assignment.client_id)));

    if (clientIds.length === 0) {
      return NextResponse.json({
        clients: [],
        overview: {
          totalClients: 0,
          completedSessions: 0,
          upcomingSessions: 0,
          pendingDocumentation: 0,
          averageScore: null,
        },
      });
    }

    const [usersRes, bookingsRes, assessmentsRes, programsRes, sessionAssessmentsRes] = await Promise.all([
      supabase.from('users').select('id,email,full_name').in('id', clientIds),
      supabase
        .from('bookings')
        .select('*')
        .in('user_id', clientIds)
        .order('date', { ascending: false })
        .order('time', { ascending: false }),
      supabase
        .from('assessments')
        .select('*')
        .in('user_id', clientIds)
        .order('submitted_at', { ascending: false }),
      supabase
        .from('programs')
        .select('*')
        .in('user_id', clientIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('therapist_session_assessments')
        .select('*')
        .in('client_id', clientIds)
        .order('created_at', { ascending: false }),
    ]);

    const users = usersRes.data ?? [];
    const bookings = (bookingsRes.data ?? []).filter((booking) => {
      if (userData?.role === 'founder') {
        return true;
      }

      return booking.therapist_user_id === user.id;
    });
    const assessments = assessmentsRes.data ?? [];
    const programs = programsRes.data ?? [];
    const sessionAssessments = (sessionAssessmentsRes.data ?? []).filter((assessment) => {
      if (userData?.role === 'founder') {
        return true;
      }

      return assessment.therapist_id === user.id;
    });

    const assignmentByClientId = new Map((assignments ?? []).map((assignment) => [assignment.client_id, assignment]));

    const initialAssessmentByClientId = new Map<string, RecordMap>();
    for (const assessment of assessments) {
      if (!assessment.user_id || initialAssessmentByClientId.has(assessment.user_id)) continue;
      initialAssessmentByClientId.set(assessment.user_id, assessment);
    }

    const programByClientId = new Map<string, RecordMap>();
    for (const program of programs) {
      if (!program.user_id || programByClientId.has(program.user_id)) continue;
      programByClientId.set(program.user_id, program);
    }

    const sessionAssessmentsByClientId = new Map<string, RecordMap[]>();
    for (const assessment of sessionAssessments) {
      const clientId = assessment.client_id;
      if (!sessionAssessmentsByClientId.has(clientId)) {
        sessionAssessmentsByClientId.set(clientId, []);
      }
      sessionAssessmentsByClientId.get(clientId)?.push(assessment);
    }

    const allUpcomingBookings = bookings.filter(
      (booking) => booking.status === 'confirmed' && isUpcomingSession(booking)
    );
    const completedBookings = bookings.filter((booking) => booking.status === 'completed');

    const clients = users
      .map((client) => {
        const clientId = client.id;
        const assignment = assignmentByClientId.get(clientId);
        const initialAssessment = initialAssessmentByClientId.get(clientId);
        const program = programByClientId.get(clientId);
        const clientSessionAssessments = sessionAssessmentsByClientId.get(clientId) ?? [];
        const latestSessionAssessment = clientSessionAssessments[0] ?? null;
        const clientBookings = sortSessionsDesc(
          bookings.filter((booking) => booking.user_id === clientId)
        );
        const ascendingBookings = sortSessionsAsc(clientBookings);
        const sessionNumberByBookingId = new Map(
          ascendingBookings.map((booking, index) => [booking.id, index + 1])
        );
        const assessmentByBookingId = new Map(
          clientSessionAssessments.map((assessment) => [assessment.booking_id, assessment])
        );
        const sessionTimeline = clientBookings.map((booking) => {
          const sessionAssessment = assessmentByBookingId.get(booking.id) ?? null;

          return {
            id: booking.id,
            date: booking.date,
            time: booking.time,
            type: booking.type,
            status: booking.status,
            meetingLink: booking.meeting_link,
            sessionNumber: sessionNumberByBookingId.get(booking.id) ?? null,
            canComplete: booking.status === 'confirmed',
            assessment: sessionAssessment
              ? {
                  id: sessionAssessment.id,
                  overallScore: sessionAssessment.overall_dysregulation_score,
                  nervousSystemScore: sessionAssessment.nervous_system_score,
                  emotionalPatternScore: sessionAssessment.emotional_pattern_score,
                  familyImprintScore: sessionAssessment.family_imprint_score,
                  incidentLoadScore: sessionAssessment.incident_load_score,
                  bodySymptomScore: sessionAssessment.body_symptom_score,
                  currentStressScore: sessionAssessment.current_stress_score,
                  therapistNotes: sessionAssessment.therapist_notes,
                  observations: sessionAssessment.observations,
                  recommendations: sessionAssessment.recommendations,
                  pdfUrl: sessionAssessment.resource_pdf_url,
                  videoUrl: sessionAssessment.resource_mp4_url,
                  createdAt: sessionAssessment.created_at,
                }
              : null,
          };
        });
        const nextSession = getNextConfirmedSession(clientBookings);
        const pendingDocumentationCount = clientBookings.filter(
          (booking) => booking.status === 'completed' && !assessmentByBookingId.has(booking.id)
        ).length;
        const completedSessionsCount = clientBookings.filter((booking) => booking.status === 'completed').length;
        const averageScore = computeAverageScore(clientSessionAssessments);
        const totalSessions = Number((program?.total_sessions as number | null) ?? 0);
        const usedSessions = Number((program?.used_sessions as number | null) ?? 0);
        const remainingSessions = Math.max(0, totalSessions - usedSessions);

        return {
          userId: clientId,
          email: client.email ?? '',
          fullName: client.full_name ?? client.email ?? 'Client',
          therapistOverviewNotes: (assignment?.notes as string | null) ?? '',
          initialAssessment: initialAssessment
            ? {
                severityBand: (initialAssessment.overall_severity_band as string | null) ?? null,
                nervousSystemType: (initialAssessment.nervous_system_type as string | null) ?? null,
                primaryWound: (initialAssessment.primary_core_wound as string | null) ?? null,
                recommendedPhase: (initialAssessment.recommended_phase_primary as string | null) ?? null,
                assessmentDate: (initialAssessment.submitted_at as string | null) ?? null,
              }
            : null,
          latestAssessment: latestSessionAssessment
            ? {
                overallScore: latestSessionAssessment.overall_dysregulation_score,
                nervousSystemScore: latestSessionAssessment.nervous_system_score,
                emotionalPatternScore: latestSessionAssessment.emotional_pattern_score,
                familyImprintScore: latestSessionAssessment.family_imprint_score,
                incidentLoadScore: latestSessionAssessment.incident_load_score,
                bodySymptomScore: latestSessionAssessment.body_symptom_score,
                currentStressScore: latestSessionAssessment.current_stress_score,
                therapistNotes: latestSessionAssessment.therapist_notes,
                observations: latestSessionAssessment.observations,
                recommendations: latestSessionAssessment.recommendations,
                createdAt: latestSessionAssessment.created_at,
              }
            : null,
          averageScore,
          nextSession: nextSession
            ? {
                id: nextSession.id,
                date: nextSession.date,
                time: nextSession.time,
                type: nextSession.type,
                meetingLink: nextSession.meeting_link,
                sessionNumber: sessionNumberByBookingId.get(nextSession.id) ?? null,
              }
            : null,
          pendingDocumentationCount,
          program: {
            status: (program?.status as string | null) ?? null,
            type: (program?.program_type as string | null) ?? null,
            totalSessions,
            usedSessions,
            completedSessions: completedSessionsCount,
            remainingSessions,
          },
          sessions: sessionTimeline,
        };
      })
      .sort((a, b) => {
        if (a.nextSession && !b.nextSession) return -1;
        if (!a.nextSession && b.nextSession) return 1;
        const leftScore = Number(a.averageScore ?? a.latestAssessment?.overallScore ?? 0);
        const rightScore = Number(b.averageScore ?? b.latestAssessment?.overallScore ?? 0);
        return rightScore - leftScore;
      });

    const overallAverageScore = computeAverageScore(sessionAssessments);

    return NextResponse.json({
      clients,
      overview: {
        totalClients: clients.length,
        completedSessions: completedBookings.length,
        upcomingSessions: allUpcomingBookings.length,
        pendingDocumentation: clients.reduce((sum, client) => sum + client.pendingDocumentationCount, 0),
        averageScore: overallAverageScore,
      },
    });
  } catch (error) {
    console.error('[Therapist Clients API]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'therapist' && userData?.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { clientId, notes } = await request.json();
    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    let query = supabase
      .from('therapist_clients')
      .update({ notes: notes ?? null })
      .eq('client_id', clientId);

    if (userData?.role === 'therapist') {
      query = query.eq('therapist_id', user.id);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Therapist Clients API PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
