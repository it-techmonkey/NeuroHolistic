import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { calculateAssessmentScore } from '@/lib/assessment/scoring';
import { AssessmentFormData } from '@/components/assessment/types';
import { createClient } from '@/lib/auth/server';
import { getUserRole } from '@/lib/roles';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    throw new Error(`Missing Supabase configuration: ${missing.join(', ')}`);
  }

  return createServiceClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  console.log('[Assessment API] POST /api/assessments');

  try {
    // Auth: get user from session cookie (optional — allows unauthenticated submissions
    // but attaches user_id when available)
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { raw_responses_json, submitted_at } = body;

    if (!raw_responses_json) {
      return NextResponse.json(
        { success: false, error: 'Missing assessment data (raw_responses_json)' },
        { status: 400 }
      );
    }

    // user_id is always derived from the authenticated session — never from the request body
    const userId = user?.id ?? null;

    if (!userId) {
      console.warn('[Assessment API] Assessment submitted without authentication');
    }

    console.log('[Assessment API] Processing assessment for user:', userId ?? 'anonymous');

    // Calculate scores
    let scores = null;
    let classification = null;
    let recommendation = null;

    try {
      const scoringResult = calculateAssessmentScore(raw_responses_json as AssessmentFormData);
      scores = scoringResult.scores;
      classification = scoringResult.classification;
      recommendation = scoringResult.recommendation;

      if (!scores || scores.overall_dysregulation_score === undefined) {
        return NextResponse.json(
          { success: false, error: 'Invalid assessment data - scoring calculation failed' },
          { status: 400 }
        );
      }
    } catch (scoringError: any) {
      console.error('[Assessment API] Scoring error:', scoringError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to calculate assessment scores: ' + scoringError.message },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const insertPayload = {
      user_id: userId,
      assessment_type: 'initial',
      raw_responses_json,
      nervous_system_score: scores.nervous_system_score,
      emotional_pattern_score: scores.emotional_pattern_score,
      family_imprint_score: scores.family_imprint_score,
      incident_load_score: scores.incident_load_score,
      body_symptom_score: scores.body_symptom_score,
      current_stress_score: scores.current_stress_score,
      overall_dysregulation_score: scores.overall_dysregulation_score,
      overall_severity_band: scores.overall_severity_band,
      nervous_system_type: classification?.nervous_system_type,
      primary_core_wound: classification?.primary_core_wound,
      secondary_core_wound: classification?.secondary_core_wound,
      dominant_parental_influence: classification?.dominant_parental_influence,
      possible_origin_period: classification?.possible_origin_period,
      recommended_phase_primary: recommendation?.recommended_phase_primary,
      recommended_phase_secondary: recommendation?.recommended_phase_secondary,
      submitted_at: submitted_at || new Date().toISOString(),
      status: 'submitted',
    };

    const { data, error } = await supabase
      .from('assessments')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('[Assessment API] Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to store assessment in database: ' + error.message,
          details: error.details || error.hint,
        },
        { status: 500 }
      );
    }

    console.log('[Assessment API] Assessment stored successfully:', data?.id);

    return NextResponse.json(
      {
        success: true,
        assessment_id: data?.id,
        overall_score: scores.overall_dysregulation_score,
        message: 'Assessment submitted successfully',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[Assessment API] Unhandled error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('[Assessment API] GET /api/assessments');

  try {
    // Require authentication for all GET requests
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const forTherapist = request.nextUrl.searchParams.get('therapist') === 'true';
    const supabase = getServiceSupabase();

    if (forTherapist) {
      // Require therapist role to access all client assessments
      const role = await getUserRole(user.id);
      if (role !== 'therapist') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      console.log('[Assessment API] Therapist fetching all client assessments');

      const { data: allAssessments, error } = await supabase
        .from('assessments')
        .select(
          'id, email, overall_dysregulation_score, overall_severity_band, nervous_system_type, primary_core_wound, secondary_core_wound, dominant_parental_influence, possible_origin_period, recommended_phase_primary, recommended_phase_secondary, submitted_at, user_id, nervous_system_score, emotional_pattern_score, family_imprint_score, incident_load_score, body_symptom_score, current_stress_score'
        )
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('[Assessment API] Error:', error.message);
        return NextResponse.json(
          { success: false, error: 'Failed to retrieve assessments' },
          { status: 500 }
        );
      }

      // Group by user_id (or email as fallback) and keep latest per client
      const uniqueByUser = new Map<string, (typeof allAssessments)[0]>();
      allAssessments?.forEach((assessment) => {
        const key = assessment.user_id || assessment.email;
        if (key && !uniqueByUser.has(key)) {
          uniqueByUser.set(key, assessment);
        }
      });

      const latestAssessments = Array.from(uniqueByUser.values());

      console.log('[Assessment API] Returning', latestAssessments.length, 'unique client assessments');

      return NextResponse.json({
        success: true,
        count: latestAssessments.length,
        assessments: latestAssessments,
      });
    } else {
      // Return only the authenticated user's own assessments
      console.log('[Assessment API] Fetching assessments for user:', user.id);

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('[Assessment API] Error:', error.message);
        return NextResponse.json(
          { success: false, error: 'Failed to retrieve assessments' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        count: data?.length ?? 0,
        assessments: data ?? [],
      });
    }
  } catch (err: any) {
    console.error('[Assessment API] Unhandled error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
