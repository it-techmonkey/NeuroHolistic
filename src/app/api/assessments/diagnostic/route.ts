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

    // The assessment data to save
    const assessmentData = {
      client_id: clientId,
      therapist_id: therapistId,
      session_id: sessionId || null,
      is_baseline: !existingBaseline, // Only true if no baseline exists
      main_complaint: data.main_complaint,
      current_symptoms: data.current_symptoms || [],
      previous_therapy: data.previous_therapy || false,
      previous_therapy_details: data.previous_therapy_details || null,
      nervous_system_pattern: data.nervous_system_pattern || null,
      nervous_system_score: data.nervous_system_score ?? 5,
      emotional_state_score: data.emotional_state_score ?? 5,
      cognitive_patterns_score: data.cognitive_patterns_score ?? 5,
      body_symptoms_score: data.body_symptoms_score ?? 5,
      behavioral_patterns_score: data.behavioral_patterns_score ?? 5,
      life_functioning_score: data.life_functioning_score ?? 5,
      root_cause_pattern_timeline: data.root_cause_pattern_timeline || null,
      root_cause_parental_influence: data.root_cause_parental_influence || null,
      root_cause_core_patterns: data.root_cause_core_patterns || null,
      root_cause_contributing_factors: data.root_cause_contributing_factors || null,
      clinical_condition_brief: data.clinical_condition_brief || null,
      therapist_focus: data.therapist_focus || null,
      therapy_goal: data.therapy_goal || null,
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
