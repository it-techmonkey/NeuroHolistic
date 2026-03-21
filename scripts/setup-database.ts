import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname in ES modules
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
} else {
  console.warn(`⚠️  .env.local not found at ${envPath}`);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.error(
    `   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`
  );
  console.error('\n📝 Make sure your .env.local file contains:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  { email: 'founder@neuroholistic.com', password: 'Password123!', role: 'founder' },
  { email: 'dr.fawzia@neuroholistic.com', password: 'Password123!', role: 'therapist' },
  { email: 'mariam@neuroholistic.com', password: 'Password123!', role: 'therapist' },
  { email: 'noura@neuroholistic.com', password: 'Password123!', role: 'therapist' },
  { email: 'sarah.ali@test.com', password: 'Password123!', role: 'client' },
  { email: 'ahmed.hassan@test.com', password: 'Password123!', role: 'client' },
  { email: 'laya.mansouri@test.com', password: 'Password123!', role: 'client' },
  { email: 'rawan.malik@test.com', password: 'Password123!', role: 'client' },
  { email: 'omar.nasser@test.com', password: 'Password123!', role: 'client' },
];

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Step 1: Create test users in auth.users
    console.log('📝 Step 1: Creating test users in auth.users...');
    const createdUsers = [];

    for (const user of testUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Auto-confirm to skip email verification
        });

        if (error) {
          // User might already exist
          if (error.status === 422 || error.message.includes('already exists')) {
            console.log(`  ⚠️  ${user.email} already exists`);
            // Get the existing user
            const { data: existingUser } = await supabase.auth.admin.listUsers();
            const found = existingUser.users.find((u) => u.email === user.email);
            if (found) {
              createdUsers.push({ ...user, id: found.id });
            }
          } else {
            console.error(`  ❌ Error creating ${user.email}:`, error.message);
          }
        } else if (data.user) {
          console.log(`  ✅ Created ${user.email}`);
          createdUsers.push({ ...user, id: data.user.id });
        }
      } catch (e) {
        console.error(`  ❌ Error creating ${user.email}:`, e);
      }
    }

    if (createdUsers.length === 0) {
      console.error(
        '❌ No users were created. Check your SUPABASE_SERVICE_ROLE_KEY.'
      );
      process.exit(1);
    }

    console.log(`\n✅ Successfully created/verified ${createdUsers.length} users\n`);

    // Step 2: Run the seed function
    console.log('📊 Step 2: Running seed_neuroholistic_data() function...');
    const { data: seedResult, error: seedError } = await supabase.rpc(
      'seed_neuroholistic_data'
    );

    if (seedError) {
      console.error('❌ Error running seed function:', seedError.message);
      process.exit(1);
    }

    console.log('✅ Seed data inserted successfully');
    console.log(`📝 Result: ${seedResult}\n`);

    // Step 3: Verify data
    console.log('🔍 Step 3: Verifying data...');

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .limit(10);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} users in public.users`);
      users?.forEach((u) => {
        console.log(`   - ${u.email} (${u.role})`);
      });
    }

    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('id, client_name, status')
      .limit(10);

    if (programsError) {
      console.error('❌ Error fetching programs:', programsError.message);
    } else {
      console.log(`✅ Found ${programs?.length || 0} programs`);
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, name, type, status')
      .limit(10);

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError.message);
    } else {
      console.log(`✅ Found ${bookings?.length || 0} bookings`);
    }

    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('id, full_name, assessment_type')
      .limit(10);

    if (assessmentsError) {
      console.error('❌ Error fetching assessments:', assessmentsError.message);
    } else {
      console.log(`✅ Found ${assessments?.length || 0} assessments\n`);
    }

    console.log('✨ Database setup complete!\n');
    console.log('Test accounts created:');
    createdUsers.forEach((u) => {
      console.log(`  📧 ${u.email}`);
      console.log(`     Password: ${u.password}`);
      console.log(`     Role: ${u.role}\n`);
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

setupDatabase();
