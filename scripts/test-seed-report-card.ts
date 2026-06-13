#!/usr/bin/env tsx
/**
 * Seed report card test data (assessments, dev forms, sessions).
 * 
 * Usage:
 *   npx tsx scripts/test-seed-report-card.ts
 *   npx tsx scripts/test-seed-report-card.ts --email user@test.com
 *   npx tsx scripts/test-seed-report-card.ts --clean
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf-8').split(/\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (k && v && !process.env[k]) process.env[k] = v;
  });
}
loadEnv();

const args = process.argv.slice(2);
const getArg = (n: string) => { const i = args.indexOf(`--${n}`); return i !== -1 ? args[i + 1] : undefined; };
const CLEAN = args.includes('--clean');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const email = getArg('email');
  const { data: user } = email
    ? await supabase.from('users').select('id, email').eq('email', email).maybeSingle()
    : await supabase.from('users').select('id, email').limit(1).maybeSingle();

  if (!user) { console.error('No user found.'); process.exit(1); }

  if (CLEAN) {
    await supabase.from('diagnostic_assessments').delete().eq('user_id', user.id);
    await supabase.from('session_development_forms').delete().eq('user_id', user.id);
  }

  // Ensure program exists
  let { data: program } = await supabase
    .from('programs').select('id').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle();

  if (!program) {
    const { data: p } = await supabase.from('programs').insert({
      user_id: user.id, type: 'private', status: 'active', payment_status: 'verified',
      therapist_name: 'Test Therapist', total_sessions: 10,
    }).select('id').single();
    program = p;
  }

  // Seed sessions
  const sessions = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (4 - i) * 7);
    return {
      program_id: program!.id, user_id: user.id, session_number: i + 1,
      date: d.toISOString().split('T')[0], time: '10:00',
      status: i < 3 ? 'completed' : i === 3 ? 'confirmed' : 'pending',
      type: 'program_session',
    };
  });
  await supabase.from('sessions').upsert(sessions, { onConflict: 'program_id,session_number' });

  // Seed assessments
  await supabase.from('diagnostic_assessments').insert([
    {
      user_id: user.id, session_number: 1, main_complaint: 'Chronic anxiety and sleep issues',
      symptoms: ['Insomnia', 'Racing thoughts', 'Muscle tension'], clinical_condition: 'GAD',
      therapist_focus: 'Nervous system regulation', therapy_goals: ['Reduce anxiety', 'Improve sleep'],
      nervous_system_score: 3, emotional_state_score: 3, cognitive_patterns_score: 4,
      body_symptoms_score: 4, behavioral_patterns_score: 3, life_functioning_score: 3,
    },
    {
      user_id: user.id, session_number: 3, main_complaint: 'Improving but residual symptoms',
      symptoms: ['Mild insomnia', 'Occasional anxiety'], clinical_condition: 'GAD - Improving',
      therapist_focus: 'Deepening regulation', therapy_goals: ['Maintain gains', 'Build resilience'],
      nervous_system_score: 7, emotional_state_score: 6, cognitive_patterns_score: 6,
      body_symptoms_score: 7, behavioral_patterns_score: 5, life_functioning_score: 6,
    },
  ]);

  // Seed dev forms
  await supabase.from('session_development_forms').insert([
    {
      user_id: user.id, session_number: 1,
      pre_symptoms: ['Anxiety 8/10', 'Sleep 3/10'], post_symptoms: ['Anxiety 6/10', 'Sleep 5/10'],
      techniques_used: ['PMR', 'Breathing'], key_interventions: 'Grounding techniques',
      client_feedback: 'Felt relief', integration_notes: 'Practice breathing daily',
      therapist_notes: 'Good rapport established',
    },
    {
      user_id: user.id, session_number: 2,
      pre_symptoms: ['Anxiety 6/10', 'Sleep 4/10'], post_symptoms: ['Anxiety 4/10', 'Sleep 6/10'],
      techniques_used: ['Body scan', 'Cognitive reframing'], key_interventions: 'Cognitive restructuring',
      client_feedback: 'Sleep improved', integration_notes: 'Thought journal',
      therapist_notes: 'Progress continues',
    },
    {
      user_id: user.id, session_number: 3,
      pre_symptoms: ['Anxiety 4/10', 'Sleep 5/10'], post_symptoms: ['Anxiety 3/10', 'Sleep 7/10'],
      techniques_used: ['EMDR basics', 'Somatic work'], key_interventions: 'Core trigger processing',
      client_feedback: 'Feeling more in control', integration_notes: 'Daily mindfulness',
      therapist_notes: 'Excellent progress across domains',
    },
  ]);

  console.log(`✅ Seeded for ${user.email}: 5 sessions, 2 assessments, 3 dev forms`);
}

main().catch(e => { console.error(e); process.exit(1); });
