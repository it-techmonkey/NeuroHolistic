import { NextResponse } from 'next/server';
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
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    const [{ data: bookings }, { data: sessionAssessments }] = await Promise.all([
      supabase
        .from('bookings')
        .select('id,date,time,type,status,therapist_name,meeting_link')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
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
              resource_pdf_url: sessionAssessment.resource_pdf_url,
              resource_mp4_url: sessionAssessment.resource_mp4_url,
              created_at: sessionAssessment.created_at,
            }
          : null,
      };
    });

    return NextResponse.json({
      averageScore,
      sessionsWithAssessment: scoreList.length,
      timeline,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}