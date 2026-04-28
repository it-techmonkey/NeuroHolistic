import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const archivedClientId = searchParams.get('archivedClientId');
    const therapistId = searchParams.get('therapistId');

    const supabase = getServiceSupabase();

    let query = supabase
      .from('archived_assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (archivedClientId) {
      query = query.eq('archived_client_id', archivedClientId);
    }
    if (therapistId) {
      query = query.eq('therapist_id', therapistId);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ assessments: data || [] });
  } catch (error) {
    console.error('[Archive Assessments GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { archivedClientId, therapistId, data } = body;

    if (!archivedClientId || !therapistId || !data) {
      return NextResponse.json({ error: 'archivedClientId, therapistId, and data are required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const assessmentData = {
      archived_client_id: archivedClientId,
      therapist_id: therapistId,

      client_name: data.client_name || null,
      date_of_birth: data.date_of_birth || null,
      client_email: data.client_email || null,
      client_phone: data.client_phone || null,
      client_country: data.client_country || null,
      client_occupation: data.client_occupation || null,
      relationship_status: data.relationship_status || null,

      main_complaint: data.main_complaint,
      current_symptoms: data.current_symptoms || [],

      previous_therapy: data.previous_therapy || false,
      previous_therapy_details: data.previous_therapy_details || null,

      nervous_system_pattern: data.nervous_system_pattern || null,
      emotional_patterns: data.emotional_patterns || [],
      cognitive_patterns: data.cognitive_patterns || [],
      body_symptoms: data.body_symptoms || [],
      behavioral_patterns: data.behavioral_patterns || [],
      life_functioning_patterns: data.life_functioning_patterns || [],

      nervous_system_score: data.nervous_system_score ?? 0,
      emotional_state_score: data.emotional_state_score ?? 0,
      cognitive_patterns_score: data.cognitive_patterns_score ?? 0,
      body_symptoms_score: data.body_symptoms_score ?? 0,
      behavioral_patterns_score: data.behavioral_patterns_score ?? 0,
      life_functioning_score: data.life_functioning_score ?? 0,

      root_cause_pattern_timeline: data.root_cause_pattern_timeline || null,
      root_cause_parental_influence: data.root_cause_parental_influence || null,
      root_cause_core_patterns: data.root_cause_core_patterns || null,
      root_cause_contributing_factors: data.root_cause_contributing_factors || null,

      clinical_condition_brief: data.clinical_condition_brief || null,
      therapist_focus: data.therapist_focus || null,
      therapy_goal: data.therapy_goal || null,

      assessment_date: data.assessment_date || null,
      session_number: data.session_number || null,
      status: 'submitted',
    };

    const { data: result, error } = await supabase
      .from('archived_assessments')
      .insert(assessmentData)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, assessment: result });
  } catch (error) {
    console.error('[Archive Assessments POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, data } = body;

    if (!id || !data) {
      return NextResponse.json({ error: 'id and data are required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const updateData: Record<string, any> = {};
    const fields = [
      'client_name', 'date_of_birth', 'client_email', 'client_phone', 'client_country',
      'client_occupation', 'relationship_status', 'main_complaint', 'current_symptoms',
      'previous_therapy', 'previous_therapy_details', 'nervous_system_pattern',
      'emotional_patterns', 'cognitive_patterns', 'body_symptoms', 'behavioral_patterns',
      'life_functioning_patterns', 'nervous_system_score', 'emotional_state_score',
      'cognitive_patterns_score', 'body_symptoms_score', 'behavioral_patterns_score',
      'life_functioning_score', 'root_cause_pattern_timeline', 'root_cause_parental_influence',
      'root_cause_core_patterns', 'root_cause_contributing_factors',
      'clinical_condition_brief', 'therapist_focus', 'therapy_goal',
      'assessment_date', 'session_number',
    ];

    for (const field of fields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }

    const { data: result, error } = await supabase
      .from('archived_assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, assessment: result });
  } catch (error) {
    console.error('[Archive Assessments PUT] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('archived_assessments')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Archive Assessments DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
