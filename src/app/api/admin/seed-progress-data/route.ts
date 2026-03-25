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

function getRandomTime(): string {
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  return times[Math.floor(Math.random() * times.length)];
}

export async function POST() {
  const supabase = getServiceSupabase();
  const results: any = { created: [], errors: [] };

  try {
    // 1. Get therapist (Mariam)
    const { data: therapist } = await supabase
      .from('users').select('id').eq('email', 'mariam-al-kaisi@neuroholistic.com').single();

    if (!therapist) {
      return NextResponse.json({ error: 'Run seed-therapist-data first' }, { status: 400 });
    }

    const therapistId = therapist.id;

    // 2. Create PROGRESS DEMO CLIENT - Client with full journey for report
    const progressClientEmail = 'demo.progress-report@email.com';
    let progressClientId: string;

    const { data: existingClient } = await supabase
      .from('users').select('id').eq('email', progressClientEmail).single();

    if (existingClient) {
      progressClientId = existingClient.id;
    } else {
      const { data: auth } = await supabase.auth.admin.createUser({
        email: progressClientEmail, password: DEMO_PASSWORD, email_confirm: true,
      });
      if (!auth.user) throw new Error('Failed to create progress client');
      progressClientId = auth.user.id;
      await supabase.from('users').insert({
        id: progressClientId, email: progressClientEmail, role: 'client',
        full_name: 'Aisha Rahman', phone: '+971551234567', country: 'UAE',
      });
    }
    results.created.push({ type: 'client', email: progressClientEmail });

    // Assign therapist
    await supabase.from('therapist_clients').upsert({
      therapist_id: therapistId, client_id: progressClientId, status: 'active',
    }, { onConflict: 'therapist_id,client_id' });

    // Create free consultation booking
    await supabase.from('bookings').insert({
      user_id: progressClientId,
      name: 'Aisha Rahman',
      email: progressClientEmail,
      phone: '+971551234567',
      country: 'UAE',
      therapist_id: therapistId,
      therapist_user_id: therapistId,
      therapist_name: 'Mariam Al Kaisi',
      date: getDate(-63),
      time: '10:00',
      type: 'free_consultation',
      status: 'completed',
      meeting_link: generateMeetLink(),
    });

    // Create completed program
    const { data: program } = await supabase.from('programs').insert({
      user_id: progressClientId, therapist_user_id: therapistId, therapist_name: 'Mariam Al Kaisi',
      total_sessions: 10, used_sessions: 10, sessions_completed: 10,
      status: 'completed', payment_id: `PAY-PROGRESS-${Date.now()}`,
      program_type: 'private', price_paid: 7700,
      client_name: 'Aisha Rahman', client_email: progressClientEmail,
    }).select().single();

    if (!program) throw new Error('Failed to create program');
    results.created.push({ type: 'program', status: 'completed', revenue: 7700 });

    // 3. Create 10 sessions with realistic dates (spanning ~10 weeks)
    for (let i = 1; i <= 10; i++) {
      const sessionDate = getDate(-60 + (i * 7)); // Weekly sessions over 10 weeks
      await supabase.from('sessions').insert({
        program_id: program.id, client_id: progressClientId, therapist_id: therapistId,
        session_number: i, date: sessionDate, time: getRandomTime(),
        status: 'completed', is_complete: true, development_form_submitted: true,
        meet_link: generateMeetLink(),
      });
    }
    results.created.push({ type: 'sessions', count: 10 });

    // 4. Create BASELINE diagnostic assessment (worst scores at start)
    await supabase.from('diagnostic_assessments').insert({
      client_id: progressClientId, therapist_id: therapistId, is_baseline: true,
      main_complaint: 'Chronic anxiety, racing thoughts, difficulty sleeping, and emotional overwhelm affecting work and relationships',
      current_symptoms: ['anxiety', 'overthinking', 'sleep_issues', 'panic_attacks', 'fatigue'],
      previous_therapy: true,
      previous_therapy_details: 'CBT for 3 months, helped with coping but not root causes',
      nervous_system_pattern: 'hyper',
      nervous_system_score: 8,
      emotional_state_score: 8,
      cognitive_patterns_score: 7,
      body_symptoms_score: 8,
      behavioral_patterns_score: 7,
      life_functioning_score: 7,
      goal_readiness_score: 42,
      root_cause_pattern_timeline: 'Since late teens, approximately 8 years',
      root_cause_parental_influence: 'High parental expectations, conditional approval, emotionally unavailable father',
      root_cause_core_patterns: 'Perfectionism, people-pleasing, fear of failure, hypervigilance',
      root_cause_contributing_factors: 'Recent career pressure, relationship breakdown, family illness',
      clinical_condition_brief: 'Generalized anxiety disorder with panic features, sleep disturbance, and perfectionistic traits',
      therapist_focus: 'Nervous system regulation, cognitive restructuring, boundary setting, and self-compassion',
      therapy_goal: 'Reduce anxiety from 8 to 3-4, eliminate panic attacks, improve sleep quality, build self-worth',
      status: 'submitted',
      assessed_at: getDate(-63), // Before first session
    });
    results.created.push({ type: 'baseline_assessment', score: 42 });

    // 5. Create MID-PROGRAM assessment (session 5 - improving)
    await supabase.from('diagnostic_assessments').insert({
      client_id: progressClientId, therapist_id: therapistId, is_baseline: false,
      main_complaint: 'Anxiety reducing but still struggling with perfectionism',
      current_symptoms: ['anxiety', 'overthinking', 'fatigue'],
      previous_therapy: true,
      nervous_system_pattern: 'mixed',
      nervous_system_score: 5,
      emotional_state_score: 5,
      cognitive_patterns_score: 6,
      body_symptoms_score: 5,
      behavioral_patterns_score: 6,
      life_functioning_score: 5,
      goal_readiness_score: 32,
      root_cause_pattern_timeline: 'Gradually improving',
      root_cause_parental_influence: 'Understanding patterns, working through childhood',
      root_cause_core_patterns: 'Recognizing perfectionism, building self-awareness',
      root_cause_contributing_factors: 'Better coping mechanisms',
      clinical_condition_brief: 'Significant improvement in anxiety, ongoing work on core patterns',
      therapist_focus: 'Deep work on family patterns, boundary development, emotional regulation',
      therapy_goal: 'Continue reducing anxiety, address root patterns, build sustainable practices',
      status: 'submitted',
      assessed_at: getDate(-32), // Mid program
    });
    results.created.push({ type: 'mid_assessment', score: 32 });

    // 6. Create END-PROGRAM assessment (session 10 - much better)
    await supabase.from('diagnostic_assessments').insert({
      client_id: progressClientId, therapist_id: therapistId, is_baseline: false,
      main_complaint: 'Significant improvement overall, minor anxiety in high-stress situations',
      current_symptoms: ['mild_anxiety'],
      previous_therapy: true,
      nervous_system_pattern: 'regulated',
      nervous_system_score: 3,
      emotional_state_score: 3,
      cognitive_patterns_score: 4,
      body_symptoms_score: 3,
      behavioral_patterns_score: 3,
      life_functioning_score: 3,
      goal_readiness_score: 16,
      root_cause_pattern_timeline: 'Significantly reduced, tools in place for maintenance',
      root_cause_parental_influence: 'Good understanding, working on forgiveness',
      root_cause_core_patterns: 'Awareness developed, coping strategies effective',
      root_cause_contributing_factors: 'Strong support system, improved work-life balance',
      clinical_condition_brief: 'Major improvement in anxiety, panic attacks resolved, sleep restored',
      therapist_focus: 'Maintenance strategies, relapse prevention, self-compassion practices',
      therapy_goal: 'Sustain progress, develop long-term resilience, continue growth',
      status: 'submitted',
      assessed_at: getDate(-5), // After last session
    });
    results.created.push({ type: 'end_assessment', score: 16 });

    // 7. Create Session Development Forms with progress scores
    const sessionDevData = [
      { session: 1, date: -56, nervous: 8, emotional: 8, cognitive: 7, body: 8, behavioral: 7, functioning: 7, readiness: 42, notes: 'Initial assessment completed. Client presenting with high anxiety. Established rapport and safety.' },
      { session: 2, date: -49, nervous: 8, emotional: 7, cognitive: 7, body: 8, behavioral: 7, functioning: 7, readiness: 40, notes: 'Explored anxiety triggers. Introduced breathing techniques. Client resistant but willing.' },
      { session: 3, date: -42, nervous: 7, emotional: 7, cognitive: 7, body: 7, behavioral: 7, functioning: 6, readiness: 38, notes: 'Worked on nervous system regulation. Client beginning to notice patterns.' },
      { session: 4, date: -35, nervous: 6, emotional: 6, cognitive: 6, body: 7, behavioral: 6, functioning: 6, readiness: 35, notes: 'Exploring family dynamics. Mother relationship identified as key pattern. Emotional breakthrough.' },
      { session: 5, date: -28, nervous: 5, emotional: 5, cognitive: 6, body: 6, behavioral: 6, functioning: 5, readiness: 32, notes: 'Mid-program review. Significant progress noted. Anxiety reducing. Sleep improving.' },
      { session: 6, date: -21, nervous: 5, emotional: 5, cognitive: 5, body: 5, behavioral: 5, functioning: 5, readiness: 28, notes: 'Deep work on core wound. Processing childhood experiences. Client showing resilience.' },
      { session: 7, date: -14, nervous: 4, emotional: 4, cognitive: 5, body: 4, behavioral: 4, functioning: 4, readiness: 24, notes: 'Integration phase beginning. New patterns emerging. Client reports improved relationships.' },
      { session: 8, date: -10, nervous: 4, emotional: 4, cognitive: 4, body: 4, behavioral: 4, functioning: 4, readiness: 20, notes: 'Boundary setting practice. Self-compassion exercises. Reduced self-criticism observed.' },
      { session: 9, date: -7, nervous: 3, emotional: 3, cognitive: 4, body: 3, behavioral: 4, functioning: 3, readiness: 18, notes: 'Near completion. Client confident in new tools. Panic attacks eliminated for 4 weeks.' },
      { session: 10, date: -5, nervous: 3, emotional: 3, cognitive: 4, body: 3, behavioral: 3, functioning: 3, readiness: 16, notes: 'Final session. Excellent progress across all domains. Maintenance plan established. Follow-up in 3 months.' },
    ];

    for (const dev of sessionDevData) {
      await supabase.from('session_development_forms').insert({
        session_id: null,
        client_id: progressClientId,
        therapist_id: therapistId,
        session_number: dev.session,
        session_date: getDate(dev.date),
        previous_session_improvements: dev.session === 1 ? 'Initial session' : `Session ${dev.session - 1} integration progress`,
        previous_session_challenges: dev.session === 1 ? 'N/A' : 'Ongoing pattern work',
        pre_session_symptoms: ['anxiety'],
        pre_session_intensity: Math.max(3, 10 - dev.session),
        techniques_used: ['nervous_system_mapping', 'cognitive_restructuring', 'somatic_awareness'],
        key_interventions: dev.notes,
        breakthroughs_or_resistance: dev.session === 4 ? 'Emotional breakthrough - tears during inner child work' : 'Cooperative, occasional resistance to deep work',
        post_session_symptoms: ['calm', 'awareness'],
        post_session_intensity: Math.max(2, 8 - dev.session),
        shift_observed: `Reduced anxiety, increased body awareness`,
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

    // 8. Also create a SECOND demo client with ACTIVE program for mid-journey report
    const midClientEmail = 'demo.mid-journey@email.com';
    let midClientId: string;

    const { data: existingMidClient } = await supabase
      .from('users').select('id').eq('email', midClientEmail).single();

    if (existingMidClient) {
      midClientId = existingMidClient.id;
    } else {
      const { data: auth } = await supabase.auth.admin.createUser({
        email: midClientEmail, password: DEMO_PASSWORD, email_confirm: true,
      });
      if (!auth.user) throw new Error('Failed to create mid-journey client');
      midClientId = auth.user.id;
      await supabase.from('users').insert({
        id: midClientId, email: midClientEmail, role: 'client',
        full_name: 'Khalid Al-Rashid', phone: '+971509876543', country: 'UAE',
      });
    }
    results.created.push({ type: 'client', email: midClientEmail });

    // Assign therapist
    await supabase.from('therapist_clients').upsert({
      therapist_id: therapistId, client_id: midClientId, status: 'active',
    }, { onConflict: 'therapist_id,client_id' });

    // Create free consultation booking for mid-journey client
    await supabase.from('bookings').insert({
      user_id: midClientId,
      name: 'Khalid Al-Rashid',
      email: midClientEmail,
      phone: '+971509876543',
      country: 'UAE',
      therapist_id: therapistId,
      therapist_user_id: therapistId,
      therapist_name: 'Mariam Al Kaisi',
      date: getDate(-35),
      time: '11:00',
      type: 'free_consultation',
      status: 'completed',
      meeting_link: generateMeetLink(),
    });

    // Create active program (6/10 sessions done)
    const { data: midProgram } = await supabase.from('programs').insert({
      user_id: midClientId, therapist_user_id: therapistId, therapist_name: 'Mariam Al Kaisi',
      total_sessions: 10, used_sessions: 6, sessions_completed: 6,
      status: 'active', payment_id: `PAY-MID-${Date.now()}`,
      program_type: 'private', price_paid: 7700,
      client_name: 'Khalid Al-Rashid', client_email: midClientEmail,
    }).select().single();

    if (!midProgram) throw new Error('Failed to create mid program');
    results.created.push({ type: 'program', status: 'active', sessionsCompleted: 6 });

    // Create 6 completed + 4 upcoming sessions
    for (let i = 1; i <= 10; i++) {
      const isCompleted = i <= 6;
      await supabase.from('sessions').insert({
        program_id: midProgram.id, client_id: midClientId, therapist_id: therapistId,
        session_number: i, date: isCompleted ? getDate(-28 + (i * 4)) : getDate((i - 6) * 7),
        time: getRandomTime(), status: isCompleted ? 'completed' : 'scheduled',
        is_complete: isCompleted, development_form_submitted: isCompleted,
        meet_link: generateMeetLink(),
      });
    }

    // Baseline assessment
    await supabase.from('diagnostic_assessments').insert({
      client_id: midClientId, therapist_id: therapistId, is_baseline: true,
      main_complaint: 'Work stress and relationship difficulties',
      current_symptoms: ['stress', 'irritability', 'sleep_issues'],
      previous_therapy: false,
      nervous_system_pattern: 'hyper',
      nervous_system_score: 7,
      emotional_state_score: 6,
      cognitive_patterns_score: 6,
      body_symptoms_score: 5,
      behavioral_patterns_score: 6,
      life_functioning_score: 6,
      goal_readiness_score: 37,
      root_cause_pattern_timeline: '3-4 years',
      root_cause_parental_influence: 'High expectations from father',
      root_cause_core_patterns: 'Workaholism, emotional suppression',
      root_cause_contributing_factors: 'Career pressure, divorce',
      clinical_condition_brief: 'Adjustment disorder with mixed anxiety and depression',
      therapist_focus: 'Work-life balance, emotional processing, stress management',
      therapy_goal: 'Reduce work stress from 7 to 3-4, improve relationships',
      status: 'submitted',
      assessed_at: getDate(-35),
    });

    // Mid-point assessment
    await supabase.from('diagnostic_assessments').insert({
      client_id: midClientId, therapist_id: therapistId, is_baseline: false,
      main_complaint: 'Improving but still struggles with work-life balance',
      current_symptoms: ['mild_stress', 'occasional_insomnia'],
      previous_therapy: false,
      nervous_system_pattern: 'mixed',
      nervous_system_score: 5,
      emotional_state_score: 5,
      cognitive_patterns_score: 5,
      body_symptoms_score: 4,
      behavioral_patterns_score: 5,
      life_functioning_score: 4,
      goal_readiness_score: 28,
      root_cause_pattern_timeline: 'Gradually improving',
      root_cause_parental_influence: 'Processing expectations',
      root_cause_core_patterns: 'Developing awareness, setting boundaries',
      root_cause_contributing_factors: 'Better coping strategies',
      clinical_condition_brief: 'Moderate improvement, ongoing work on patterns',
      therapist_focus: 'Continued stress management, deeper pattern work',
      therapy_goal: 'Sustain progress, achieve work-life balance',
      status: 'submitted',
      assessed_at: getDate(-14),
    });

    // Dev forms for completed sessions
    for (let i = 1; i <= 6; i++) {
      await supabase.from('session_development_forms').insert({
        session_id: null, client_id: midClientId, therapist_id: therapistId,
        session_number: i, session_date: getDate(-28 + (i * 4)),
        previous_session_improvements: i === 1 ? 'Initial session' : `Session ${i - 1} progress`,
        previous_session_challenges: i === 1 ? 'N/A' : 'Ongoing adjustment',
        pre_session_symptoms: ['stress'],
        pre_session_intensity: Math.max(4, 8 - i),
        techniques_used: ['nervous_system_mapping', 'cognitive_restructuring'],
        key_interventions: `Session ${i} focused interventions`,
        breakthroughs_or_resistance: 'Progressing well',
        post_session_symptoms: ['calmer'],
        post_session_intensity: Math.max(3, 6 - i),
        shift_observed: 'Gradual improvement',
        client_feedback: 'Feeling better',
        integration_notes: 'Practice daily exercises',
        therapist_internal_notes: `Session ${i} - Working on ${i < 3 ? 'stabilization' : i < 5 ? 'processing' : 'integration'} phase`,
        nervous_system_score: Math.max(3, 7 - i),
        emotional_state_score: Math.max(3, 6 - i),
        cognitive_patterns_score: Math.max(3, 6 - i),
        body_symptoms_score: Math.max(2, 5 - i),
        behavioral_patterns_score: Math.max(3, 6 - i),
        life_functioning_score: Math.max(2, 6 - i),
        goal_readiness_score: Math.max(20, 37 - (i * 3)),
        status: 'submitted',
        submitted_at: getDate(-28 + (i * 4)),
      });
    }

    // Set all passwords
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    for (const user of allUsers?.users || []) {
      await supabase.auth.admin.updateUserById(user.id, { password: DEMO_PASSWORD });
    }

    return NextResponse.json({
      success: true,
      password: DEMO_PASSWORD,
      summary: {
        progressReportClient: {
          email: progressClientEmail,
          name: 'Aisha Rahman',
          programStatus: 'completed',
          sessionsCompleted: 10,
          assessments: 3,
          baselineScore: 42,
          midScore: 32,
          endScore: 16,
          improvement: 42 - 16,
        },
        midJourneyClient: {
          email: midClientEmail,
          name: 'Khalid Al-Rashid',
          programStatus: 'active',
          sessionsCompleted: 6,
          assessments: 2,
          baselineScore: 37,
          latestScore: 28,
        },
        revenue: {
          fullPrograms: 2 * 7700,
          singleSessions: 1 * 800,
          total: 2 * 7700 + 800,
        },
      },
      created: results.created,
      errors: results.errors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, errors: results.errors }, { status: 500 });
  }
}
