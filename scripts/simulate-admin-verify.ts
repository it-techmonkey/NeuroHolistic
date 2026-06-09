#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split(/\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (k && v && !process.env[k]) process.env[k] = v;
  });
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase service credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // pick an existing client user
  const { data: clientUser } = await supabase.from('users').select('id,email').eq('role', 'client').limit(1).maybeSingle();
  if (!clientUser) {
    console.error('No client user found. Please create a client user before running this script.');
    process.exit(1);
  }

  // pick an existing admin to act as approver
  const { data: adminUser } = await supabase.from('users').select('id,email').eq('role', 'admin').limit(1).maybeSingle();
  if (!adminUser) {
    console.error('No admin user found. Please ensure an admin user exists to record audit entries.');
    process.exit(1);
  }

  // insert a pending program
  const paymentId = `manual:${Date.now()}`;
  const pricePaid = 1250;
  const { data: program, error: progErr } = await supabase.from('programs').insert({
    user_id: clientUser.id,
    total_sessions: 10,
    used_sessions: 0,
    sessions_completed: 0,
    status: 'pending',
    payment_id: paymentId,
    therapist_user_id: null,
    therapist_name: null,
    program_type: 'private',
    price_paid: pricePaid,
    client_name: 'Manual Test Client',
    client_email: clientUser.email,
    payment_status: 'pending_verification',
    payment_submitted_at: new Date().toISOString(),
    admin_notes: 'Inserted by simulate-admin-verify script',
  }).select().single();

  if (progErr || !program) {
    console.error('Failed to insert program:', progErr);
    process.exit(1);
  }

  console.log('Inserted pending program id:', program.id);

  // insert a payments row referencing this program (optional)
  const { data: paymentRow, error: payErr } = await supabase.from('payments').insert({
    user_id: clientUser.id,
    amount: pricePaid,
    currency: 'AED',
    type: 'full_program',
    status: 'pending',
    payment_reference: `MANUAL_${Date.now()}`,
    program_id: program.id,
    metadata: { gateway: 'manual', note: 'test manual verify' },
  }).select().single();

  if (payErr) {
    console.warn('Failed to insert payment row:', payErr);
  } else {
    console.log('Inserted payment row id:', paymentRow.id);
  }

  // Simulate admin accept action: update program
  const { error: updateErr } = await supabase.from('programs').update({
    status: 'active',
    payment_status: 'verified',
    payment_verified_at: new Date().toISOString(),
    admin_notes: 'Approved by simulate-admin-verify script',
  }).eq('id', program.id);

  if (updateErr) {
    console.error('Failed to update program:', updateErr);
    process.exit(1);
  }

  // Upsert therapist_clients (none in this test)
  // Record admin action
  const { data: adminAction, error: auditErr } = await supabase.from('admin_actions').insert({
    admin_id: adminUser.id,
    action: 'approve_payment',
    target_type: 'program',
    target_id: program.id,
    notes: 'Simulated approval',
  }).select().single();

  if (auditErr) {
    console.error('Failed to write admin action:', auditErr);
    process.exit(1);
  }

  console.log('Inserted admin action id:', adminAction.id);

  // Fetch current state for verification
  const { data: updatedProgram } = await supabase.from('programs').select('*').eq('id', program.id).single();
  const { data: fetchedAction } = await supabase.from('admin_actions').select('*').eq('id', adminAction.id).single();

  console.log('Updated program:', updatedProgram);
  console.log('Admin action record:', fetchedAction);
  console.log('\nDone — verify in the admin dashboard that program is active and audit row exists.');
}

main().catch(err => {
  console.error('Error in simulate-admin-verify:', err);
  process.exit(1);
});
