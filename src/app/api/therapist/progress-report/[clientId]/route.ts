import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const supabase = getServiceSupabase();

    // 1. Get client info
    const { data: client, error: clientError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, created_at')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found', details: clientError?.message }, { status: 404 });
    }

    // 2. Get therapist assignment
    const { data: assignment } = await supabase
      .from('therapist_clients')
      .select('therapist_id')
      .eq('client_id', clientId)
      .maybeSingle();

    let therapist = null;
    if (assignment) {
      const { data: t } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', assignment.therapist_id)
        .single();
      therapist = t;
    }

    // 3. Get all diagnostic assessments
    const { data: assessments } = await supabase
      .from('diagnostic_assessments')
      .select('*')
      .eq('client_id', clientId)
      .order('assessed_at', { ascending: true });

    // 4. Get all session development forms
    const { data: devForms } = await supabase
      .from('session_development_forms')
      .select('*')
      .eq('client_id', clientId)
      .order('session_date', { ascending: true });

    // 5. Get program info
    const { data: program } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 6. Get all bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: true });

    // 7. Compute baseline vs latest scores
    const baselineAssessment = (assessments ?? []).find(a => a.is_baseline);
    const latestAssessment = (assessments ?? []).at(-1);

    const baselineScores = baselineAssessment ? {
      nervous_system: baselineAssessment.nervous_system_score ?? 0,
      emotional_state: baselineAssessment.emotional_state_score ?? 0,
      cognitive_patterns: baselineAssessment.cognitive_patterns_score ?? 0,
      body_symptoms: baselineAssessment.body_symptoms_score ?? 0,
      behavioral_patterns: baselineAssessment.behavioral_patterns_score ?? 0,
      life_functioning: baselineAssessment.life_functioning_score ?? 0,
      goal_readiness: baselineAssessment.goal_readiness_score ?? 0,
    } : null;

    const latestScores = latestAssessment ? {
      nervous_system: latestAssessment.nervous_system_score ?? 0,
      emotional_state: latestAssessment.emotional_state_score ?? 0,
      cognitive_patterns: latestAssessment.cognitive_patterns_score ?? 0,
      body_symptoms: latestAssessment.body_symptoms_score ?? 0,
      behavioral_patterns: latestAssessment.behavioral_patterns_score ?? 0,
      life_functioning: latestAssessment.life_functioning_score ?? 0,
      goal_readiness: latestAssessment.goal_readiness_score ?? 0,
    } : null;

    // 8. Build progress timeline
    const progressTimeline = [
      ...(assessments ?? []).map(a => ({
        date: a.assessed_at,
        type: 'diagnostic' as const,
        isBaseline: a.is_baseline,
        goalReadinessScore: a.goal_readiness_score ?? 0,
        scores: {
          nervous_system: a.nervous_system_score ?? 0,
          emotional_state: a.emotional_state_score ?? 0,
          cognitive_patterns: a.cognitive_patterns_score ?? 0,
          body_symptoms: a.body_symptoms_score ?? 0,
          behavioral_patterns: a.behavioral_patterns_score ?? 0,
          life_functioning: a.life_functioning_score ?? 0,
        },
        notes: a.therapist_focus,
      })),
      ...(devForms ?? []).map(f => ({
        date: f.session_date,
        type: 'session' as const,
        sessionNumber: f.session_number,
        goalReadinessScore: f.goal_readiness_score ?? 0,
        scores: {
          nervous_system: f.nervous_system_score ?? 0,
          emotional_state: f.emotional_state_score ?? 0,
          cognitive_patterns: f.cognitive_patterns_score ?? 0,
          body_symptoms: f.body_symptoms_score ?? 0,
          behavioral_patterns: f.behavioral_patterns_score ?? 0,
          life_functioning: f.life_functioning_score ?? 0,
        },
        integrationNotes: f.integration_notes,
        internalNotes: f.therapist_internal_notes,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 9. Build therapist notes summary
    const therapistNotesSummary = (devForms ?? [])
      .filter(f => f.therapist_internal_notes)
      .map(f => ({
        sessionNumber: f.session_number,
        date: f.session_date,
        notes: f.therapist_internal_notes,
      }));

    // Calculate score improvement
    let scoreImprovement = null;
    if (baselineScores && latestScores) {
      scoreImprovement = {
        nervous_system: latestScores.nervous_system - baselineScores.nervous_system,
        emotional_state: latestScores.emotional_state - baselineScores.emotional_state,
        cognitive_patterns: latestScores.cognitive_patterns - baselineScores.cognitive_patterns,
        body_symptoms: latestScores.body_symptoms - baselineScores.body_symptoms,
        behavioral_patterns: latestScores.behavioral_patterns - baselineScores.behavioral_patterns,
        life_functioning: latestScores.life_functioning - baselineScores.life_functioning,
        goal_readiness: latestScores.goal_readiness - baselineScores.goal_readiness,
      };
    }

    return NextResponse.json({
      client: {
        id: client.id,
        fullName: client.full_name,
        email: client.email,
        phone: client.phone,
        joinedAt: client.created_at,
      },
      therapist: therapist ? { id: therapist.id, name: therapist.full_name } : null,
      program: program ? {
        status: program.status,
        totalSessions: program.total_sessions,
        sessionsCompleted: program.sessions_completed,
        type: program.program_type,
      } : null,
      baselineScores,
      latestScores,
      scoreImprovement,
      progressTimeline,
      assessmentsCount: (assessments ?? []).length,
      devFormsCount: (devForms ?? []).length,
      sessionsCompleted: (bookings ?? []).filter(b => b.status === 'completed').length,
      therapistNotesSummary,
      allAssessments: assessments,
      allDevForms: devForms,
    });
  } catch (error) {
    console.error('[Progress Report]', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
