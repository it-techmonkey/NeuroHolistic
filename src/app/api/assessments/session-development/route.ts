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
        // Return an error indicating development forms require a program session
        return NextResponse.json({ 
          error: 'Development forms can only be submitted for program sessions. This booking is not associated with a program.' 
        }, { status: 400 });
      }
    }

    // Map form data to actual database columns
    // The form uses different field names than the database
    const insertData: Record<string, any> = {
      session_id: actualSessionId,
      client_id: clientId,
      therapist_id: therapistId,
      // Map pre-session intensity to energy/mood/anxiety
      pre_session_energy: data.pre_session_intensity ?? 5,
      pre_session_mood: 5, // Default value - form doesn't have this field
      pre_session_anxiety: data.pre_session_intensity ?? 5,
      pre_session_notes: [
        data.previous_session_improvements ? `Improvements: ${data.previous_session_improvements}` : '',
        data.previous_session_challenges ? `Challenges: ${data.previous_session_challenges}` : '',
        data.pre_session_symptoms?.length ? `Symptoms: ${data.pre_session_symptoms.join(', ')}` : '',
      ].filter(Boolean).join('\n') || null,
      // Map post-session intensity to energy/mood/anxiety
      post_session_energy: data.post_session_intensity ?? 5,
      post_session_mood: 5, // Default value - form doesn't have this field
      post_session_anxiety: data.post_session_intensity ?? 5,
      post_session_notes: [
        data.shift_observed ? `Shift: ${data.shift_observed}` : '',
        data.client_feedback ? `Feedback: ${data.client_feedback}` : '',
        data.integration_notes ? `Integration: ${data.integration_notes}` : '',
      ].filter(Boolean).join('\n') || null,
      // Techniques
      techniques_used: data.techniques_used || [],
      key_insights: [
        data.key_interventions ? `Interventions: ${data.key_interventions}` : '',
        data.breakthroughs_resistance ? `Breakthroughs/Resistance: ${data.breakthroughs_resistance}` : '',
      ].filter(Boolean).join('\n') || null,
      homework_assigned: null,
      homework_completed: false,
      // Internal notes
      therapist_internal_notes: data.therapist_internal_notes || null,
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
