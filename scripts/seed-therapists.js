/**
 * Therapist Seeding Script
 * 
 * Usage:
 *   node scripts/seed-therapists.js
 * 
 * Make sure to set these environment variables in .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const therapists = [
  {
    email: 'therapist1@neuroholistic.com',
    password: 'Test@123456',
    name: 'Dr. Sarah Chen',
  },
  {
    email: 'therapist2@neuroholistic.com',
    password: 'Test@123456',
    name: 'Dr. James Wilson',
  },
  {
    email: 'therapist3@neuroholistic.com',
    password: 'Test@123456',
    name: 'Dr. Maria Garcia',
  },
];

async function seedTherapists() {
  console.log('🌱 Seeding therapist accounts...\n');

  for (const therapist of therapists) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: therapist.email,
        password: therapist.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`❌ Failed to create auth user for ${therapist.email}:`, authError.message);
        continue;
      }

      // Create user record with therapist role
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: therapist.email,
        role: 'therapist',
      });

      if (dbError) {
        console.error(`❌ Failed to create user record for ${therapist.email}:`, dbError.message);
        continue;
      }

      console.log(`✅ Created therapist: ${therapist.email}`);
      console.log(`   Name: ${therapist.name}`);
      console.log(`   ID: ${authData.user.id}`);
      console.log();
    } catch (error) {
      console.error(`❌ Error processing ${therapist.email}:`, error);
    }
  }

  console.log('✨ Seeding complete!');
  process.exit(0);
}

seedTherapists().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
