import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const DEMO_PASSWORD = 'NeuroHolistic2024!';

function generateMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return `https://meet.google.com/${chars.slice(0, 3)}-${chars.slice(3, 6)}-${chars.slice(6, 10)}`;
}

function getDate(daysOffset: number): string {
  return new Date(Date.now() + daysOffset * 86400000).toISOString().split('T')[0];
}

// Session-specific times (consistent for each session number)
const SESSION_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
function getSessionTime(sessionNum: number): string {
  return SESSION_TIMES[(sessionNum - 1) % SESSION_TIMES.length];
}

export async function POST() {
  const supabase = getServiceSupabase();
  const results: any = { created: [], errors: [] };

  try {
    // Get therapist (Mariam)
    const { data: therapist } = await supabase
      .from('users').select('id, full_name').eq('email', 'mariam-al-kaisi@neuroholistic.com').single();

    if (!therapist) {
      return NextResponse.json({ error: 'Run seed-therapist-data first' }, { status: 400 });
    }

    const therapistId = therapist.id;
    const therapistName = therapist.full_name;

    // Client email
    const clientEmail = 'demo.progress-report@email.com';
    let clientId: string;

    // Get or create client
    const { data: existingUser } = await supabase
      .from('users').select('id').eq('email', clientEmail).maybeSingle();

    if (existingUser) {
      clientId = existingUser.id;
      results.created.push({ type: 'client', email: clientEmail, status: 'existing' });
    } else {
      const { data: auth } = await supabase.auth.admin.createUser({
        email: clientEmail, password: DEMO_PASSWORD, email_confirm: true,
      });
      if (!auth.user) throw new Error('Failed to create client');
      clientId = auth.user.id;
      await supabase.from('users').insert({
        id: clientId, email: clientEmail, role: 'client',
        full_name: 'Aisha Rahman', phone: '+971551234567', country: 'UAE',
      });
      results.created.push({ type: 'client', email: clientEmail, status: 'created' });
    }

    // Assign therapist
    await supabase.from('therapist_clients').upsert({
      therapist_id: therapistId, client_id: clientId, status: 'active',
    }, { onConflict: 'therapist_id,client_id' });

    // Delete existing bookings for this client to avoid duplicates
    await supabase.from('bookings').delete().eq('user_id', clientId);
    await supabase.from('sessions').delete().eq('client_id', clientId);
    await supabase.from('diagnostic_assessments').delete().eq('client_id', clientId);
    await supabase.from('session_development_forms').delete().eq('client_id', clientId);
    await supabase.from('programs').delete().eq('user_id', clientId);

    // Create free consultation booking
    const { data: consultationBooking } = await supabase.from('bookings').insert({
      user_id: clientId,
      name: 'Aisha Rahman',
      email: clientEmail,
      phone: '+971551234567',
      country: 'UAE',
      therapist_id: therapistId,
      therapist_user_id: therapistId,
      therapist_name: therapistName,
      date: getDate(-70),
      time: '10:00',
      type: 'free_consultation',
      status: 'completed',
      meeting_link: generateMeetLink(),
    }).select().single();
    results.created.push({ type: 'consultation_booking' });

    // Create completed program
    const { data: program } = await supabase.from('programs').insert({
      user_id: clientId,
      therapist_user_id: therapistId,
      therapist_name: therapistName,
      total_sessions: 10,
      used_sessions: 10,
      sessions_completed: 10,
      status: 'completed',
      payment_id: `PAY-${Date.now()}-PROGRESS`,
      program_type: 'private',
      price_paid: 7700,
      client_name: 'Aisha Rahman',
      client_email: clientEmail,
    }).select().single();

    if (!program) throw new Error('Failed to create program');
    results.created.push({ type: 'program', status: 'completed', revenue: 7700 });

    // Create 10 completed program bookings
    for (let i = 1; i <= 10; i++) {
      await supabase.from('bookings').insert({
        user_id: clientId,
        name: 'Aisha Rahman',
        email: clientEmail,
        phone: '+971551234567',
        country: 'UAE',
        therapist_id: therapistId,
        therapist_user_id: therapistId,
        therapist_name: therapistName,
        date: getDate(-70 + (i * 7)),
        time: getSessionTime(i),
        type: 'paid_program',
        status: 'completed',
        session_number: i,
        program_id: program.id,
        meeting_link: generateMeetLink(),
      });
    }

    // Create 10 completed sessions
    for (let i = 1; i <= 10; i++) {
      await supabase.from('sessions').insert({
        program_id: program.id,
        client_id: clientId,
        therapist_id: therapistId,
        session_number: i,
        date: getDate(-70 + (i * 7)),
        time: getSessionTime(i),
        status: 'completed',
        is_complete: true,
        development_form_submitted: true,
        meet_link: generateMeetLink(),
      });
    }
    results.created.push({ type: 'sessions', count: 10 });

    // Create BASELINE assessment (high distress - 45/60)
    await supabase.from('diagnostic_assessments').insert({
      client_id: clientId,
      therapist_id: therapistId,
      session_id: null,
      is_baseline: true,
      nervous_system_pattern: 'hyper',
      nervous_system_score: 8,
      emotional_state_score: 8,
      cognitive_patterns_score: 7,
      body_symptoms_score: 8,
      behavioral_patterns_score: 7,
      life_functioning_score: 7,
      goal_readiness_score: 45,
      main_complaint: 'Chronic anxiety, panic attacks, racing thoughts, insomnia, and emotional overwhelm affecting work and relationships',
      current_symptoms: JSON.stringify(['anxiety', 'overthinking', 'sleep_issues', 'panic_attacks', 'fatigue', 'irritability']),
      previous_therapy: true,
      previous_therapy_details: 'CBT for 3 months - helped with coping strategies but not root causes',
      root_cause_pattern_timeline: 'Since late teens, approximately 8 years',
      root_cause_parental_influence: 'High parental expectations, conditional approval, emotionally unavailable father',
      root_cause_core_patterns: 'Perfectionism, people-pleasing, fear of failure, hypervigilance, self-criticism',
      root_cause_contributing_factors: 'Recent career pressure, relationship breakdown, family illness',
      clinical_condition_brief: 'Generalized anxiety disorder with panic features, sleep disturbance, and perfectionistic traits',
      therapist_focus: 'Nervous system regulation, cognitive restructuring, boundary setting, and self-compassion',
      therapy_goal: 'Reduce anxiety from 8 to 3-4, eliminate panic attacks, improve sleep quality, build self-worth',
      status: 'submitted',
      assessed_at: getDate(-70),
    });
    results.created.push({ type: 'baseline_assessment', score: 45 });

    // Create MID-PROGRAM assessment (session 5 - improving - 28/60)
    await supabase.from('diagnostic_assessments').insert({
      client_id: clientId,
      therapist_id: therapistId,
      session_id: null,
      is_baseline: false,
      nervous_system_pattern: 'mixed',
      nervous_system_score: 5,
      emotional_state_score: 5,
      cognitive_patterns_score: 5,
      body_symptoms_score: 5,
      behavioral_patterns_score: 5,
      life_functioning_score: 4,
      goal_readiness_score: 28,
      main_complaint: 'Anxiety reducing but still struggling with perfectionism',
      current_symptoms: JSON.stringify(['anxiety', 'overthinking', 'fatigue']),
      status: 'submitted',
      assessed_at: getDate(-42),
    });
    results.created.push({ type: 'mid_assessment', score: 28 });

    // Create END-PROGRAM assessment (much better - 15/60)
    await supabase.from('diagnostic_assessments').insert({
      client_id: clientId,
      therapist_id: therapistId,
      session_id: null,
      is_baseline: false,
      nervous_system_pattern: 'regulated',
      nervous_system_score: 3,
      emotional_state_score: 3,
      cognitive_patterns_score: 3,
      body_symptoms_score: 2,
      behavioral_patterns_score: 2,
      life_functioning_score: 2,
      goal_readiness_score: 15,
      main_complaint: 'Significant improvement, minor anxiety in high-stress situations only',
      current_symptoms: JSON.stringify(['mild_anxiety']),
      status: 'submitted',
      assessed_at: getDate(-3),
    });
    results.created.push({ type: 'end_assessment', score: 15 });

    // Create session development forms with progressing scores
    const devFormData = [
      { session: 1, date: -63, nervous: 8, emotional: 8, cognitive: 7, body: 8, behavioral: 7, functioning: 7, readiness: 45, notes: 'Initial assessment. Client presenting high anxiety, panic attacks. Established therapeutic rapport.' },
      { session: 2, date: -56, nervous: 8, emotional: 7, cognitive: 7, body: 8, behavioral: 7, functioning: 7, readiness: 42, notes: 'Explored anxiety triggers. Introduced breathing techniques. Client resistant but willing.' },
      { session: 3, date: -49, nervous: 7, emotional: 7, cognitive: 7, body: 7, behavioral: 7, functioning: 6, readiness: 38, notes: 'Worked on nervous system regulation. Client beginning to notice patterns.' },
      { session: 4, date: -42, nervous: 6, emotional: 6, cognitive: 6, body: 6, behavioral: 6, functioning: 5, readiness: 34, notes: 'Explored family dynamics. Mother relationship identified. Emotional breakthrough.' },
      { session: 5, date: -35, nervous: 5, emotional: 5, cognitive: 5, body: 5, behavioral: 5, functioning: 4, readiness: 28, notes: 'Mid-program. Significant progress. Panic attacks reduced. Sleep improving.' },
      { session: 6, date: -28, nervous: 4, emotional: 4, cognitive: 4, body: 4, behavioral: 4, functioning: 4, readiness: 24, notes: 'Deep work on core wound. Processing childhood experiences. Client resilient.' },
      { session: 7, date: -21, nervous: 4, emotional: 4, cognitive: 4, body: 3, behavioral: 3, functioning: 3, readiness: 20, notes: 'Integration phase. New patterns emerging. Improved relationships.' },
      { session: 8, date: -14, nervous: 3, emotional: 3, cognitive: 3, body: 3, behavioral: 3, functioning: 3, readiness: 18, notes: 'Boundary setting practice. Self-compassion exercises. Reduced self-criticism.' },
      { session: 9, date: -7, nervous: 3, emotional: 3, cognitive: 3, body: 2, behavioral: 2, functioning: 2, readiness: 15, notes: 'Near completion. Client confident in tools. Panic attacks eliminated 5 weeks.' },
      { session: 10, date: -3, nervous: 3, emotional: 3, cognitive: 3, body: 2, behavioral: 2, functioning: 2, readiness: 15, notes: 'Final session. Excellent progress. Maintenance plan established. Follow-up in 3 months.' },
    ];

    for (const dev of devFormData) {
      await supabase.from('session_development_forms').insert({
        session_id: null,
        client_id: clientId,
        therapist_id: therapistId,
        session_number: dev.session,
        session_date: getDate(dev.date),
        previous_session_improvements: dev.session === 1 ? 'Initial session - baseline established' : `Session ${dev.session - 1} progress reviewed`,
        previous_session_challenges: dev.session === 1 ? 'N/A' : 'Ongoing pattern work',
        pre_session_symptoms: JSON.stringify(['anxiety']),
        pre_session_intensity: Math.max(3, 10 - dev.session),
        techniques_used: JSON.stringify(['nervous_system_mapping', 'cognitive_restructuring', 'somatic_awareness', 'breathing_exercises']),
        key_interventions: dev.notes,
        breakthroughs_or_resistance: dev.session === 4 ? 'Emotional breakthrough during inner child work' : 'Cooperative engagement',
        post_session_symptoms: JSON.stringify(['calm', 'awareness']),
        post_session_intensity: Math.max(2, 8 - dev.session),
        shift_observed: 'Reduced anxiety, increased body awareness',
        client_feedback: `Feeling ${dev.session > 5 ? 'much better' : 'more hopeful'}`,
        integration_notes: 'Practice breathing exercises daily, journal emotions, notice triggers',
        therapist_internal_notes: dev.notes,
        nervous_system_score: dev.nervous,
        emotional_state_score: dev.emotional,
        cognitive_patterns_score: dev.cognitive,
        body_symptoms_score: dev.body,
        behavioral_patterns_score: dev.behavioral,
        life_functioning_score: dev.functioning,
        goal_readiness_score: dev.readiness,
        status: 'submitted',
        submitted_at: getDate(dev.date),
      });
    }
    results.created.push({ type: 'dev_forms', count: 10 });

    // Set password
    await supabase.auth.admin.updateUserById(clientId, { password: DEMO_PASSWORD });

    return NextResponse.json({
      success: true,
      password: DEMO_PASSWORD,
      client: {
        email: clientEmail,
        name: 'Aisha Rahman',
        sessionsCompleted: 10,
        assessments: 3,
        baselineScore: 45,
        midScore: 28,
        endScore: 15,
        improvement: '45 → 15 (30 point improvement, 67% reduction)',
      },
      created: results.created,
    });
  } catch (error: any) {
    console.error('[Seed Progress]', error);
    return NextResponse.json({ error: error.message, errors: results.errors }, { status: 500 });
  }
}
