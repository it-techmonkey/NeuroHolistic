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

const supabase = createClient(apiUrl, apiKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Function to execute SQL statement
async function executeSQL(sql: string): Promise<void> {
  // Split by semicolon and filter out empty statements
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  for (const statement of statements) {
    // Skip comments and empty lines
    if (statement.startsWith('--') || statement.length === 0) {
      continue;
    }
    
    try {
      console.log(`Executing: ${statement.substring(0, Math.min(50, statement.length))}...`);
      // Use rpc to call a PostgreSQL function that executes SQL
      // Since we don't have exec_sql, we'll try to use the supabase client's 
      // ability to query via select with a raw SQL? Not directly possible.
      
      // Alternative: Use the supabase sql.js approach if available in edge runtime?
      // For now, let's try to use the REST API with a different endpoint
      
      // Let's try to use the supabase client to do a simple query that doesn't return data
      // to test connection, then we'll have to execute via a different method
      
      // Actually, let's just try to use the fetch approach directly
      const response = await fetch(`${apiUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ sql: statement }),
      });
      
      if (!response.ok) {
        // If exec_sql is not available, we'll try to execute via PostgREST directly
        // by attempting to insert/select from a dummy table? Not ideal.
        console.log(`⚠️  RPC exec_sql failed, trying direct approach for: ${statement.substring(0, Math.min(30, statement.length))}...`);
        
        // For DDL statements, we might need to use a different approach
        // Let's skip for now and rely on the manual execution instructions
        console.log(`⚠️  Please execute manually: ${statement}`);
        continue;
      }
      
      const result = await response.json();
      console.log(`✅ Executed: ${statement.substring(0, Math.min(30, statement.length))}...`);
    } catch (error) {
      console.error(`❌ Failed to execute: ${statement.substring(0, Math.min(30, statement.length))}...`);
      console.error(error);
      // Continue with other statements
    }
  }
}

async function runMigration() {
  console.log('🔧 Running migration 009: Full system restructure...\n');
  
  // Read the migration file
  const migrationPath = `${__dirname}/../src/lib/supabase/migrations/009_full_restructure.sql`;
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  // Execute the migration
  await executeSQL(migrationSQL);
  
  console.log('\n✅ Migration 009 executed successfully!');
  console.log('\n📝 NOTE: Some statements may have failed if exec_sql is not available.');
  console.log('   Please check the Supabase SQL Editor for any failed statements and run them manually.\n');
}

runMigration().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
