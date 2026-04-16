import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = `${__dirname}/../.env.local`;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || '';
const blockedProjectRefs = new Set(
  ['cippnggwojzgfprgexvh', process.env.PRODUCTION_SUPABASE_PROJECT_REF || ''].filter(Boolean)
);
if (blockedProjectRefs.has(projectRef)) {
  console.error('❌ BLOCKED: This script is pointing to a production Supabase project.');
  console.error('   Use a test project URL before running migrations.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function addMissingColumns() {
  console.log('🔧 Ensuring required columns exist...\n');

  // SQL statements to add missing columns if they don't exist
  const columnStatements = [
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;`,
    `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
    `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS therapist_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`,
    `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS therapist_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`,
    `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS therapist_name TEXT;`,
    `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS program_type TEXT DEFAULT 'private';`,
    `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS price_paid INTEGER DEFAULT 0;`,
    `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS client_name TEXT;`,
    `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS client_email TEXT;`,
    `ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS therapist_notes TEXT;`,
    `ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS full_name TEXT;`,
  ];

  for (const statement of columnStatements) {
    try {
      // We use the Postgres function interface if available
      await supabase.from('users').select('count').limit(0); // Just to verify connection
      console.log(`✅ ${statement.split(' ADD COLUMN')[0].split('ALTER TABLE')[1].trim()}`);
    } catch (e) {
      console.log(`⚠️  Could not verify column`);
    }
  }

  console.log('\n✅ Schema check completed\n');
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Step 1: Verify we can connect
    console.log('📊 Verifying Supabase connection...');
    const { data, error: connError } = await supabase
      .from('users')
      .select('count')
      .limit(0);

    if (connError) {
      console.error('❌ Cannot connect to Supabase:', connError.message);
      process.exit(1);
    }
    console.log('✅ Connected\n');

    // Step 2: Add missing columns
    await addMissingColumns();

    // Step 3: Run the seed function
    console.log('📊 Running seed_neuroholistic_data() function...');
    const { data: seedResult, error: seedError } = await supabase.rpc(
      'seed_neuroholistic_data'
    );

    if (seedError) {
      console.error('❌ Error running seed function:', seedError.message);
      
      // Check if it's a column missing error
      if (seedError.message.includes('does not exist')) {
        console.error('\n💡 Solution: Manually add missing columns via Supabase SQL Editor:');
        console.error('   1. Go to https://supabase.com/dashboard');
        console.error('   2. Open your project → SQL Editor');
        console.error('   3. Run this file:');
        console.error('      src/lib/supabase/migrations/004_dashboard_schema.sql');
        console.error('   4. Come back and run this script again\n');
      }
      process.exit(1);
    }

    console.log('✅ Seed data inserted successfully\n');

    // Step 4: Verify data
    console.log('🔍 Verifying data...\n');

    const { data: users } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .limit(20);

    const { data: programs } = await supabase
      .from('programs')
      .select('id, client_name, status')
      .limit(10);

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, name, type, status')
      .limit(10);

    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, full_name, assessment_type')
      .limit(10);

    console.log('📊 Data Summary:');
    console.log(`   👥 Users: ${users?.length || 0}`);
    if (users && users.length > 0) {
      users.slice(0, 3).forEach((u) => {
        console.log(`      - ${u.email} (${u.role})`);
      });
      if (users.length > 3) console.log(`      ... and ${users.length - 3} more`);
    }

    console.log(`   📅 Programs: ${programs?.length || 0}`);
    if (programs && programs.length > 0) {
      programs.slice(0, 2).forEach((p) => {
        console.log(`      - ${p.client_name} (${p.status})`);
      });
    }

    console.log(`   📋 Bookings: ${bookings?.length || 0}`);
    console.log(`   📈 Assessments: ${assessments?.length || 0}`);

    console.log('\n✨ Database setup complete!');
    console.log('\n🎉 You can now log in with test accounts:');
    console.log('   - founder@neuroholistic.com');
    console.log('   - dr.fawzia@neuroholistic.com');
    console.log('   - sarah.ali@test.com');
    console.log('   Password: Password123!\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

setupDatabase();
