#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|["']$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
}

loadEnvFile();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function generatePassword(length = 20) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}<>?';
  const all = lowercase + uppercase + numbers + symbols;
  const bytes = crypto.randomBytes(length);
  let pwd = Array.from(bytes).map(b => all[b % all.length]).join('');
  // ensure char classes
  pwd = pwd
    .replace(pwd[0], lowercase[crypto.randomInt(lowercase.length)])
    .replace(pwd[1], uppercase[crypto.randomInt(uppercase.length)])
    .replace(pwd[2], numbers[crypto.randomInt(numbers.length)])
    .replace(pwd[3], symbols[crypto.randomInt(symbols.length)]);
  return pwd;
}

async function findAdminCandidate() {
  const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;
  const users = (usersList as any)?.users || [];

  // Gather potential admin users by checking public.users.role
  const candidates: Array<any> = [];

  for (const u of users) {
    const email = (u.email || '').toLowerCase();
    try {
      const { data: profile } = await supabaseAdmin.from('users').select('role,email').eq('id', u.id).maybeSingle();
      const role = profile?.role;
      if (role === 'admin') {
        candidates.push({ user: u, reason: `profile role=admin` });
        continue;
      }
      // fallback heuristics
      if (email.includes('admin') || email.includes('super')) {
        candidates.push({ user: u, reason: `email-match (${email})` });
      }
    } catch (err) {
      // ignore per-user errors
    }
  }

  return candidates;
}

async function run() {
  console.log('🔐 Searching for admin users...');
  const candidates = await findAdminCandidate();

  if (!candidates || candidates.length === 0) {
    console.error('❌ No admin candidates found. Provide an email to target.');
    process.exit(1);
  }

  const chosen = candidates[0].user;
  const chosenEmail = chosen.email;
  console.log(`Found candidate: ${chosenEmail} (${candidates[0].reason})`);

  const newPassword = generatePassword(20);

  console.log('🔁 Updating password for user...');
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(chosen.id, {
    password: newPassword,
  });

  if (updateError) {
    console.error('❌ Failed to update user password:', updateError.message || updateError);
    process.exit(1);
  }

  const out = `Super admin password updated\nEmail: ${chosenEmail}\nPassword: ${newPassword}\nUpdated: ${new Date().toISOString()}\n`;
  fs.writeFileSync('./SUPERADMIN_PASSWORD.txt', out, { mode: 0o600 });
  console.log('\n✅ Password updated and saved to ./SUPERADMIN_PASSWORD.txt');
  console.log('\n' + out);
}

run().catch((err) => {
  console.error('❌ Error:', err?.message || err);
  process.exit(1);
});
