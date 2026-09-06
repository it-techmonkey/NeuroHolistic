/**
 * Real end-to-end test of the curated onboarding-email cron logic, against
 * the live database and a real (throwaway) registration — not a mock.
 *
 * Passes an explicit `now` timestamp so we don't have to wait for the real
 * October 2026 dates to arrive. Verifies:
 *   1. The "week before" email fires exactly once when its time is due.
 *   2. Running again at the same `now` sends nothing (dedup works).
 *   3. The other two scheduled emails (day/hour before) do NOT fire early.
 *
 * ALWAYS cleans up the throwaway registration and reminder-claim rows it
 * creates, even on failure (best-effort, printed if it can't).
 *
 * Usage:
 *   npx tsx scripts/test-scheduled-email-cron.ts --email=you@gmail.com
 */

import fs from 'fs';
import path from 'path';
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

const EVENT_ID = 'neuroholistic-consciousness-quantum-leap';

async function main() {
  const emailArg = process.argv.find((a) => a.startsWith('--email='))?.split('=')[1];
  if (!emailArg) {
    console.error('Usage: npx tsx scripts/test-scheduled-email-cron.ts --email=you@gmail.com');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const { findEvent, toDubaiIso } = await import('../src/lib/events/event-meetings');
  const { sendCuratedScheduledEmails } = await import('../src/lib/events/event-reminders');

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const event = findEvent(EVENT_ID);
  if (!event?.scheduledEmails?.length) {
    console.error(`Event "${EVENT_ID}" has no scheduledEmails configured.`);
    process.exit(1);
  }

  const weekBefore = event.scheduledEmails.find((se) => se.template === 'week_before');
  if (!weekBefore) {
    console.error('No week_before scheduled email found.');
    process.exit(1);
  }

  // Fire exactly the "week before" email: now = its sendAt + 1 minute.
  const now = new Date(toDubaiIso(weekBefore.sendAt)).getTime() + 60_000;
  console.log(`Simulated "now": ${new Date(now).toISOString()} (1 minute after the week-before send time)\n`);

  // Use the real provided address (not a fake domain) so this test also
  // proves actual delivery through Resend, not just the dedup logic.
  const testEmail = emailArg;
  console.log(`Creating throwaway registration: ${testEmail}`);

  const { data: registration, error: insertError } = await supabase
    .from('event_registrations')
    .insert({
      event_id: EVENT_ID,
      event_title: event.locales.en.title,
      name: 'Cron Test',
      email: testEmail,
      phone: '+971500000000',
      payment_status: 'paid',
      status: 'active',
    })
    .select('id')
    .single();

  if (insertError || !registration) {
    console.error('Failed to create throwaway registration:', insertError);
    process.exit(1);
  }

  let exitCode = 0;

  try {
    console.log('\n--- Run 1: should send exactly 1 email (week_before), 0 errors ---');
    const run1 = await sendCuratedScheduledEmails(supabase, now);
    console.log(run1);
    if (run1.sent !== 1 || run1.errors !== 0) {
      console.error('FAIL: expected { sent: 1, errors: 0 } on first run.');
      exitCode = 1;
    } else {
      console.log('PASS');
    }

    console.log('\n--- Run 2: same "now" again — should send 0, alreadySent 1 (dedup) ---');
    const run2 = await sendCuratedScheduledEmails(supabase, now);
    console.log(run2);
    if (run2.sent !== 0 || run2.alreadySent !== 1 || run2.errors !== 0) {
      console.error('FAIL: expected { sent: 0, alreadySent: 1, errors: 0 } on second run.');
      exitCode = 1;
    } else {
      console.log('PASS');
    }

    console.log(`\nA real "week before" email was sent to ${emailArg} as part of this test — check the inbox.`);
  } finally {
    console.log('\n--- Cleanup ---');
    const { error: delReminders } = await supabase
      .from('event_reminders_sent')
      .delete()
      .eq('registration_id', registration.id);
    const { error: delReg } = await supabase.from('event_registrations').delete().eq('id', registration.id);

    if (delReminders || delReg) {
      console.error('CLEANUP FAILED — manual cleanup required:');
      console.error(`  delete from event_reminders_sent where registration_id = '${registration.id}';`);
      console.error(`  delete from event_registrations where id = '${registration.id}';`);
      exitCode = 1;
    } else {
      console.log('Cleaned up throwaway registration and reminder-claim rows.');
    }
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
