import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, therapistId, sessionId, data } = body;

    if (!clientId || !therapistId || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Check if a baseline assessment already exists for this client
    const { data: existingBaseline } = await supabase
      .from('diagnostic_assessments')
      .select('id')
      .eq('client_id', clientId)
      .eq('is_baseline', true)
      .maybeSingle();

    // Calculate goal readiness score (sum of all domain scores)
    const nervousSystemScore = data.nervous_system_score ?? 5;
    const emotionalStateScore = data.emotional_state_score ?? 5;
    const cognitivePatternsScore = data.cognitive_patterns_score ?? 5;
    const bodySymptomsScore = data.body_symptoms_score ?? 5;
    const behavioralPatternsScore = data.behavioral_patterns_score ?? 5;
    const lifeFunctioningScore = data.life_functioning_score ?? 5;
    // goal_readiness_score is GENERATED ALWAYS - do NOT include in insert
    // PostgreSQL automatically calculates it from the sum of the other scores

    // The assessment data to save - includes ALL form fields
    const assessmentData = {
      client_id: clientId,
      therapist_id: therapistId,
      session_id: sessionId || null,
      is_baseline: !existingBaseline, // Only true if no baseline exists
      
      // Client demographic information
      client_name: data.client_name || null,
      date_of_birth: data.date_of_birth || null,
      client_email: data.client_email || null,
      client_phone: data.client_phone || null,
      client_country: data.client_country || null,
      client_occupation: data.client_occupation || null,
      relationship_status: data.relationship_status || null,
      
      // Main concerns
      main_complaint: data.main_complaint,
      current_symptoms: data.current_symptoms || [],
      
      // Previous therapy
      previous_therapy: data.previous_therapy || false,
      previous_therapy_details: data.previous_therapy_details || null,
      
      // Core assessment - patterns
      nervous_system_pattern: data.nervous_system_pattern || null,
      emotional_patterns: data.emotional_patterns || [],
      cognitive_patterns: data.cognitive_patterns || [],
      body_symptoms: data.body_symptoms || [],
      behavioral_patterns: data.behavioral_patterns || [],
      life_functioning_patterns: data.life_functioning_patterns || [],
      
      // Core assessment - scores (0-10)
      nervous_system_score: nervousSystemScore,
      emotional_state_score: emotionalStateScore,
      cognitive_patterns_score: cognitivePatternsScore,
      body_symptoms_score: bodySymptomsScore,
      behavioral_patterns_score: behavioralPatternsScore,
      life_functioning_score: lifeFunctioningScore,
      
      // Root cause analysis
      root_cause_pattern_timeline: data.root_cause_pattern_timeline || null,
      root_cause_parental_influence: data.root_cause_parental_influence || null,
      root_cause_core_patterns: data.root_cause_core_patterns || null,
      root_cause_contributing_factors: data.root_cause_contributing_factors || null,
      
      // Clinical summary
      clinical_condition_brief: data.clinical_condition_brief || null,
      therapist_focus: data.therapist_focus || null,
      therapy_goal: data.therapy_goal || null,
      
      // NOTE: goal_readiness_score is NOT included - it's a GENERATED ALWAYS column
      // PostgreSQL automatically calculates it from the sum of domain scores
      
      status: 'submitted',
      assessed_at: new Date().toISOString(),
    };

    let assessment;
    let error;

    if (existingBaseline) {
      // Update existing baseline assessment
      const result = await supabase
        .from('diagnostic_assessments')
        .update(assessmentData)
        .eq('id', existingBaseline.id)
        .select()
        .single();
      assessment = result.data;
      error = result.error;
    } else {
      // Insert new baseline assessment
      const result = await supabase
        .from('diagnostic_assessments')
        .insert(assessmentData)
        .select()
        .single();
      assessment = result.data;
      error = result.error;
    }

    if (error) {
      console.error('[Diagnostic Assessment] Save error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: assessment });
  } catch (error) {
    console.error('[Diagnostic Assessment] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const therapistId = searchParams.get('therapistId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    let query = supabase
      .from('diagnostic_assessments')
      .select('*')
      .eq('client_id', clientId)
      .order('assessed_at', { ascending: false });

    if (therapistId) {
      query = query.eq('therapist_id', therapistId);
    }

    const { data: assessments, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assessments: assessments || [] });
  } catch (error) {
    console.error('[Diagnostic Assessment] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
