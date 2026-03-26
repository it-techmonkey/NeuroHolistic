import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
    const role = userData?.role;
    if (role !== 'therapist' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const clientId = request.nextUrl.searchParams.get('clientId');
    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Fetch all bookings for this client
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false });

    // Fetch all sessions for this client
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('session_number', { ascending: true });

    // Fetch all assessments (strip internal data for non-admin)
    const { data: assessments } = await supabase
      .from('diagnostic_assessments')
      .select('id, session_id, client_id, therapist_id, is_baseline, main_complaint, current_symptoms, previous_therapy, nervous_system_pattern, nervous_system_score, emotional_state_score, cognitive_patterns_score, body_symptoms_score, behavioral_patterns_score, life_functioning_score, goal_readiness_score, clinical_condition_brief, therapist_focus, therapy_goal, assessed_at, created_at')
      .eq('client_id', clientId)
      .order('assessed_at', { ascending: true });

    // Fetch session development forms (include internal notes for therapist/admin)
    const { data: devForms } = await supabase
      .from('session_development_forms')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    // Fetch materials
    const sessionIds = (sessions ?? []).map(s => s.id);
    let materials: any[] = [];
    if (sessionIds.length > 0) {
      const { data: materialsData } = await supabase
        .from('session_materials')
        .select('*')
        .in('session_id', sessionIds)
        .order('uploaded_at', { ascending: false });
      materials = materialsData ?? [];
    }

    return NextResponse.json({
      bookings: bookings ?? [],
      sessions: sessions ?? [],
      assessments: assessments ?? [],
      devForms: devForms ?? [],
      materials,
    });
  } catch (error) {
    console.error('[Therapist Client Detail]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
