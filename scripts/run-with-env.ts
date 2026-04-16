/**
 * Run a command with environment variables loaded from a specified .env file.
 * Usage: npx tsx scripts/run-with-env.ts .env.test.local next dev
 *        npx tsx scripts/run-with-env.ts .env.test.local scripts/seed.ts
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const envFile = process.argv[2];
const command = process.argv[3];
const commandArgs = process.argv.slice(4);

if (!envFile || !command) {
  console.error('Usage: npx tsx scripts/run-with-env.ts <env-file> <command> [args...]');
  console.error('Example: npx tsx scripts/run-with-env.ts .env.test.local next dev');
  process.exit(1);
}

const envPath = path.resolve(__dirname, '..', envFile);

if (!fs.existsSync(envPath)) {
  console.error(`❌ Environment file not found: ${envPath}`);
  console.error(`   Copy ${envFile}.example to ${envFile} and fill in your credentials.`);
  process.exit(1);
}

// Load env vars from file
const envContent = fs.readFileSync(envPath, 'utf-8');
const loadedVars: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const equalsIndex = trimmed.indexOf('=');
  if (equalsIndex === -1) return;
  const key = trimmed.slice(0, equalsIndex).trim();
  const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|["']$/g, '');
  if (key) loadedVars[key] = value;
});

// Safety check for production URL
if (loadedVars.NEXT_PUBLIC_SUPABASE_URL?.includes('cippnggwojzgfprgexvh')) {
  console.error('❌ BLOCKED: The env file contains the PRODUCTION Supabase URL.');
  console.error('   This runner is for test/development environments only.');
  process.exit(1);
}

console.log(`🔧 Loading environment from: ${envFile}`);
console.log(`   APP_ENV: ${loadedVars.NEXT_PUBLIC_SUPABASE_URL ? loadedVars.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1] || 'custom' : 'not set'}`);
console.log(`🚀 Running: ${command} ${commandArgs.join(' ')}\n`);

// Determine how to run the command
const isNextCommand = command === 'next';
const runCommand = isNextCommand ? 'npx' : 'npx';
const runArgs = isNextCommand ? ['next', ...commandArgs] : ['tsx', command, ...commandArgs];

// Merge env vars
const mergedEnv = {
  ...process.env,
  ...loadedVars,
};

const child = spawn(runCommand, runArgs, {
  stdio: 'inherit',
  env: mergedEnv,
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('❌ Failed to start process:', err.message);
  process.exit(1);
});
