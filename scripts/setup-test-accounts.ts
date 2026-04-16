/**
 * Setup Test Accounts Script
 * 
 * Creates test user, therapist, and admin accounts in the test Supabase project.
 * Run with: npx tsx scripts/setup-test-accounts.ts
 * 
 * Prerequisites:
 * 1. Create a test Supabase project
 * 2. Run the clean schema SQL on it
 * 3. Configure .env.test.local with test project credentials
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.test.local
const envPath = path.resolve(__dirname, '../.env.test.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Missing .env.test.local file.');
  console.error('   Copy .env.test.local.example to .env.test.local and fill in your test Supabase credentials.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...rest] = trimmed.split('=');
  const value = rest.join('=').trim().replace(/^['"]|["']$/g, '');
  if (key && value && !process.env[key]) process.env[key] = value;
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.test.local');
  process.exit(1);
}

// Safety check: prevent running against production
if (supabaseUrl.includes('cippnggwojzgfprgexvh')) {
  console.error('❌ BLOCKED: This appears to be the PRODUCTION Supabase project.');
  console.error('   This script can only run against a test project.');
  console.error('   Update .env.test.local with your test project credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Test account definitions
const TEST_ACCOUNTS = [
  {
    email: 'test-client@neuroholistic.test',
    password: 'TestClient123!',
    firstName: 'Test',
    lastName: 'Client',
    role: 'client' as const,
    phone: '+971500000001',
    country: 'United Arab Emirates',
  },
  {
    email: 'test-therapist@neuroholistic.test',
    password: 'TestTherapist123!',
    firstName: 'Test',
    lastName: 'Therapist',
    role: 'therapist' as const,
    phone: '+971500000002',
    country: 'United Arab Emirates',
  },
  {
    email: 'test-admin@neuroholistic.test',
    password: 'TestAdmin123!',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin' as const,
    phone: '+971500000003',
    country: 'United Arab Emirates',
  },
];

async function createOrUpdateAccount(account: typeof TEST_ACCOUNTS[number]) {
  console.log(`\n📋 Processing: ${account.email} (${account.role})`);

  // Check if user already exists
  const { data: usersList } = await supabase.auth.admin.listUsers();
  const existingUser = usersList?.users?.find(
    (u) => u.email?.toLowerCase() === account.email.toLowerCase()
  );

  let userId: string;

  if (existingUser) {
    console.log(`   ↳ User exists, updating...`);
    userId = existingUser.id;

    // Update auth user
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: account.password,
      email_confirm: true,
      user_metadata: {
        first_name: account.firstName,
        last_name: account.lastName,
        phone: account.phone,
        country: account.country,
      },
    });

    if (updateError) {
      console.error(`   ❌ Failed to update auth user: ${updateError.message}`);
      return null;
    }
  } else {
    console.log(`   ↳ Creating new auth user...`);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        first_name: account.firstName,
        last_name: account.lastName,
        phone: account.phone,
        country: account.country,
      },
    });

    if (authError || !authData.user) {
      console.error(`   ❌ Failed to create auth user: ${authError?.message}`);
      return null;
    }

    userId = authData.user.id;
  }

  // Upsert user profile in public.users table
  const { error: profileError } = await supabase.from('users').upsert(
    {
      id: userId,
      email: account.email,
      role: account.role,
      full_name: `${account.firstName} ${account.lastName}`,
      phone: account.phone,
      country: account.country,
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    console.error(`   ❌ Failed to upsert profile: ${profileError.message}`);
    return null;
  }

  console.log(`   ✅ ${account.role} account ready (ID: ${userId.slice(0, 8)}...)`);
  return { id: userId, ...account };
}

async function run() {
  console.log('🧪 Setting up NeuroHolistic test environment...\n');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  const projectRef = (supabaseUrl || '').match(/https:\/\/([^.]+)\./)?.[1] || 'unknown';
  console.log(`   Project: ${projectRef}`);

  const results: Array<{ email: string; password: string; role: string; id: string } | null> = [];

  for (const account of TEST_ACCOUNTS) {
    const result = await createOrUpdateAccount(account);
    results.push(result ? { ...account, id: result.id } : null);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🧪 TEST ACCOUNTS SUMMARY');
  console.log('═'.repeat(60));

  for (const result of results) {
    if (result) {
      console.log(`\n  ${result.role.toUpperCase()}`);
      console.log(`    Email:    ${result.email}`);
      console.log(`    Password: ${result.password}`);
      console.log(`    ID:       ${result.id}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n🚀 To start the dev server with test environment:');
  console.log('   npm run dev:test');
  console.log('\n📝 Login at: http://localhost:3000/auth/login');
  console.log('');
}

run().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
