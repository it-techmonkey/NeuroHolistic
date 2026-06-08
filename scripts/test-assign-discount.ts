#!/usr/bin/env tsx
/**
 * Discount test tool.
 * 
 * Usage:
 *   npx tsx scripts/test-assign-discount.ts --list
 *   npx tsx scripts/test-assign-discount.ts --assign --email user@test.com --percent 15
 *   npx tsx scripts/test-assign-discount.ts --remove --email user@test.com
 *   npx tsx scripts/test-assign-discount.ts --cleanup
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf-8').split(/\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (k && v && !process.env[k]) process.env[k] = v;
  });
}
loadEnv();

const args = process.argv.slice(2);
const getArg = (n: string) => { const i = args.indexOf(`--${n}`); return i !== -1 ? args[i + 1] : undefined; };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  if (args.includes('--list')) {
    const { data } = await supabase.from('client_discounts').select('id, client_id, discount_percent, reason, is_active').eq('is_active', true);
    if (!data?.length) { console.log('No active discounts.'); return; }
    const ids = [...new Set(data.map(d => d.client_id))];
    const { data: users } = await supabase.from('users').select('id, email').in('id', ids);
    const map = new Map(users?.map(u => [u.id, u.email]) || []);
    data.forEach(d => console.log(`  ${d.discount_percent}% — ${map.get(d.client_id) || d.client_id} (${d.reason || 'no reason'})`));
    return;
  }

  if (args.includes('--cleanup')) {
    await supabase.from('client_discounts').update({ is_active: false }).eq('is_active', true);
    console.log('All discounts deactivated.'); return;
  }

  const email = getArg('email');
  if (!email) { console.error('--email required'); process.exit(1); }

  const { data: user } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (!user) { console.error(`User not found: ${email}`); process.exit(1); }

  if (args.includes('--remove')) {
    await supabase.from('client_discounts').update({ is_active: false }).eq('client_id', user.id).eq('is_active', true);
    console.log(`Discount removed for ${email}`); return;
  }

  if (args.includes('--assign')) {
    const pct = parseInt(getArg('percent') || '15');
    if (![10, 15, 20].includes(pct)) { console.error('--percent must be 10, 15, or 20'); process.exit(1); }
    const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').limit(1).maybeSingle();
    if (!admin) { console.error('No admin found'); process.exit(1); }
    await supabase.from('client_discounts').update({ is_active: false }).eq('client_id', user.id).eq('is_active', true);
    await supabase.from('client_discounts').insert({ client_id: user.id, discount_percent: pct, assigned_by: admin.id, reason: getArg('reason') || 'Test', is_active: true });
    console.log(`${pct}% discount assigned to ${email}`);
    return;
  }

  console.log('Usage: --list | --assign --email X --percent N | --remove --email X | --cleanup');
}

main().catch(e => { console.error(e); process.exit(1); });
