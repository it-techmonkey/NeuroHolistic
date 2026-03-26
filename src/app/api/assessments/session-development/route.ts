import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, clientId, therapistId, data } = body;

    if (!clientId || !therapistId || !sessionId || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Find the actual session ID - it might be a booking ID
    let actualSessionId = sessionId;

    // First, check if this is a booking ID and find the corresponding session
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, program_id, session_number, date')
      .eq('id', sessionId)
      .single();

    if (booking) {
      // This is a booking ID, find the corresponding session
      const { data: existingSession } = await supabase
        .from('sessions')
        .select('id')
        .eq('booking_id', sessionId)
        .single();

      if (existingSession) {
        actualSessionId = existingSession.id;
      } else if (booking.program_id) {
        // No session exists for this booking yet, create one with the program_id
        const { data: newSession, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            program_id: booking.program_id,
            booking_id: sessionId,
            client_id: clientId,
            therapist_id: therapistId,
            session_number: booking.session_number || data.session_number || 1,
            date: booking.date || data.session_date || new Date().toISOString().split('T')[0],
            status: 'scheduled',
          })
          .select()
          .single();

        if (sessionError) {
          console.error('[Session Development] Failed to create session:', sessionError);
          return NextResponse.json({ error: `Failed to create session: ${sessionError.message}` }, { status: 500 });
        }

        actualSessionId = newSession.id;
      } else {
        // Booking has no program_id - this is likely a consultation booking
        return NextResponse.json({ 
          error: 'Development forms can only be submitted for program sessions. This booking is not associated with a program.' 
        }, { status: 400 });
      }
    }

    // Calculate goal readiness score (sum of all domain scores)
    const nervousSystemScore = data.nervous_system_score ?? 5;
    const emotionalStateScore = data.emotional_state_score ?? 5;
    const cognitivePatternsScore = data.cognitive_patterns_score ?? 5;
    const bodySymptomsScore = data.body_symptoms_score ?? 5;
    const behavioralPatternsScore = data.behavioral_patterns_score ?? 5;
    const lifeFunctioningScore = data.life_functioning_score ?? 5;
    const goalReadinessScore = nervousSystemScore + emotionalStateScore + cognitivePatternsScore + 
                               bodySymptomsScore + behavioralPatternsScore + lifeFunctioningScore;

    // Store all structured data properly
    const insertData: Record<string, any> = {
      session_id: actualSessionId,
      client_id: clientId,
      therapist_id: therapistId,
      
      // Pre-session data
      previous_session_improvements: data.previous_session_improvements || null,
      previous_session_challenges: data.previous_session_challenges || null,
      pre_session_symptoms: data.pre_session_symptoms || [],
      pre_session_intensity: data.pre_session_intensity ?? 5,
      pre_session_energy: data.pre_session_intensity ?? 5,
      pre_session_mood: data.pre_session_mood ?? 5,
      pre_session_anxiety: data.pre_session_anxiety ?? data.pre_session_intensity ?? 5,
      
      // Session data
      techniques_used: data.techniques_used || [],
      key_interventions: data.key_interventions || null,
      breakthroughs_resistance: data.breakthroughs_resistance || null,
      
      // Post-session data
      post_session_symptoms: data.post_session_symptoms || [],
      post_session_intensity: data.post_session_intensity ?? 5,
      post_session_energy: data.post_session_energy ?? data.post_session_intensity ?? 5,
      post_session_mood: data.post_session_mood ?? 5,
      post_session_anxiety: data.post_session_anxiety ?? data.post_session_intensity ?? 5,
      shift_observed: data.shift_observed || null,
      client_feedback: data.client_feedback || null,
      
      // Integration notes (visible to client)
      integration_notes: data.integration_notes || null,
      
      // Progress tracking scores (0-10)
      nervous_system_score: nervousSystemScore,
      emotional_state_score: emotionalStateScore,
      cognitive_patterns_score: cognitivePatternsScore,
      body_symptoms_score: bodySymptomsScore,
      behavioral_patterns_score: behavioralPatternsScore,
      life_functioning_score: lifeFunctioningScore,
      goal_readiness_score: goalReadinessScore,
      
      // Therapist internal notes (NOT visible to client)
      therapist_internal_notes: data.therapist_internal_notes || null,
      
      // Legacy fields for backward compatibility
      pre_session_notes: [
        data.previous_session_improvements ? `Improvements: ${data.previous_session_improvements}` : '',
        data.previous_session_challenges ? `Challenges: ${data.previous_session_challenges}` : '',
        data.pre_session_symptoms?.length ? `Symptoms: ${data.pre_session_symptoms.join(', ')}` : '',
      ].filter(Boolean).join('\n') || null,
      post_session_notes: [
        data.shift_observed ? `Shift: ${data.shift_observed}` : '',
        data.client_feedback ? `Feedback: ${data.client_feedback}` : '',
        data.integration_notes ? `Integration: ${data.integration_notes}` : '',
      ].filter(Boolean).join('\n') || null,
      key_insights: [
        data.key_interventions ? `Interventions: ${data.key_interventions}` : '',
        data.breakthroughs_resistance ? `Breakthroughs/Resistance: ${data.breakthroughs_resistance}` : '',
      ].filter(Boolean).join('\n') || null,
      
      homework_assigned: null,
      homework_completed: false,
      
      // Timestamps
      filled_by_therapist_at: new Date().toISOString(),
    };

    const { data: form, error } = await supabase
      .from('session_development_forms')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[Session Development] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the session to mark development form as submitted
    await supabase
      .from('sessions')
      .update({ 
        development_form_submitted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', actualSessionId);

    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('[Session Development] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const clientId = searchParams.get('clientId');
    const therapistId = searchParams.get('therapistId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    let query = supabase
      .from('session_development_forms')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    if (therapistId) {
      query = query.eq('therapist_id', therapistId);
    }

    const { data: forms, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ forms: forms || [] });
  } catch (error) {
    console.error('[Session Development] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
