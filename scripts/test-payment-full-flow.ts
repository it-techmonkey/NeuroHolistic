#!/usr/bin/env tsx
/**
 * Payment Flow Test — simulates Ziina payment confirmation without real money.
 * Creates a program + booking so the client appears on the therapist dashboard.
 * Requires dev server running on localhost:3000.
 *
 * Usage:
 *   npx tsx scripts/test-payment-full-flow.ts
 *   npx tsx scripts/test-payment-full-flow.ts --discount 15
 *   npx tsx scripts/test-payment-full-flow.ts --type group
 *   npx tsx scripts/test-payment-full-flow.ts --therapist fawzia-yassmina
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split(/\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (k && v && !process.env[k]) process.env[k] = v;
  });
}

const args = process.argv.slice(2);
const getArg = (n: string) => { const i = args.indexOf(`--${n}`); return i !== -1 ? args[i + 1] : undefined; };
const PROGRAM_TYPE = (getArg('type') || 'private') as 'private' | 'group';
const THERAPIST_SLUG = getArg('therapist') || 'mariam-al-kaisi';
const DISCOUNT = parseInt(getArg('discount') || '0');
const OPTION = (getArg('option') || 'full') as 'full' | 'per_session';

const PRICING: Record<string, { full: number; perSession: number }> = {
  private: { full: 7700, perSession: 800 },
  group: { full: 4500, perSession: 500 },
};
const baseAmount = OPTION === 'full' ? PRICING[PROGRAM_TYPE].full : PRICING[PROGRAM_TYPE].perSession;
const finalAmount = Math.round(baseAmount * (1 - DISCOUNT / 100));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // 1. Check dev server
  try {
    await fetch('http://localhost:3000', { signal: AbortSignal.timeout(3000) });
  } catch {
    console.error('❌ Dev server not running. Start with: npm run dev');
    process.exit(1);
  }

  // 2. Find client user
  const { data: user } = await supabase.from('users').select('id, email, full_name').limit(1).maybeSingle();
  if (!user) { console.error('❌ No user found.'); process.exit(1); }

  // 3. Find therapist user by slug
  const { data: therapist } = await supabase
    .from('users').select('id, full_name').eq('role', 'therapist').limit(1).maybeSingle();

  if (!therapist) { console.error('❌ No therapist found.'); process.exit(1); }

  const therapistName = therapist.full_name || THERAPIST_SLUG.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // 4. Clean slate — delete programs, sessions, bookings, payments for this user
  const { data: oldPrograms } = await supabase.from('programs').select('id').eq('user_id', user.id);
  for (const p of oldPrograms || []) {
    await supabase.from('sessions').delete().eq('program_id', p.id);
    await supabase.from('programs').delete().eq('id', p.id);
  }
  await supabase.from('payments').delete().eq('user_id', user.id).eq('status', 'pending');
  await supabase.from('bookings').delete().eq('user_id', user.id).eq('type', 'free_consultation');
  await supabase.from('therapist_clients').delete().eq('client_id', user.id);

  // 5. Create a completed free consultation booking (links client → therapist)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const { error: bookingErr } = await supabase.from('bookings').insert({
    user_id: user.id,
    name: user.full_name || user.email,
    email: user.email,
    type: 'free_consultation',
    status: 'completed',
    date: tomorrow.toISOString().split('T')[0],
    time: '10:00',
    therapist_user_id: therapist.id,
    therapist_name: therapistName,
    therapist_id: THERAPIST_SLUG,
  });
  if (bookingErr) console.error('Booking insert warning:', bookingErr.message);

  // 6. Create therapist_clients relationship
  await supabase.from('therapist_clients').upsert({
    therapist_id: therapist.id,
    client_id: user.id,
  }, { onConflict: 'therapist_id,client_id' });

  // 7. Create payment record with therapistId in metadata
  const intentId = `TEST_${Date.now()}`;
  const { data: payment, error: payErr } = await supabase.from('payments').insert({
    user_id: user.id,
    amount: finalAmount,
    currency: 'AED',
    type: OPTION === 'full' ? 'full_program' : 'single_session',
    status: 'pending',
    payment_reference: intentId,
    metadata: {
      gateway: 'ziina', userId: user.id, programType: PROGRAM_TYPE,
      storedProgramType: PROGRAM_TYPE, paymentOption: OPTION,
      originalAmountAed: baseAmount, amountAed: finalAmount,
      amountFils: finalAmount * 100, currency: 'AED', totalSessions: 10,
      therapistId: therapist.id,
      therapistName, clientName: user.full_name || user.email,
      clientEmail: user.email,
      ...(DISCOUNT > 0 ? { discountPercent: DISCOUNT, discountedAmountAed: finalAmount, savingsAed: baseAmount - finalAmount } : {}),
    },
  }).select('id').single();

  if (payErr || !payment) { console.error('❌ Payment insert failed:', payErr); process.exit(1); }

  // 8. Send webhook
  const payload = { event: 'payment_intent.status.updated', data: { id: intentId, status: 'completed', amount: finalAmount * 100, currency_code: 'AED' } };
  const raw = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', process.env.ZIINA_WEBHOOK_SECRET || '').update(raw).digest('hex');

  const res = await fetch('http://localhost:3000/api/ziina/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hmac-signature': sig },
    body: raw,
  });
  const body = await res.json() as Record<string, unknown>;

  if (!res.ok || !body.success) {
    console.error(`❌ Webhook failed: ${res.status} — ${body.error || body.message}`);
    process.exit(1);
  }

  // 9. Verify
  await new Promise(r => setTimeout(r, 1500));
  const { data: program } = await supabase
    .from('programs').select('id, status, therapist_user_id, therapist_name')
    .eq('user_id', user.id).eq('status', 'active')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();

  if (!program) { console.error('❌ Program not created.'); process.exit(1); }

  const { count } = await supabase
    .from('sessions').select('id', { count: 'exact', head: true })
    .eq('program_id', program.id);

  console.log(`\n✅ ${user.email} → ${therapistName}`);
  console.log(`   Program: ${program.id}`);
  console.log(`   Therapist ID: ${program.therapist_user_id}`);
  console.log(`   Sessions: ${count}`);
  console.log(`   Amount: ${baseAmount.toLocaleString()} → ${finalAmount.toLocaleString()} AED${DISCOUNT > 0 ? ` (${DISCOUNT}% off)` : ''}`);
  console.log(`\n   Check ${therapistName}'s dashboard now.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
