import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const archivedClientId = searchParams.get('archivedClientId');
    const therapistId = searchParams.get('therapistId');

    const supabase = getServiceSupabase();

    let query = supabase
      .from('archived_development_forms')
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
    return NextResponse.json({ forms: data || [] });
  } catch (error) {
    console.error('[Archive Dev Forms GET] Error:', error);
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

    const insertData = {
      archived_client_id: archivedClientId,
      therapist_id: therapistId,

      session_number: data.session_number || null,
      session_date: data.session_date || null,

      previous_session_improvements: data.previous_session_improvements || null,
      previous_session_challenges: data.previous_session_challenges || null,
      pre_session_symptoms: data.pre_session_symptoms || [],
      pre_session_intensity: data.pre_session_intensity ?? 0,
      pre_session_mood: data.pre_session_mood ?? 0,

      techniques_used: data.techniques_used || [],
      targeted_therapy_specify: data.targeted_therapy_specify || null,
      scanning_specify: data.scanning_specify || null,
      key_interventions: data.key_interventions || null,
      breakthroughs_resistance: data.breakthroughs_resistance || null,

      post_session_symptoms: data.post_session_symptoms || [],
      post_session_intensity: data.post_session_intensity ?? 0,
      post_session_mood: data.post_session_mood ?? 0,
      shift_observed: data.shift_observed || null,
      client_feedback: data.client_feedback || null,
      integration_notes: data.integration_notes || null,

      therapist_internal_notes: data.therapist_internal_notes || null,

      nervous_system_score: data.nervous_system_score ?? 0,
      emotional_state_score: data.emotional_state_score ?? 0,
      cognitive_patterns_score: data.cognitive_patterns_score ?? 0,
      body_symptoms_score: data.body_symptoms_score ?? 0,
      behavioral_patterns_score: data.behavioral_patterns_score ?? 0,
      life_functioning_score: data.life_functioning_score ?? 0,
    };

    const { data: result, error } = await supabase
      .from('archived_development_forms')
      .insert(insertData)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, form: result });
  } catch (error) {
    console.error('[Archive Dev Forms POST] Error:', error);
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
      'session_number', 'session_date', 'previous_session_improvements',
      'previous_session_challenges', 'pre_session_symptoms', 'pre_session_intensity',
      'pre_session_mood', 'techniques_used', 'targeted_therapy_specify', 'scanning_specify',
      'key_interventions', 'breakthroughs_resistance', 'post_session_symptoms',
      'post_session_intensity', 'post_session_mood', 'shift_observed',
      'client_feedback', 'integration_notes', 'therapist_internal_notes',
      'nervous_system_score', 'emotional_state_score', 'cognitive_patterns_score',
      'body_symptoms_score', 'behavioral_patterns_score', 'life_functioning_score',
    ];

    for (const field of fields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }

    const { data: result, error } = await supabase
      .from('archived_development_forms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, form: result });
  } catch (error) {
    console.error('[Archive Dev Forms PUT] Error:', error);
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
      .from('archived_development_forms')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Archive Dev Forms DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
