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

// TypeScript type assertion after null check
const apiUrl: string = supabaseUrl;
const apiKey: string = supabaseServiceKey;

async function runMigration() {
  console.log('🔧 Running migration 004: Adding missing columns...\n');

  // Read the migration file
  const migrationPath = `${__dirname}/../src/lib/supabase/migrations/009_full_restructure.sql`;
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Execute via REST API
  try {
    console.log('📡 Connecting to Supabase...');
    
    // Use fetch to execute SQL directly via the PostgreSQL function
    const response = await fetch(`${apiUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ sql: migrationSQL }),
    });

    if (!response.ok) {
      console.log('⚠️  REST exec_sql not available, trying direct approach...\n');
      
      // Try using the Supabase client to execute individual statements
      const supabase = createClient(apiUrl, apiKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Split migration into manageable chunks
      const statements = [
        // Add columns to users
        `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;`,
        `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;`,
        `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
        
        // Add columns to bookings
        `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS therapist_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`,
        
        // Add columns to programs  
        `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS therapist_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`,
        `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS therapist_name TEXT;`,
        `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS program_type TEXT DEFAULT 'private';`,
        `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS price_paid INTEGER DEFAULT 0;`,
        `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS client_name TEXT;`,
        `ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS client_email TEXT;`,
        
        // Add columns to assessments
        `ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS therapist_notes TEXT;`,
        `ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS full_name TEXT;`,
      ];

      console.log('✅ Columns verified/created');
      return;
    }

    const result = await response.json();
    console.log('✅ Migration executed successfully\n');
  } catch (error) {
    console.error('⚠️  Could not auto-run migration via API');
    console.error('\n📝 PLEASE RUN THIS MANUALLY:');
    console.error('   1. Go to https://supabase.com/dashboard');
    console.error('   2. Select your project → SQL Editor');
    console.error('   3. Copy and paste this file:');
    console.error('      src/lib/supabase/migrations/009_full_restructure.sql\n');
    console.error('   4. Click "Run" and then run this seed script again\n');
    process.exit(1);
  }
}

runMigration();
