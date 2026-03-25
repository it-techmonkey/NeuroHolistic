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

    const supabase = getServiceSupabase();
    const clientId = user.id;

    // 1. Fetch all bookings for this client
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false });

    const now = new Date();
    const upcomingBookings = (bookings ?? []).filter(b => {
      const bookingDate = new Date(`${b.date}T${b.time}`);
      return b.status === 'confirmed' && bookingDate >= now;
    });
    const pastBookings = (bookings ?? []).filter(b => {
      const bookingDate = new Date(`${b.date}T${b.time}`);
      return b.status === 'completed' || b.status === 'cancelled' || bookingDate < now;
    });

    // 2. Fetch diagnostic assessments
    const { data: assessments } = await supabase
      .from('diagnostic_assessments')
      .select('*')
      .eq('client_id', clientId)
      .order('assessed_at', { ascending: true });

    // 3. Fetch session development forms (strip therapist_internal_notes)
    const { data: devFormsRaw } = await supabase
      .from('session_development_forms')
      .select('id, session_id, client_id, therapist_id, pre_session_energy, pre_session_mood, pre_session_anxiety, pre_session_notes, post_session_energy, post_session_mood, post_session_anxiety, post_session_notes, techniques_used, key_insights, homework_assigned, homework_completed, filled_by_client_at, filled_by_therapist_at, created_at, updated_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    // Strip therapist_internal_notes - clients should never see this
    const devForms = (devFormsRaw ?? []).map(({ therapist_internal_notes, ...rest }: any) => rest);

    // 4. Fetch session materials
    const sessionIds = (devFormsRaw ?? []).map((f: any) => f.session_id).filter(Boolean);
    let materials: any[] = [];
    if (sessionIds.length > 0) {
      const { data: materialsData } = await supabase
        .from('session_materials')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false });
      materials = materialsData ?? [];
    }

    // 5. Fetch therapist info
    const { data: therapistAssignment } = await supabase
      .from('therapist_clients')
      .select('therapist_id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let therapistInfo = null;
    if (therapistAssignment) {
      const { data: therapist } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', therapistAssignment.therapist_id)
        .single();
      therapistInfo = therapist;
    }

    // 6. Fetch active program
    const { data: program } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', clientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 7. Build progress data
    const progressData = [
      ...(assessments ?? []).map(a => ({
        date: a.assessed_at ?? a.created_at,
        type: 'diagnostic' as const,
        goalReadinessScore: a.goal_readiness_score,
        scores: {
          nervous_system: a.nervous_system_score,
          emotional_state: a.emotional_state_score,
          cognitive_patterns: a.cognitive_patterns_score,
          body_symptoms: a.body_symptoms_score,
          behavioral_patterns: a.behavioral_patterns_score,
          life_functioning: a.life_functioning_score,
        },
      })),
      ...(devForms ?? []).map((f: any) => ({
        date: f.session_date,
        type: 'session' as const,
        sessionNumber: f.session_number,
        goalReadinessScore: f.goal_readiness_score,
        scores: {
          nervous_system: f.nervous_system_score,
          emotional_state: f.emotional_state_score,
          cognitive_patterns: f.cognitive_patterns_score,
          body_symptoms: f.body_symptoms_score,
          behavioral_patterns: f.behavioral_patterns_score,
          life_functioning: f.life_functioning_score,
        },
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      upcomingSessions: upcomingBookings,
      pastSessions: pastBookings,
      materials,
      progress: progressData,
      assessments: assessments ?? [],
      therapist: therapistInfo,
      program: program ?? null,
    });
  } catch (error) {
    console.error('[Client Dashboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
