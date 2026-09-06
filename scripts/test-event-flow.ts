/**
 * End-to-end test for the paid event flow, without paying real money.
 *
 * IMPORTANT: .env.local points at the PRODUCTION Supabase project. There is
 * no separate staging database, so this script writes real rows and sends
 * real emails via your real Resend account. It is designed to be safe to run
 * against production, but you MUST run the printed cleanup command when done
 * so a test registration doesn't sit in the admin dashboard or count toward
 * real numbers.
 *
 * Prerequisites:
 *   1. `npm run dev` running in another terminal (this script calls your
 *      local API routes on http://localhost:3000).
 *   2. The APPLY_ME_027_029_030_combined.sql migration already run.
 *
 * Usage:
 *   npx tsx scripts/test-event-flow.ts --email=you@gmail.com
 *   npx tsx scripts/test-event-flow.ts --email=you@gmail.com --reminder-test
 *   npx tsx scripts/test-event-flow.ts --cleanup=<registration-id>
 *
 * What --email=... does:
 *   1. Registers you for the real Quantum Leap event through the real
 *      /api/events/create-payment route (server-side price validation, a
 *      real Ziina test-mode payment intent — no card, no charge).
 *   2. Simulates Ziina confirming the payment by POSTing a signed webhook
 *      to your local /api/ziina/webhook, exactly like Ziina would.
 *   3. That marks the registration paid, provisions the real Meet links for
 *      all 5 sessions (idempotent — safe even if already created), and
 *      sends you the real confirmation email.
 *   4. Prints what to check, and the exact cleanup command to run after.
 *
 * What --reminder-test does (combine with --email, or run standalone against
 * an existing registration with --reg-id=<id>):
 *   Inserts one throwaway session 20 hours from now, fires the real reminder
 *   cron route so you get a real "tomorrow" reminder email, then deletes the
 *   throwaway session and its reminder-sent record. Does not touch the real
 *   5 event sessions.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
    if (key && value && !process.env[key]) process.env[key] = value;
  }
}

const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const EVENT_ID = 'neuroholistic-consciousness-quantum-leap';

function arg(name: string): string | undefined {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag?.split('=').slice(1).join('=');
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const cleanupId = arg('cleanup');
  if (cleanupId) {
    await cleanup(supabase, cleanupId);
    return;
  }

  const email = arg('email');
  const reminderOnly = hasFlag('reminder-test') && !email && arg('reg-id');

  if (!email && !reminderOnly) {
    console.log(`
Usage:
  npx tsx scripts/test-event-flow.ts --email=you@gmail.com
  npx tsx scripts/test-event-flow.ts --email=you@gmail.com --reminder-test
  npx tsx scripts/test-event-flow.ts --reminder-test --reg-id=<existing-registration-id>
  npx tsx scripts/test-event-flow.ts --cleanup=<registration-id>
`);
    process.exit(1);
  }

  let registrationId = arg('reg-id') || null;

  if (email) {
    registrationId = await registerAndPay(supabase, email);
  }

  if (hasFlag('reminder-test')) {
    if (!registrationId) {
      console.error('Need --reg-id=<id> (or run with --email to create one first).');
      process.exit(1);
    }
    await reminderTest(supabase, registrationId);
  }

  if (registrationId) {
    console.log('\n=== When you are done checking everything ===');
    console.log(`Run:  npx tsx scripts/test-event-flow.ts --cleanup=${registrationId}\n`);
  }
}

async function registerAndPay(supabase: any, email: string): Promise<string> {
  const name = arg('name') || 'TEST DELETE ME';
  const phone = arg('phone') || '+971500000000';

  console.log(`\n1. Registering "${name}" <${email}> for the event via /api/events/create-payment...`);
  const createRes = await fetch(`${BASE_URL}/api/events/create-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: EVENT_ID, eventTitle: 'NeuroHolistic Consciousness Quantum Leap™', name, email, phone }),
  });
  const createData = await createRes.json();

  if (!createRes.ok) {
    // Already paid from a previous run of this script — reuse that
    // registration instead of failing, so --reminder-test can chain onto it.
    if (createRes.status === 409) {
      console.log('   Already registered and paid — reusing the existing registration.');
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', EVENT_ID)
        .ilike('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existing) {
        console.error('   Could not find the existing registration either — aborting.');
        process.exit(1);
      }
      console.log(`   registration id: ${existing.id}`);
      await printMeetings(supabase);
      return existing.id;
    }

    console.error('   FAILED:', createData.error || createData);
    process.exit(1);
  }
  console.log(`   payment intent created: ${createData.paymentIntentId}`);
  console.log(`   (real checkout link, unused: ${createData.paymentLink})`);

  console.log('\n2. Simulating Ziina confirming payment (signed webhook, no real card)...');
  const payload = {
    event: 'payment_intent.status.updated',
    data: { id: createData.paymentIntentId, status: 'completed', amount: 100000, currency_code: 'AED' },
  };
  const raw = JSON.stringify(payload);
  const secret = process.env.ZIINA_WEBHOOK_SECRET || '';
  const signature = crypto.createHmac('sha256', secret).update(raw).digest('hex');

  const webhookRes = await fetch(`${BASE_URL}/api/ziina/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hmac-signature': signature },
    body: raw,
  });
  const webhookText = await webhookRes.text();
  console.log(`   webhook response (${webhookRes.status}):`, webhookText);

  console.log('\n3. Reading back the registration + Meet links (provisioning runs async, waiting 5s)...');
  await new Promise((r) => setTimeout(r, 5000));

  const { data: reg } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', EVENT_ID)
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!reg) {
    console.error('   Could not find the registration row afterward — something failed upstream.');
    process.exit(1);
  }
  console.log(`   registration id: ${reg.id}`);
  console.log(`   payment_status:  ${reg.payment_status}${reg.payment_status === 'paid' ? '  ✓' : '  ✗ expected "paid"'}`);

  await printMeetings(supabase);

  console.log('\n=== Now check by hand ===');
  console.log(`  - Inbox for ${email}: confirmation email with the 5 Meet links`);
  console.log(`  - Admin dashboard → Events tab → select this event in the dropdown (not "All events")`);
  console.log(`    → this registration should show, status "paid"; Meet links panel shows below it`);

  return reg.id;
}

async function printMeetings(supabase: any) {
  const { data: meetings } = await supabase
    .from('event_meetings')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('starts_at', { ascending: true });

  console.log(`\n   Meet links (${meetings?.length ?? 0}/5 sessions provisioned):`);
  for (const m of meetings ?? []) {
    console.log(`     ${m.title.padEnd(60)} ${m.meet_link ?? '(no link — check host Google connection)'}`);
  }
}

async function reminderTest(supabase: any, registrationId: string) {
  console.log('\n4. Reminder test: inserting a throwaway session 20 hours from now...');
  const sessionKey = `manual-test-${Date.now()}`;
  const startsAt = new Date(Date.now() + 20 * 3_600_000).toISOString();
  const endsAt = new Date(Date.now() + 22 * 3_600_000).toISOString();

  const { error: insertErr } = await supabase.from('event_meetings').insert({
    event_id: EVENT_ID,
    session_key: sessionKey,
    title: 'TEST REMINDER SESSION (delete me)',
    starts_at: startsAt,
    ends_at: endsAt,
    meet_link: 'https://meet.google.com/test-link-not-real',
  });
  if (insertErr) {
    console.error('   Failed to insert test session:', insertErr.message);
    return;
  }

  console.log('   Firing /api/internal/send-event-reminders (the real cron route)...');
  const cronRes = await fetch(`${BASE_URL}/api/internal/send-event-reminders`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  const cronData = await cronRes.json();
  console.log(`   response (${cronRes.status}):`, cronData);

  console.log('   Cleaning up the throwaway session...');
  await supabase.from('event_reminders_sent').delete().eq('session_key', sessionKey);
  await supabase.from('event_meetings').delete().eq('event_id', EVENT_ID).eq('session_key', sessionKey);

  console.log('\n=== Now check by hand ===');
  console.log(`   Inbox for the registrant on registration ${registrationId}: a "starts tomorrow" reminder email.`);
}

async function cleanup(supabase: any, registrationId: string) {
  console.log(`\nCleaning up test registration ${registrationId}...`);

  const { data: reg } = await supabase.from('event_registrations').select('*').eq('id', registrationId).maybeSingle();
  if (!reg) {
    console.log('   Already gone — nothing to do.');
    return;
  }

  await supabase.from('event_reminders_sent').delete().eq('registration_id', registrationId);
  const { error: regErr } = await supabase.from('event_registrations').delete().eq('id', registrationId);
  console.log(`   event_registrations row: ${regErr ? `FAILED (${regErr.message})` : 'deleted'}`);

  if (reg.payment_reference) {
    const { error: payErr } = await supabase.from('payments').delete().eq('payment_reference', reg.payment_reference);
    console.log(`   matching payments row:   ${payErr ? `FAILED (${payErr.message})` : 'deleted'}`);
  }

  console.log('\nNote: the 5 real Meet links / calendar entries for the actual event were NOT deleted —');
  console.log('those are the real sessions you want to keep. Only the test registration was removed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
