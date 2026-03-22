import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function computeOverallScore(values: number[]): number {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: roleData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (roleData?.role !== 'therapist' && roleData?.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      bookingId,
      nervous_system_score,
      emotional_pattern_score,
      family_imprint_score,
      incident_load_score,
      body_symptom_score,
      current_stress_score,
      therapist_notes,
      observations,
      recommendations,
      resource_pdf_url,
      resource_mp4_url,
    } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const scoreValues = [
      nervous_system_score,
      emotional_pattern_score,
      family_imprint_score,
      incident_load_score,
      body_symptom_score,
      current_stress_score,
    ].map((value) => Number(value));

    if (scoreValues.some((value) => Number.isNaN(value))) {
      return NextResponse.json({ error: 'All score fields must be numeric' }, { status: 400 });
    }

    if (scoreValues.some((value) => value < 0 || value > 10)) {
      return NextResponse.json({ error: 'All score fields must be between 0 and 10' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id,user_id,therapist_user_id,status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (roleData?.role === 'therapist' && booking.therapist_user_id !== user.id) {
      return NextResponse.json({ error: 'This booking is not assigned to you' }, { status: 403 });
    }

    if (!booking.user_id) {
      return NextResponse.json({ error: 'Booking has no linked client account' }, { status: 400 });
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Only confirmed sessions can be marked complete with a post-session assessment.' },
        { status: 409 }
      );
    }

    const { data: existingAssessment } = await supabase
      .from('therapist_session_assessments')
      .select('id')
      .eq('booking_id', booking.id)
      .maybeSingle();

    if (existingAssessment) {
      return NextResponse.json(
        { error: 'Assessment already submitted for this session. Duplicate submissions are not allowed.' },
        { status: 409 }
      );
    }

    const { data: sessionRow } = await supabase
      .from('sessions')
      .select('id')
      .eq('booking_id', booking.id)
      .maybeSingle();

    const overall_dysregulation_score = computeOverallScore(scoreValues);

    const { data: insertedAssessment, error: insertError } = await supabase.from('therapist_session_assessments').insert({
      booking_id: booking.id,
      session_id: sessionRow?.id ?? null,
      therapist_id: user.id,
      client_id: booking.user_id,
      nervous_system_score,
      emotional_pattern_score,
      family_imprint_score,
      incident_load_score,
      body_symptom_score,
      current_stress_score,
      overall_dysregulation_score,
      therapist_notes: therapist_notes ?? null,
      observations: observations ?? null,
      recommendations: recommendations ?? null,
      resource_pdf_url: resource_pdf_url ?? null,
      resource_mp4_url: resource_mp4_url ?? null,
      updated_at: new Date().toISOString(),
    }).select('id').single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabase.from('bookings').update({ status: 'completed' }).eq('id', booking.id);
    await supabase
      .from('sessions')
      .update({
        status: 'completed',
        assessment_score: overall_dysregulation_score,
        assessment_notes: therapist_notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', booking.id);

    return NextResponse.json({
      success: true,
      assessmentId: insertedAssessment?.id ?? null,
      overall_dysregulation_score,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: roleData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (roleData?.role !== 'therapist' && roleData?.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const clientId = request.nextUrl.searchParams.get('clientId');
    const supabase = getServiceSupabase();

    let query = supabase
      .from('therapist_session_assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (roleData?.role === 'therapist') {
      query = query.eq('therapist_id', user.id);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assessments: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
