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

      // Structured columns for Report Card
      gender: data.gender || null,
      nationality: data.nationality || null,
      affected_life_areas: data.affected_life_areas || null,
      affected_life_areas_other: data.affected_life_areas_other || null,
      symptom_duration: data.symptom_duration || null,
      life_impact: data.life_impact || null,
      current_experience_words: data.current_experience_words || null,
      biggest_goal: data.biggest_goal || null,
      transformation_vision: data.transformation_vision || null,
      nervous_system_symptoms: data.nervous_system_symptoms || null,
      nervous_system_symptoms_other: data.nervous_system_symptoms_other || null,
      sleep_symptoms: data.sleep_symptoms || null,
      sleep_symptoms_other: data.sleep_symptoms_other || null,
      sleep_symptoms_score: data.sleep_symptoms_score || null,
      tried_previously: data.tried_previously || null,
      tried_previously_other: data.tried_previously_other || null,
      relationship_quality: data.relationship_quality || null,
      relationship_emotional_safety: data.relationship_emotional_safety || null,
      relationship_challenges: data.relationship_challenges || null,
      relationship_fulfillment_score: data.relationship_fulfillment_score || null,
      has_children: data.has_children || null,
      children_relationship: data.children_relationship || null,
      children_relationship_other: data.children_relationship_other || null,
      parenting_fulfillment_score: data.parenting_fulfillment_score || null,
      employment_status: data.employment_status || null,
      work_fulfillment_score: data.work_fulfillment_score || null,
      work_state: data.work_state || null,
      work_state_other: data.work_state_other || null,
      social_life: data.social_life || null,
      social_life_other: data.social_life_other || null,
      feel_understood: data.feel_understood || null,
      sleep_description: data.sleep_description || null,
      sleep_description_other: data.sleep_description_other || null,
      average_sleep_hours: data.average_sleep_hours || null,
      mother_emotional_presence: data.mother_emotional_presence || null,
      mother_physical_presence: data.mother_physical_presence || null,
      mother_emotional_state: data.mother_emotional_state || null,
      mother_characteristics: data.mother_characteristics || null,
      mother_relationship: data.mother_relationship || null,
      mother_emotional_safety: data.mother_emotional_safety || null,
      mother_longing: data.mother_longing || null,
      father_emotional_presence: data.father_emotional_presence || null,
      father_physical_presence: data.father_physical_presence || null,
      father_emotional_state: data.father_emotional_state || null,
      father_characteristics: data.father_characteristics || null,
      father_relationship: data.father_relationship || null,
      father_emotional_safety: data.father_emotional_safety || null,
      father_longing: data.father_longing || null,
      parents_relationship: data.parents_relationship || null,
      parents_relationship_impact: data.parents_relationship_impact || null,
      birth_order: data.birth_order || null,
      number_of_siblings: data.number_of_siblings || null,
      sibling_age_gap: data.sibling_age_gap || null,
      sibling_relationship: data.sibling_relationship || null,
      family_role: data.family_role || null,
      predominant_nervous_system_state: data.predominant_nervous_system_state || null,
      predominant_emotional_state: data.predominant_emotional_state || null,
      subconscious_patterns: data.subconscious_patterns || null,
      attachment_style_indicators: data.attachment_style_indicators || null,
      possible_root_mechanisms: data.possible_root_mechanisms || null,
      defense_mechanisms: data.defense_mechanisms || null,
      general_presentation_notes: data.general_presentation_notes || null,
      emotional_congruence: data.emotional_congruence || null,
      body_language: data.body_language || null,
      body_language_notes: data.body_language_notes || null,
      resistance_patterns: data.resistance_patterns || null,
      resistance_notes: data.resistance_notes || null,
      key_themes: data.key_themes || null,
      clinical_insights: data.clinical_insights || null,
      therapeutic_priority: data.therapeutic_priority || null,
      recommended_session_frequency: data.recommended_session_frequency || null,
      additional_recommendations: data.additional_recommendations || null,

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
      // Structured columns for Report Card
      'gender', 'nationality', 'affected_life_areas', 'affected_life_areas_other',
      'symptom_duration', 'life_impact', 'current_experience_words', 'biggest_goal',
      'transformation_vision', 'nervous_system_symptoms', 'nervous_system_symptoms_other',
      'sleep_symptoms', 'sleep_symptoms_other', 'sleep_symptoms_score',
      'tried_previously', 'tried_previously_other',
      'relationship_quality', 'relationship_emotional_safety', 'relationship_challenges',
      'relationship_fulfillment_score', 'has_children', 'children_relationship',
      'children_relationship_other', 'parenting_fulfillment_score',
      'employment_status', 'work_fulfillment_score', 'work_state', 'work_state_other',
      'social_life', 'social_life_other', 'feel_understood',
      'sleep_description', 'sleep_description_other', 'average_sleep_hours',
      'mother_emotional_presence', 'mother_physical_presence', 'mother_emotional_state',
      'mother_characteristics', 'mother_relationship', 'mother_emotional_safety', 'mother_longing',
      'father_emotional_presence', 'father_physical_presence', 'father_emotional_state',
      'father_characteristics', 'father_relationship', 'father_emotional_safety', 'father_longing',
      'parents_relationship', 'parents_relationship_impact',
      'birth_order', 'number_of_siblings', 'sibling_age_gap', 'sibling_relationship', 'family_role',
      'predominant_nervous_system_state', 'predominant_emotional_state',
      'subconscious_patterns', 'attachment_style_indicators', 'possible_root_mechanisms',
      'defense_mechanisms', 'general_presentation_notes', 'emotional_congruence',
      'body_language', 'body_language_notes', 'resistance_patterns', 'resistance_notes',
      'key_themes', 'clinical_insights', 'therapeutic_priority',
      'recommended_session_frequency', 'additional_recommendations',
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
