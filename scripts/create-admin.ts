/**
 * Run: npx tsx scripts/create-admin.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const ADMIN_EMAIL = 'admin@neuroholistic.com';
const ADMIN_PASSWORD = 'Admin@12345';

async function main() {
  console.log('Creating admin account...');

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      first_name: 'Admin',
      last_name: 'User',
      full_name: 'Admin User',
    },
  });

  if (authError) {
    if (authError.message?.includes('already been registered')) {
      console.log('Auth user already exists, fetching ID...');
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find(u => u.email === ADMIN_EMAIL);
      if (!existing) {
        console.error('Could not find existing user');
        process.exit(1);
      }

      // Ensure public.users row exists with admin role
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: existing.id,
          email: ADMIN_EMAIL,
          role: 'admin',
          full_name: 'Admin User',
        }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Failed to upsert users row:', upsertError);
        process.exit(1);
      }

      console.log('Admin account ready (existing user updated):');
      console.log(`  Email:    ${ADMIN_EMAIL}`);
      console.log(`  Password: ${ADMIN_PASSWORD}`);
      console.log(`  Role:     admin`);
      return;
    }

    console.error('Failed to create auth user:', authError.message);
    process.exit(1);
  }

  console.log('Auth user created:', authData.user.id);

  // 2. Create public.users row
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: ADMIN_EMAIL,
      role: 'admin',
      full_name: 'Admin User',
    });

  if (insertError) {
    console.error('Failed to insert users row:', insertError.message);
    process.exit(1);
  }

  console.log('\nAdmin account created successfully!');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role:     admin`);
}

main();
