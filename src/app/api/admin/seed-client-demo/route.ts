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
  const code = Math.random().toString(36).substring(2, 11);
  return `https://meet.google.com/${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6)}`;
}

function getDate(daysOffset: number): string {
  return new Date(Date.now() + daysOffset * 86400000).toISOString().split('T')[0];
}

// Session-specific times (no randomness - realistic schedule)
const SESSION_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
function getSessionTime(sessionNum: number): string {
  return SESSION_TIMES[(sessionNum - 1) % SESSION_TIMES.length];
}

// Realistic session materials with proper descriptions
const SESSION_MATERIALS = {
  1: [
    { type: 'pdf', name: 'Welcome Guide & What to Expect', desc: 'Introduction to the NeuroHolistic method' },
    { type: 'pdf', name: 'Breathing Exercise Guide', desc: '4-7-8 breathing technique with illustrations' },
  ],
  2: [
    { type: 'pdf', name: 'Understanding Your Nervous System', desc: 'Basics of fight/flight/freeze responses' },
    { type: 'audio', name: 'Guided Body Scan Meditation', desc: '15-minute body awareness practice' },
  ],
  3: [
    { type: 'pdf', name: 'Emotional Awareness Worksheet', desc: 'Identifying and naming emotions' },
    { type: 'video', name: 'Grounding Techniques Tutorial', desc: '5-4-3-2-1 sensory grounding method' },
  ],
  4: [
    { type: 'pdf', name: 'Boundary Setting Guide', desc: 'How to establish healthy boundaries' },
    { type: 'pdf', name: 'Weekly Self-Care Planner', desc: 'Template for planning self-care activities' },
  ],
  5: [
    { type: 'pdf', name: 'Mid-Program Progress Report', desc: 'Summary of progress and next steps' },
    { type: 'audio', name: 'Self-Compassion Meditation', desc: '20-minute loving-kindness practice' },
  ],
  6: [
    { type: 'pdf', name: 'Emotional Vocabulary Builder', desc: 'Expanded list of emotions and their meanings' },
    { type: 'pdf', name: 'Journal Prompts Collection', desc: '30 prompts for emotional processing' },
  ],
  7: [
    { type: 'pdf', name: 'Sleep Hygiene Guide', desc: 'Evidence-based tips for better sleep' },
    { type: 'video', name: 'Creating Your Self-Care Routine', desc: 'Step-by-step guide to building sustainable habits' },
  ],
  8: [
    { type: 'pdf', name: 'Assertive Communication Guide', desc: 'Using "I" statements and expressing needs' },
    { type: 'audio', name: 'Evening Wind-Down Meditation', desc: '10-minute relaxation for better sleep' },
  ],
  9: [
    { type: 'pdf', name: 'Growth Reflection Worksheet', desc: 'Celebrating your progress and achievements' },
    { type: 'pdf', name: 'Relapse Prevention Plan', desc: 'Maintaining progress after therapy ends' },
  ],
  10: [
    { type: 'pdf', name: 'Completion Certificate', desc: 'Certificate of program completion' },
    { type: 'pdf', name: 'Self-Management Toolkit', desc: 'All techniques learned, summarized for reference' },
    { type: 'video', name: 'Your Journey Forward', desc: 'Personalized video message from therapist' },
  ],
};

// Realistic integration homework for each session
const INTEGRATION_NOTES = {
  1: 'Practice the 4-7-8 breathing technique twice daily (morning and before bed). Notice moments of anxiety without trying to change them - just observe.',
  2: 'Do the body scan meditation each morning for 10 minutes. Keep a brief journal of emotional triggers - just note what happened and what you felt.',
  3: 'Use the 5-4-3-2-1 grounding technique when feeling overwhelmed. Practice naming your emotions specifically (not just "bad" but "frustrated" or "disappointed").',
  4: 'Set one small boundary this week. It can be saying "no" to a minor request or taking 10 minutes for yourself. Notice how it feels.',
  5: 'Practice self-compassion meditation 3 times this week. When you notice your inner critic, acknowledge it with kindness rather than fighting it.',
  6: 'Use the emotional vocabulary list to identify 3 emotions each day. Journal about one significant emotional experience.',
  7: 'Implement the sleep hygiene recommendations. Create a 30-minute wind-down routine before bed. Plan your self-care activities for the coming week.',
  8: 'Practice assertive communication in one situation this week. Use "I feel... when... because... I need..." format.',
  9: 'Write down three things you are proud of from the past 10 weeks. Review your journal entries from session 1 to see how far you have come.',
  10: 'Continue all practices that work for you. Schedule a follow-up check-in in 4 weeks. Remember: you now have the tools to manage your wellbeing.',
};

// Realistic therapist notes for each session
const THERAPIST_NOTES = {
  1: 'Baseline session. Client presents with high anxiety, perfectionism, and sleep issues. Nervous system shows hyperarousal patterns. Good rapport established. Treatment plan discussed.',
  2: 'Psychoeducation on nervous system. Client engaged well with body scan exercise. Identified connection between physical tension and anxiety. Homework compliance good.',
  3: 'Breakthrough session - client able to identify specific triggers related to work pressure. Emotional awareness improving. Grounding techniques practiced in session.',
  4: 'Explored family dynamics and boundary patterns. Client had significant insight about people-pleasing tendencies. First boundary set successfully with colleague.',
  5: 'Mid-point assessment. Client reports decreased anxiety, improved sleep. Self-compassion work resonating. Perfectionism still present but more awareness.',
  6: 'Deeper emotional processing. Client able to sit with uncomfortable emotions without immediate reaction. Emotional vocabulary expanding. Integration phase beginning.',
  7: 'Sleep improved significantly. Self-care routine established. Client showing more confidence and self-awareness. Transitioning to maintenance phase.',
  8: 'Assertive communication skills developing. Client set boundary with family member successfully. Confidence growing. New patterns becoming habitual.',
  9: 'Near completion. Client reflecting on growth. Able to identify automatic negative thoughts and challenge them. Stronger sense of self.',
  10: 'Final session. Excellent outcome. Client demonstrates mastery of techniques, improved emotional regulation, better sleep, and healthier boundaries. Empowered and confident moving forward.',
};

// Realistic session content summaries for development forms
const SESSION_SUMMARIES = {
  1: { focus: 'Initial assessment and treatment planning', techniques: 'Clinical interview, intake assessment, psychoeducation' },
  2: { focus: 'Nervous system regulation basics', techniques: 'Body scan, breathing exercises, somatic awareness' },
  3: { focus: 'Emotional awareness and trigger identification', techniques: 'Grounding, emotional labeling, trigger mapping' },
  4: { focus: 'Boundary setting and family patterns', techniques: 'Family systems exploration, boundary role-play' },
  5: { focus: 'Self-compassion and inner critic work', techniques: 'Loving-kindness meditation, cognitive restructuring' },
  6: { focus: 'Emotional processing and integration', techniques: 'Emotion-focused therapy, experiential exercises' },
  7: { focus: 'Self-care and sleep optimization', techniques: 'Sleep hygiene, routine building, self-care planning' },
  8: { focus: 'Assertive communication skills', techniques: 'Communication training, role-play, "I" statements' },
  9: { focus: 'Consolidation and relapse prevention', techniques: 'Review of progress, future planning, maintenance strategies' },
  10: { focus: 'Program completion and transition', techniques: 'Final assessment, celebration, follow-up planning' },
};

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

    // Demo client for client dashboard showcase
    const clientEmail = 'demo.client-dashboard@email.com';
    let clientId: string;

    // Get or create client
    const { data: existingUser } = await supabase
      .from('users').select('id').eq('email', clientEmail).maybeSingle();

    if (existingUser) {
      clientId = existingUser.id;
      // Delete existing data for fresh seed
      await supabase.from('bookings').delete().eq('user_id', clientId);
      await supabase.from('sessions').delete().eq('client_id', clientId);
      await supabase.from('diagnostic_assessments').delete().eq('client_id', clientId);
      await supabase.from('session_development_forms').delete().eq('client_id', clientId);
      
      // Delete materials
      const { data: sessionIds } = await supabase.from('sessions').select('id').eq('client_id', clientId);
      if (sessionIds?.length) {
        await supabase.from('session_materials').delete().in('session_id', sessionIds.map(s => s.id));
      }
      
      await supabase.from('programs').delete().eq('user_id', clientId);
      await supabase.from('therapist_clients').delete().eq('client_id', clientId);
      results.created.push({ type: 'client', email: clientEmail, status: 'reset' });
    } else {
      const { data: auth } = await supabase.auth.admin.createUser({
        email: clientEmail, password: DEMO_PASSWORD, email_confirm: true,
      });
      if (!auth.user) throw new Error('Failed to create client');
      clientId = auth.user.id;
      await supabase.from('users').insert({
        id: clientId, email: clientEmail, role: 'client',
        full_name: 'Nadia Al-Mansouri', phone: '+971501234567', country: 'UAE',
      });
      results.created.push({ type: 'client', email: clientEmail, status: 'created' });
    }

    // Assign therapist
    await supabase.from('therapist_clients').upsert({
      therapist_id: therapistId, client_id: clientId, status: 'active',
    }, { onConflict: 'therapist_id,client_id' });

    // Create free consultation booking
    await supabase.from('bookings').insert({
      user_id: clientId, name: 'Nadia Al-Mansouri', email: clientEmail, phone: '+971501234567',
      therapist_id: therapistId, therapist_user_id: therapistId, therapist_name: therapistName,
      date: getDate(-77), time: '10:00', type: 'free_consultation', status: 'completed',
      meeting_link: generateMeetLink(),
    });
    results.created.push({ type: 'consultation' });

    // Create completed program
    const { data: program } = await supabase.from('programs').insert({
      user_id: clientId, therapist_user_id: therapistId, therapist_name: therapistName,
      total_sessions: 10, used_sessions: 10, sessions_completed: 10, status: 'completed',
      payment_id: `PAY-${Date.now()}`, program_type: 'private', price_paid: 7700,
      client_name: 'Nadia Al-Mansouri', client_email: clientEmail,
    }).select().single();

    results.created.push({ type: 'program', revenue: 7700 });

    // Create 10 program bookings and sessions with proper data
    for (let i = 1; i <= 10; i++) {
      const sessionDate = getDate(-77 + (i * 7));
      const sessionTime = getSessionTime(i);
      const meetLink = generateMeetLink();
      const summary = SESSION_SUMMARIES[i as keyof typeof SESSION_SUMMARIES];

      // Create booking
      await supabase.from('bookings').insert({
        user_id: clientId, name: 'Nadia Al-Mansouri', email: clientEmail, phone: '+971501234567',
        therapist_id: therapistId, therapist_user_id: therapistId, therapist_name: therapistName,
        date: sessionDate, time: sessionTime, type: 'program', status: 'completed',
        session_number: i, program_id: program.id, meeting_link: meetLink,
      });

      // Create session
      await supabase.from('sessions').insert({
        program_id: program.id, client_id: clientId, therapist_id: therapistId,
        session_number: i, date: sessionDate, time: sessionTime,
        status: 'completed', is_complete: true, development_form_submitted: true, meet_link: meetLink,
        focus_area: summary.focus,
        techniques_used: summary.techniques,
      });
    }
    results.created.push({ type: 'bookings_sessions', count: 10 });

    // Create assessments showing realistic progress (scores decrease = improvement)
    // Lower scores = less distress/better wellbeing
    const assessments = [
      { 
        baseline: true, 
        nervous: 8, emotional: 8, cognitive: 8, body: 7, behavioral: 7, functioning: 7, 
        score: 45, 
        date: getDate(-77), 
        pattern: 'hyper',
        complaint: 'Persistent anxiety and overthinking, difficulty sleeping, constant worry about work performance',
        symptoms: JSON.stringify(['anxiety', 'overthinking', 'insomnia', 'muscle tension', 'irritability']),
      },
      { 
        baseline: false, 
        nervous: 5, emotional: 5, cognitive: 5, body: 4, behavioral: 5, functioning: 4, 
        score: 28, 
        date: getDate(-42), 
        pattern: 'mixed',
        complaint: 'Improved but still experiencing occasional anxiety episodes, sleep improving',
        symptoms: JSON.stringify(['mild anxiety', 'occasional overthinking', 'improving sleep']),
      },
      { 
        baseline: false, 
        nervous: 3, emotional: 3, cognitive: 3, body: 3, behavioral: 3, functioning: 3, 
        score: 18, 
        date: getDate(-7), 
        pattern: 'regulated',
        complaint: 'Significant improvement in all areas, feeling more in control and at peace',
        symptoms: JSON.stringify(['minimal anxiety', 'better emotional regulation', 'good sleep']),
      },
    ];

    for (const a of assessments) {
      await supabase.from('diagnostic_assessments').insert({
        client_id: clientId, therapist_id: therapistId, is_baseline: a.baseline,
        nervous_system_pattern: a.pattern, nervous_system_score: a.nervous,
        emotional_state_score: a.emotional, cognitive_patterns_score: a.cognitive,
        body_symptoms_score: a.body, behavioral_patterns_score: a.behavioral,
        life_functioning_score: a.functioning, goal_readiness_score: a.score,
        status: 'submitted', assessed_at: a.date,
        main_complaint: a.complaint,
        current_symptoms: a.symptoms,
        previous_therapy: true,
      });
    }
    results.created.push({ type: 'assessments', count: 3, scores: [45, 28, 18] });

    // Create session development forms with realistic data
    const devForms = [
      { session: 1, date: -70, nervous: 8, emotional: 8, cognitive: 8, body: 7, behavioral: 7, functioning: 7, readiness: 45 },
      { session: 2, date: -63, nervous: 7, emotional: 7, cognitive: 7, body: 7, behavioral: 7, functioning: 7, readiness: 42 },
      { session: 3, date: -56, nervous: 7, emotional: 7, cognitive: 7, body: 7, behavioral: 6, functioning: 6, readiness: 38 },
      { session: 4, date: -49, nervous: 6, emotional: 6, cognitive: 6, body: 6, behavioral: 6, functioning: 5, readiness: 34 },
      { session: 5, date: -42, nervous: 5, emotional: 5, cognitive: 5, body: 5, behavioral: 5, functioning: 4, readiness: 28 },
      { session: 6, date: -35, nervous: 5, emotional: 4, cognitive: 5, body: 4, behavioral: 4, functioning: 4, readiness: 24 },
      { session: 7, date: -28, nervous: 4, emotional: 4, cognitive: 4, body: 4, behavioral: 4, functioning: 4, readiness: 21 },
      { session: 8, date: -21, nervous: 4, emotional: 3, cognitive: 4, body: 3, behavioral: 3, functioning: 3, readiness: 18 },
      { session: 9, date: -14, nervous: 3, emotional: 3, cognitive: 3, body: 3, behavioral: 3, functioning: 3, readiness: 15 },
      { session: 10, date: -7, nervous: 3, emotional: 3, cognitive: 3, body: 2, behavioral: 2, functioning: 2, readiness: 12 },
    ];

    for (const f of devForms) {
      const sessionNum = f.session as keyof typeof SESSION_SUMMARIES;
      await supabase.from('session_development_forms').insert({
        client_id: clientId, therapist_id: therapistId,
        session_number: f.session, session_date: getDate(f.date),
        integration_notes: INTEGRATION_NOTES[f.session as keyof typeof INTEGRATION_NOTES],
        therapist_internal_notes: THERAPIST_NOTES[f.session as keyof typeof THERAPIST_NOTES],
        nervous_system_score: f.nervous, emotional_state_score: f.emotional,
        cognitive_patterns_score: f.cognitive, body_symptoms_score: f.body,
        behavioral_patterns_score: f.behavioral, life_functioning_score: f.functioning,
        goal_readiness_score: f.readiness, status: 'submitted',
        submitted_at: getDate(f.date),
        previous_session_improvements: f.session === 1 ? 'Initial session - baseline established' : `Completed session ${f.session - 1}, implementing homework`,
        previous_session_challenges: f.session === 1 ? 'High anxiety, sleep issues' : 'Ongoing pattern work',
        key_interventions: SESSION_SUMMARIES[sessionNum].techniques,
      });
    }
    results.created.push({ type: 'dev_forms', count: 10 });

    // Create session materials with proper descriptions
    const sessions = await supabase.from('sessions').select('id, session_number').eq('client_id', clientId).order('session_number');
    
    let materialCount = 0;
    for (const session of (sessions.data || [])) {
      const materials = SESSION_MATERIALS[session.session_number as keyof typeof SESSION_MATERIALS] || [];
      
      for (const mat of materials) {
        await supabase.from('session_materials').insert({
          session_id: session.id,
          type: mat.type,
          url: `https://neuroholistic materials.example.com/${mat.type === 'pdf' ? 'docs' : mat.type === 'video' ? 'videos' : 'audio'}/session-${session.session_number}-${mat.name.toLowerCase().replace(/\s+/g, '-')}.${mat.type === 'pdf' ? 'pdf' : mat.type === 'video' ? 'mp4' : 'mp3'}`,
          filename: `${mat.name}.${mat.type === 'pdf' ? 'pdf' : mat.type === 'video' ? 'mp4' : 'mp3'}`,
          description: mat.desc,
          uploaded_by: therapistId,
        });
        materialCount++;
      }
    }
    results.created.push({ type: 'materials', count: materialCount });

    // Set password
    await supabase.auth.admin.updateUserById(clientId, { password: DEMO_PASSWORD });

    return NextResponse.json({
      success: true,
      password: DEMO_PASSWORD,
      client: {
        email: clientEmail,
        name: 'Nadia Al-Mansouri',
        program: 'Completed (10/10)',
        progress: {
          baselineScore: 45,
          midScore: 28,
          finalScore: 18,
          improvement: '60% improvement in wellbeing',
        },
        dashboardFeatures: {
          sessions: 10,
          materials: materialCount,
          assessments: 3,
          integrationNotes: 10,
        },
      },
      created: results.created,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, errors: results.errors }, { status: 500 });
  }
}
