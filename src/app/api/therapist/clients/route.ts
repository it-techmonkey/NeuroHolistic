import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'therapist' && userData?.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    // Get clients assigned to this therapist
    const { data: assignments } = await supabase
      .from('therapist_clients')
      .select('client_id')
      .eq('therapist_id', user.id);

    const clientIds = (assignments ?? []).map(a => a.client_id);

    let clients: Record<string, unknown>[] = [];
    let bookings: Record<string, unknown>[] = [];
    let assessments: Record<string, unknown>[] = [];
    let programs: Record<string, unknown>[] = [];
    let sessionAssessments: Record<string, unknown>[] = [];

    if (clientIds.length > 0) {
      const [usersRes, bookingsRes, assessmentsRes, programsRes, sessionAssessmentsRes] = await Promise.all([
        supabase.from('users').select('*').in('id', clientIds),
        supabase.from('bookings').select('*').eq('therapist_user_id', user.id).order('date', { ascending: false }),
        supabase.from('assessments').select('*').in('user_id', clientIds).order('submitted_at', { ascending: false }),
        supabase.from('programs').select('*').in('user_id', clientIds),
        supabase
          .from('therapist_session_assessments')
          .select('*')
          .eq('therapist_id', user.id)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false }),
      ]);
      clients = usersRes.data ?? [];
      bookings = bookingsRes.data ?? [];
      assessments = assessmentsRes.data ?? [];
      programs = programsRes.data ?? [];
      sessionAssessments = sessionAssessmentsRes.data ?? [];
    }

    const now = new Date();
    now.setHours(0,0,0,0);

    // Build enriched client objects
    const enrichedClients = clients.map(c => {
      const uid = c.id as string;
      const assessment = assessments.find(a => a.user_id === uid);
      const program = programs.find(p => p.user_id === uid);
      const clientBookings = bookings.filter(b => b.user_id === uid);
      const clientSessionAssessments = sessionAssessments.filter((a) => a.client_id === uid);
      const latestSessionAssessment = clientSessionAssessments[0];
      const averageSessionScore = clientSessionAssessments.length
        ? Number(
            (
              clientSessionAssessments.reduce(
                (sum, row) => sum + Number((row.overall_dysregulation_score as number | null) ?? 0),
                0
              ) / clientSessionAssessments.length
            ).toFixed(2)
          )
        : null;
      const upcoming = clientBookings
        .filter(b => b.status === 'confirmed' && new Date(b.date as string) >= now)
        .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());

      return {
        userId: uid,
        email: c.email,
        fullName: c.full_name ?? c.email,
        assessmentScore: latestSessionAssessment?.overall_dysregulation_score ?? assessment?.overall_dysregulation_score ?? null,
        averageScore: averageSessionScore,
        severityBand: assessment?.overall_severity_band ?? null,
        nervousSystemType: assessment?.nervous_system_type ?? null,
        primaryWound: assessment?.primary_core_wound ?? null,
        recommendedPhase: assessment?.recommended_phase_primary ?? null,
        assessmentDate: assessment?.submitted_at ?? null,
        nervousSystemScore: latestSessionAssessment?.nervous_system_score ?? assessment?.nervous_system_score ?? null,
        emotionalScore: latestSessionAssessment?.emotional_pattern_score ?? assessment?.emotional_pattern_score ?? null,
        familyScore: latestSessionAssessment?.family_imprint_score ?? assessment?.family_imprint_score ?? null,
        incidentScore: latestSessionAssessment?.incident_load_score ?? assessment?.incident_load_score ?? null,
        bodyScore: latestSessionAssessment?.body_symptom_score ?? assessment?.body_symptom_score ?? null,
        stressScore: latestSessionAssessment?.current_stress_score ?? assessment?.current_stress_score ?? null,
        therapistNotes: latestSessionAssessment?.therapist_notes ?? assessment?.therapist_notes ?? null,
        programStatus: program?.status ?? null,
        sessionsUsed: program?.used_sessions ?? 0,
        totalSessions: program?.total_sessions ?? 0,
        upcomingDate: upcoming[0]?.date ?? null,
        upcomingTime: upcoming[0]?.time ?? null,
        meetingLink: upcoming[0]?.meeting_link ?? null,
        allBookings: clientBookings.map(b => ({
          id: b.id,
          date: b.date,
          time: b.time,
          status: b.status,
          meeting_link: b.meeting_link,
          type: b.type,
        })),
        sessionAssessments: clientSessionAssessments.map((row) => ({
          id: row.id,
          bookingId: row.booking_id,
          overallScore: row.overall_dysregulation_score,
          notes: row.therapist_notes,
          pdfUrl: row.resource_pdf_url,
          mp4Url: row.resource_mp4_url,
          createdAt: row.created_at,
        })),
      };
    }).sort((a, b): number => {
      // Sort: upcoming first, then by score descending
      if (a.upcomingDate && !b.upcomingDate) return -1;
      if (!a.upcomingDate && b.upcomingDate) return 1;
      return ((b.assessmentScore as number) ?? 0) - ((a.assessmentScore as number) ?? 0);
    });

    const completedSessions = bookings.filter(b => b.status === 'completed').length;

    return NextResponse.json({
      clients: enrichedClients,
      overview: {
        totalClients: enrichedClients.length,
        completedSessions,
        upcomingToday: enrichedClients.filter(c => c.upcomingDate === new Date().toISOString().split('T')[0]).length,
        pendingAssessments: enrichedClients.filter(c => c.assessmentScore === null).length,
      },
    });
  } catch (err) {
    console.error('[Therapist Clients API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: save therapist notes on an assessment
export async function PATCH(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'therapist' && userData?.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, notes, bookingId } = await request.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const supabase = getServiceSupabase();

    let error: { message?: string } | null = null;

    if (bookingId) {
      const updateResult = await supabase
        .from('therapist_session_assessments')
        .update({ therapist_notes: notes, updated_at: new Date().toISOString() })
        .eq('booking_id', bookingId)
        .select('id')
        .maybeSingle();

      if (updateResult.error) {
        error = updateResult.error;
      }
    } else {
      const { data: latestAssessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('email', email)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestAssessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

      const updateResult = await supabase
        .from('assessments')
        .update({ therapist_notes: notes })
        .eq('id', latestAssessment.id);

      error = updateResult.error;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Therapist Notes API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
