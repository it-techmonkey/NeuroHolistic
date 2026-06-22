/**
 * Manage admin accounts.
 * Run: npx tsx scripts/manage-admins.ts
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

const NEW_ADMIN_EMAIL = 'customer.service@neuroholisticinstitute.com';
const NEW_ADMIN_PASSWORD = 'NHI_Cs@2026!';
const OLD_ADMIN_EMAIL = 'admin@neuroholistic.com';

async function main() {
  console.log('--- Admin Account Management ---\n');

  const { data: usersList } = await supabase.auth.admin.listUsers();
  const allUsers = usersList?.users ?? [];

  // 1. Delete old admin
  console.log(`Looking for old admin: ${OLD_ADMIN_EMAIL}`);
  const oldAdmin = allUsers.find(u => u.email?.toLowerCase() === OLD_ADMIN_EMAIL.toLowerCase());
  if (oldAdmin) {
    console.log(`Found old admin (${oldAdmin.id}), deleting auth user...`);
    const { error: delAuthErr } = await supabase.auth.admin.deleteUser(oldAdmin.id);
    if (delAuthErr) {
      console.error('Failed to delete auth user:', delAuthErr.message);
    } else {
      console.log('Auth user deleted.');
    }

    const { error: delRowErr } = await supabase.from('users').delete().eq('id', oldAdmin.id);
    if (delRowErr) {
      console.error('Failed to delete users row:', delRowErr.message);
    } else {
      console.log('Users row deleted.');
    }
  } else {
    console.log(`${OLD_ADMIN_EMAIL} not found, skipping deletion.`);
  }

  // 2. Create new admin
  console.log(`\nCreating new admin: ${NEW_ADMIN_EMAIL}`);
  const existing = allUsers.find(u => u.email?.toLowerCase() === NEW_ADMIN_EMAIL.toLowerCase());

  if (existing) {
    console.log('User already exists, updating password and role...');
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password: NEW_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: 'Customer',
        last_name: 'Service',
        full_name: 'Customer Service',
      },
    });
    if (updateErr) {
      console.error('Failed to update auth user:', updateErr.message);
      process.exit(1);
    }

    const { error: upsertErr } = await supabase.from('users').upsert({
      id: existing.id,
      email: NEW_ADMIN_EMAIL,
      role: 'admin',
      full_name: 'Customer Service',
    }, { onConflict: 'id' });
    if (upsertErr) {
      console.error('Failed to upsert users row:', upsertErr.message);
      process.exit(1);
    }

    console.log('Account updated:');
  } else {
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: NEW_ADMIN_EMAIL,
      password: NEW_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: 'Customer',
        last_name: 'Service',
        full_name: 'Customer Service',
      },
    });
    if (authErr) {
      console.error('Failed to create auth user:', authErr.message);
      process.exit(1);
    }

    const { error: insertErr } = await supabase.from('users').insert({
      id: authData.user.id,
      email: NEW_ADMIN_EMAIL,
      role: 'admin',
      full_name: 'Customer Service',
    });
    if (insertErr) {
      console.error('Failed to insert users row:', insertErr.message);
      process.exit(1);
    }

    console.log('Account created:');
  }

  console.log(`  Email:    ${NEW_ADMIN_EMAIL}`);
  console.log(`  Password: ${NEW_ADMIN_PASSWORD}`);
  console.log(`  Role:     admin`);
  console.log('\nDone.');
}

main();
