import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { clientId, therapistId, sessionId, data } = body;

    console.log('[Diagnostic Assessment API] Received:', { clientId, therapistId, sessionId });

    if (!therapistId || !data) {
      return NextResponse.json({ error: 'Missing required fields (therapistId, data)' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Try to get client_id from the provided sessionId (could be session or booking ID)
    // Also determine if sessionId is a valid session ID for the foreign key
    let validSessionId: string | null = null;
    
    if (sessionId) {
      // First, check if this is a valid session ID in the sessions table
      const { data: session } = await supabase
        .from('sessions')
        .select('id, client_id')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (session) {
        // It's a valid session - use its ID and client_id
        validSessionId = sessionId;
        if (!clientId && session.client_id) {
          clientId = session.client_id;
        }
      } else {
        // Not a session, check if it's a booking ID
        const { data: booking } = await supabase
          .from('bookings')
          .select('user_id')
          .eq('id', sessionId)
          .maybeSingle();
        
        if (booking?.user_id) {
          clientId = booking.user_id;
        }
        // Don't use booking ID as session_id - FK constraint will fail
        validSessionId = null;
      }
    }

    console.log('[Diagnostic Assessment API] Final clientId:', clientId, 'validSessionId:', validSessionId);

    // If no clientId, try to use client_name from form data as identifier
    // This handles free consultation bookings without user_id
    const clientName = data.client_name || null;
    console.log('[Diagnostic Assessment API] clientName:', clientName);
    
    // Check if a baseline assessment already exists for this client
    let existingBaseline = null;
    
    // Strategy 1: Lookup by client_id (normal case)
    if (clientId) {
      const { data: byClientId } = await supabase
        .from('diagnostic_assessments')
        .select('id')
        .eq('client_id', clientId)
        .eq('is_baseline', true)
        .maybeSingle();
      existingBaseline = byClientId;
      console.log('[Diagnostic Assessment API] Lookup by client_id:', clientId, '-> found:', !!existingBaseline);
    }
    
    // Strategy 2: For free consultations, lookup by therapist + client_name (exact match)
    // This handles cases where client_id is null
    if (!existingBaseline && clientName) {
      const { data: byName } = await supabase
        .from('diagnostic_assessments')
        .select('id')
        .eq('therapist_id', therapistId)
        .eq('client_name', clientName)  // Exact match
        .eq('is_baseline', true)
        .maybeSingle();
      existingBaseline = byName;
      console.log('[Diagnostic Assessment API] Lookup by therapist+name:', { therapistId, clientName }, '-> found:', !!existingBaseline);
    }
    
    // Strategy 3: If still not found, check for any assessment with null client_id for this therapist
    // This is a fallback for cases where the client_name might have changed
    if (!existingBaseline && !clientId) {
      const { data: byTherapist } = await supabase
        .from('diagnostic_assessments')
        .select('id, client_name')
        .eq('therapist_id', therapistId)
        .is('client_id', null)
        .eq('is_baseline', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (byTherapist) {
        existingBaseline = byTherapist;
        console.log('[Diagnostic Assessment API] Found by therapist with null client_id:', byTherapist);
      }
    }
    
    // If we have an existing assessment, update it instead of creating a new one
    if (existingBaseline) {
      console.log('[Diagnostic Assessment API] Will UPDATE existing assessment:', existingBaseline.id);
    } else {
      console.log('[Diagnostic Assessment API] Will CREATE new assessment');
    }

    // If no clientId and no clientName, we can't save the assessment
    if (!clientId && !clientName) {
      return NextResponse.json({ 
        error: 'Cannot submit assessment: No client information available.' 
      }, { status: 400 });
    }

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
    // Use validSessionId (only if it's a valid session ID, otherwise null to avoid FK violation)
    const assessmentData = {
      client_id: clientId,
      therapist_id: therapistId,
      session_id: validSessionId,
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

    const supabase = getServiceSupabase();

    let query = supabase
      .from('diagnostic_assessments')
      .select('*')
      .order('assessed_at', { ascending: false });

    // Filter by clientId if provided, otherwise get all assessments for the therapist
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, action, therapistId } = body;

    if (!assessmentId || !action) {
      return NextResponse.json({ error: 'Missing required fields (assessmentId, action)' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Handle different actions
    if (action === 'mark_complete') {
      // Verify assessment exists and is in 'submitted' status
      const { data: assessment, error: fetchError } = await supabase
        .from('diagnostic_assessments')
        .select('id, status, therapist_id')
        .eq('id', assessmentId)
        .single();

      if (fetchError || !assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      if (assessment.status !== 'submitted') {
        return NextResponse.json({ 
          error: 'Assessment must be in submitted status to mark as complete' 
        }, { status: 400 });
      }

      // Verify the therapist making the request is the one who owns the assessment
      if (therapistId && assessment.therapist_id !== therapistId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Update assessment status to 'completed'
      const { data: updated, error: updateError } = await supabase
        .from('diagnostic_assessments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .select()
        .single();

      if (updateError) {
        console.error('[Diagnostic Assessment] Mark complete error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Diagnostic Assessment] PATCH Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
