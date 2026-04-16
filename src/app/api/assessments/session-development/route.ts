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
    const nervousSystemScore = data.nervous_system_score ?? 0;
    const emotionalStateScore = data.emotional_state_score ?? 0;
    const cognitivePatternsScore = data.cognitive_patterns_score ?? 0;
    const bodySymptomsScore = data.body_symptoms_score ?? 0;
    const behavioralPatternsScore = data.behavioral_patterns_score ?? 0;
    const lifeFunctioningScore = data.life_functioning_score ?? 0;
    // goal_readiness_score is GENERATED ALWAYS - do NOT include in insert
    // PostgreSQL automatically calculates it from the sum of the other scores

    // Store all structured data properly
    const insertData: Record<string, any> = {
      session_id: actualSessionId,
      client_id: clientId,
      therapist_id: therapistId,

      // Pre-session data
      previous_session_improvements: data.previous_session_improvements || null,
      previous_session_challenges: data.previous_session_challenges || null,
      pre_session_symptoms: data.pre_session_symptoms || [],
      pre_session_intensity: data.pre_session_intensity ?? 0,
      pre_session_mood: data.pre_session_mood ?? 0,

      // Session data
      techniques_used: data.techniques_used || [],
      targeted_therapy_specify: data.targeted_therapy_specify || null,
      scanning_specify: data.scanning_specify || null,
      key_interventions: data.key_interventions || null,
      breakthroughs_resistance: data.breakthroughs_resistance || null,

      // Post-session data
      post_session_symptoms: data.post_session_symptoms || [],
      post_session_intensity: data.post_session_intensity ?? 0,
      post_session_mood: data.post_session_mood ?? 0,
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
      // NOTE: goal_readiness_score is NOT included - it's a GENERATED ALWAYS column

      // Therapist internal notes (NOT visible to client)
      therapist_internal_notes: data.therapist_internal_notes || null,

      // Timestamps
      filled_by_therapist_at: new Date().toISOString(),
    };

    // Check if a form already exists for this session
    const { data: existingFormData } = await supabase
      .from('session_development_forms')
      .select('id')
      .eq('session_id', actualSessionId)
      .maybeSingle();

    const getMissingColumnFromError = (message?: string | null): string | null => {
      if (!message) return null;
      const match = message.match(/Could not find the '([^']+)' column/i);
      return match?.[1] ?? null;
    };

    const writeFormWithFallback = async (isUpdate: boolean, formId?: string) => {
      const payload = { ...insertData };
      const removedColumns: string[] = [];

      let lastErrorMessage: string | null = null;
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const result = isUpdate
          ? await supabase
              .from('session_development_forms')
              .update(payload)
              .eq('id', formId!)
              .select()
              .single()
          : await supabase
              .from('session_development_forms')
              .insert(payload)
              .select()
              .single();

        if (!result.error) {
          if (removedColumns.length > 0) {
            console.warn(
              '[Session Development] Missing columns skipped in this environment:',
              removedColumns
            );
          }
          return { data: result.data, error: null as string | null };
        }

        lastErrorMessage = result.error.message;
        const missingColumn = getMissingColumnFromError(result.error.message);
        if (!missingColumn || !(missingColumn in payload)) {
          return { data: null, error: result.error.message };
        }

        delete payload[missingColumn];
        removedColumns.push(missingColumn);
      }

      return {
        data: null,
        error: `Failed to save session development form after schema compatibility retries. Last error: ${lastErrorMessage || 'unknown'}`,
      };
    };

    const result = existingFormData
      ? await writeFormWithFallback(true, existingFormData.id)
      : await writeFormWithFallback(false);

    if (result.error) {
      console.error('[Session Development] Save error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const form = result.data;

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

    // Map booking ID to session ID if needed
    let actualSessionId = sessionId;
    if (sessionId) {
      // Check if this is a booking ID and find the corresponding session
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, program_id')
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
        }
        // If no session exists, actualSessionId remains booking ID (no dev forms yet)
      }
    }

    // Fetch dev forms
    let query = supabase
      .from('session_development_forms')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (actualSessionId) {
      query = query.eq('session_id', actualSessionId);
    }

    if (therapistId) {
      query = query.eq('therapist_id', therapistId);
    }

    const { data: formsRaw, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch sessions to build session_number map
    const sessionIds = (formsRaw ?? []).map((f: any) => f.session_id).filter(Boolean);
    let sessionNumberMap = new Map<string, number>();

    if (sessionIds.length > 0) {
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('id, session_number')
        .in('id', sessionIds);

      (sessionsData ?? []).forEach((s: any) => {
        if (s.id && s.session_number) {
          sessionNumberMap.set(s.id, s.session_number);
        }
      });
    }

    // Add session_number to each form
    const forms = (formsRaw ?? []).map((f: any) => ({
      ...f,
      session_number: sessionNumberMap.get(f.session_id) ?? null,
    }));

    return NextResponse.json({ forms });
  } catch (error) {
    console.error('[Session Development] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
