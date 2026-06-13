#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split(/\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (k && v && !process.env[k]) process.env[k] = v;
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const KEEP_ROLES = ['admin', 'therapist'];

async function main() {
  // 1. List all users
  const { data: allUsers } = await supabase.from('users').select('id, email, role, full_name');

  const clients = (allUsers || []).filter(u => !KEEP_ROLES.includes(u.role));
  const keepers = (allUsers || []).filter(u => KEEP_ROLES.includes(u.role));

  console.log('\nKEEPING:');
  keepers.forEach(u => console.log(`  ${u.role.padEnd(10)} ${u.email}`));

  console.log('\nDELETING:');
  clients.forEach(u => console.log(`  ${u.role.padEnd(10)} ${u.email} (${u.id})`));

  if (clients.length === 0) {
    console.log('\nNo client accounts to delete.');
    return;
  }

  const clientIds = clients.map(c => c.id);

  // 2. Delete all child data first (foreign keys)
  console.log('\nCleaning child data...');

  // Sessions (by program_id)
  const { data: programs } = await supabase.from('programs').select('id').in('user_id', clientIds);
  for (const p of programs || []) {
    await supabase.from('sessions').delete().eq('program_id', p.id);
  }

  await supabase.from('programs').delete().in('user_id', clientIds);
  console.log('  programs + sessions');

  await supabase.from('bookings').delete().in('user_id', clientIds);
  console.log('  bookings');

  await supabase.from('payments').delete().in('user_id', clientIds);
  console.log('  payments');

  await supabase.from('client_discounts').delete().in('client_id', clientIds);
  console.log('  discounts');

  await supabase.from('therapist_clients').delete().in('client_id', clientIds);
  console.log('  therapist_clients');

  // Diagnostic assessments + dev forms
  await supabase.from('diagnostic_assessments').delete().in('user_id', clientIds);
  await supabase.from('session_development_forms').delete().in('user_id', clientIds);
  console.log('  assessments + dev forms');

  // 3. Delete auth users (Supabase Auth)
  for (const c of clients) {
    const { error } = await supabase.auth.admin.deleteUser(c.id);
    if (error) console.error(`  Auth delete failed for ${c.email}: ${error.message}`);
  }

  // 4. Delete user records
  await supabase.from('users').delete().in('id', clientIds);
  console.log('  user records');

  // 5. Verify
  const { data: remaining } = await supabase.from('users').select('email, role');
  console.log('\nREMAINING USERS:');
  remaining?.forEach(u => console.log(`  ${u.role.padEnd(10)} ${u.email}`));
  console.log('\nDone. Create a fresh account at http://localhost:3000/auth/login\n');
}

main().catch(e => { console.error(e); process.exit(1); });
