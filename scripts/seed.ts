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
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log('🌱 Seeding database with test data...\n');

  try {
    // First, verify and ensure columns exist
    console.log('🔧 Step 1: Ensuring schema...');
    try {
      // Try to query a column that should exist
      await supabase.from('users').select('full_name').limit(1);
      console.log('✅ Schema verified\n');
    } catch (e) {
      console.error('\n❌ Missing schema columns!');
      console.error('\n📝 MANUAL SETUP REQUIRED:');
      console.error('   1. Go to https://supabase.com/dashboard');
      console.error('   2. Open your project → SQL Editor');
      console.error('   3. Run the migration 004 file:');
      console.error('      src/lib/supabase/migrations/004_dashboard_schema.sql');
      console.error('   4. Then run this script again\n');
      process.exit(1);
    }

    // Run the seed function
    console.log('📊 Step 2: Running seed_neuroholistic_data()...');
    const { data: seedResult, error: seedError } = await supabase.rpc(
      'seed_neuroholistic_data'
    );

    if (seedError) {
      console.error('❌ Seed error:', seedError.message);
      process.exit(1);
    }

    console.log('✅ Seed function executed\n');

    // Get statistics on what was created
    console.log('📈 Step 3: Verifying data...\n');

    const [
      { data: usersData, error: usersError },
      { data: programsData, error: programsError },
      { data: bookingsData, error: bookingsError },
      { data: assessmentsData, error: assessmentsError },
      { data: paymentsData, error: paymentsError },
      { data: sessionsData, error: sessionsError },
    ] = await Promise.all([
      supabase
        .from('users')
        .select('id, email, role, full_name, phone')
        .order('role')
        .order('email'),
      supabase
        .from('programs')
        .select('id, client_name, therapist_name, status, total_sessions, sessions_completed, program_type, price_paid')
        .order('created_at', { ascending: false }),
      supabase
        .from('bookings')
        .select('id, name, email, type, status, date, therapist_name')
        .order('date', { ascending: false }),
      supabase
        .from('assessments')
        .select('id, full_name, assessment_type, overall_severity_band, status')
        .order('submitted_at', { ascending: false }),
      supabase
        .from('payments')
        .select('id, user_id, amount, currency, type, status, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('sessions')
        .select('id, program_id, session_number, date, time, status')
        .order('date', { ascending: false }),
    ]);

    // Display results
    console.log('═'.repeat(70));
    console.log('📊 DATABASE SEED SUMMARY');
    console.log('═'.repeat(70));

    if (usersData && usersData.length > 0) {
      console.log(`\n👥 USERS (${usersData.length} total)\n`);
      const groupedByRole = usersData.reduce(
        (acc, user) => {
          if (!acc[user.role]) acc[user.role] = [];
          acc[user.role].push(user);
          return acc;
        },
        {} as Record<string, any[]>
      );

      Object.entries(groupedByRole).forEach(([role, users]) => {
        console.log(`   ${role.toUpperCase()} (${users.length}):`);
        users.forEach((u) => {
          console.log(
            `      • ${u.email.padEnd(35)} - ${u.full_name} ${u.phone ? `(${u.phone})` : ''}`
          );
        });
      });
    }

    if (programsData && programsData.length > 0) {
      console.log(`\n📅 PROGRAMS (${programsData.length} total)\n`);
      programsData.forEach((p) => {
        console.log(
          `   • ${p.client_name} with ${p.therapist_name} (${p.total_sessions} sessions)`
        );
        console.log(
          `     Status: ${p.status} | Completed: ${p.sessions_completed}/${p.total_sessions} | Type: ${p.program_type}`
        );
        console.log(`     Price: AED ${(p.price_paid / 1000).toFixed(1)}k | ${p.id}`);
      });
    }

    if (bookingsData && bookingsData.length > 0) {
      console.log(`\n📋 BOOKINGS (${bookingsData.length} total)\n`);
      const completed = bookingsData.filter((b) => b.status === 'completed').length;
      const confirmed = bookingsData.filter((b) => b.status === 'confirmed').length;

      bookingsData.slice(0, 10).forEach((b) => {
        console.log(`   • ${b.name} - ${b.type} with ${b.therapist_name}`);

      });

      if (bookingsData.length > 10) {
        console.log(`   ... and ${bookingsData.length - 10} more`);
      }
      console.log(`\n   Summary: ${completed} completed, ${confirmed} confirmed`);
    }

    if (assessmentsData && assessmentsData.length > 0) {
      console.log(`\n📈 ASSESSMENTS (${assessmentsData.length} total)\n`);
      assessmentsData.forEach((a) => {
        console.log(`   • ${a.full_name}`);
        console.log(
          `     Type: ${a.assessment_type} | Severity: ${a.overall_severity_band} | Status: ${a.status}`
        );
      });
    }

    if (paymentsData && paymentsData.length > 0) {
      console.log(`\n💳 PAYMENTS (${paymentsData.length} total)\n`);
      const paid = paymentsData.filter((p) => p.status === 'paid').length;
      const pending = paymentsData.filter((p) => p.status === 'pending').length;
      const totalAmount = paymentsData
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      paymentsData.slice(0, 8).forEach((p) => {
        console.log(
          `   • ${p.type.padEnd(20)} | AED ${(p.amount / 1000).toFixed(1)}k | ${p.status} | ${p.created_at.split('T')[0]}`
        );
      });

      if (paymentsData.length > 8) {
        console.log(`   ... and ${paymentsData.length - 8} more`);
      }
      console.log(
        `\n   Summary: ${paid} paid (AED ${(totalAmount / 1000).toFixed(1)}k), ${pending} pending`
      );
    }

    if (sessionsData && sessionsData.length > 0) {
      console.log(`\n🗓️  SESSIONS (${sessionsData.length} total)\n`);
      const completed = sessionsData.filter((s) => s.status === 'completed').length;
      const scheduled = sessionsData.filter((s) => s.status === 'scheduled').length;

      console.log(`   Summary: ${completed} completed, ${scheduled} scheduled`);
    }

    console.log('\n' + '═'.repeat(70));
    console.log('✨ DATABASE SEEDING COMPLETE!');
    console.log('═'.repeat(70));

    console.log('\n🎯 Test Accounts (Password: Password123!)\n');
    console.log('   👑 FOUNDER:');
    console.log('      founder@neuroholistic.com\n');
    console.log('   💼 THERAPISTS:');
    console.log('      dr.fawzia@neuroholistic.com');
    console.log('      mariam@neuroholistic.com');
    console.log('      noura@neuroholistic.com\n');
    console.log('   👤 CLIENTS:');
    console.log('      sarah.ali@test.com');
    console.log('      ahmed.hassan@test.com');
    console.log('      laya.mansouri@test.com');
    console.log('      rawan.malik@test.com');
    console.log('      omar.nasser@test.com\n');

    console.log('🚀 You can now:');
    console.log('   1. Log in with any test account');
    console.log('   2. View programs, bookings, and assessments');
    console.log('   3. Test the therapist and client dashboards');
    console.log('   4. View payment history and session records\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seed();
