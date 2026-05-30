import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function loadEnvFile(fileName: string) {
  const envPath = path.join(projectRoot, fileName);
  if (!fs.existsSync(envPath)) return;

  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const migrationArg = args.find((arg) => !arg.startsWith('--'));

if (!migrationArg) {
  console.error('Usage: npx tsx scripts/run_sql_migration.ts <path-to-sql-file> [--dry-run]');
  console.error('Example: npx tsx scripts/run_sql_migration.ts supabase/migrations/019_add_certificates.sql');
  process.exit(1);
}

const migrationPath = path.isAbsolute(migrationArg)
  ? migrationArg
  : path.resolve(projectRoot, migrationArg);

if (!fs.existsSync(migrationPath)) {
  console.error(`Migration file not found: ${migrationPath}`);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const apiUrl = supabaseUrl;
const apiKey = supabaseServiceKey;

async function runWithPostgres(migrationSQL: string) {
  if (!databaseUrl) return false;

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase.') || databaseUrl.includes('pooler.supabase.')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  await client.connect();
  try {
    await client.query(migrationSQL);
  } finally {
    await client.end();
  }

  return true;
}

async function runWithSupabaseRpc(migrationSQL: string, relativePath: string) {
  const response = await fetch(`${apiUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ sql: migrationSQL }),
  });

  if (response.ok) {
    return true;
  }

  const details = await response.text();
  console.error('Migration failed.');
  console.error(`Supabase responded with ${response.status} ${response.statusText}.`);
  console.error(details);

  if (details.includes('PGRST202') || details.includes('exec_sql')) {
    console.error('\nYour Supabase project does not expose a public.exec_sql RPC function.');
    console.error('Use one of these options:');
    console.error('1. Run the SQL file manually in Supabase Dashboard -> SQL Editor.');
    console.error(`   File: ${relativePath}`);
    console.error('2. Add a direct database connection string to .env.local as DATABASE_URL, then rerun this command.');
    console.error('   Supabase Dashboard -> Project Settings -> Database -> Connection string');
  }

  return false;
}

async function runMigration() {
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8').trim();

  if (!migrationSQL) {
    console.error(`Migration file is empty: ${migrationPath}`);
    process.exit(1);
  }

  const relativePath = path.relative(projectRoot, migrationPath);
  console.log(`Running SQL migration: ${relativePath}`);

  if (dryRun) {
    console.log(`Dry run OK. SQL size: ${migrationSQL.length} characters.`);
    return true;
  }

  if (databaseUrl) {
    console.log('Using direct Postgres connection from DATABASE_URL/DIRECT_URL/SUPABASE_DB_URL/POSTGRES_URL.');
    await runWithPostgres(migrationSQL);
    console.log('Migration executed successfully.');
    return true;
  }

  const ranWithRpc = await runWithSupabaseRpc(migrationSQL, relativePath);
  if (ranWithRpc) {
    console.log('Migration executed successfully.');
  }
  return ranWithRpc;
}

runMigration().then((success) => {
  if (!success) {
    process.exitCode = 1;
  }
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
