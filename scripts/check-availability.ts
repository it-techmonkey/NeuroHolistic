#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split(/\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (k && v && !process.env[k]) process.env[k] = v;
  });
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase config in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const therapistId = process.argv[2] || '';
  if (!therapistId) {
    console.error('Usage: tsx scripts/check-availability.ts <therapistId>');
    process.exit(1);
  }

  const { data, error } = await supabase.from('therapist_availability').select('*').eq('therapist_id', therapistId).order('day_of_week', { ascending: true }).order('exception_date', { ascending: true });
  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  console.log('Found', (data || []).length, 'availability rows for', therapistId);
  console.table((data || []).map(r => ({ id: r.id, day_of_week: r.day_of_week, exception_date: r.exception_date, start_time: r.start_time, end_time: r.end_time, is_blocked: r.is_blocked })));
}

main().catch(err => { console.error(err); process.exit(1); });
