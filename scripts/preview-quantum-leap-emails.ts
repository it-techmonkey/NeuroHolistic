/**
 * Renders and sends the 4 Quantum Leap onboarding emails to a real inbox for
 * visual QA — using the REAL Meet link already provisioned for the first
 * live session. This does NOT touch event_registrations or
 * event_reminders_sent, so it is safe to run as many times as you like and
 * needs no cleanup.
 *
 * Usage:
 *   npx tsx scripts/preview-quantum-leap-emails.ts --email=you@gmail.com
 *   npx tsx scripts/preview-quantum-leap-emails.ts --email=you@gmail.com --only=hour_before
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
  const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];

  if (!emailArg) {
    console.error('Usage: npx tsx scripts/preview-quantum-leap-emails.ts --email=you@gmail.com');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const { findEvent, getEventMeetings, firstSessionMeetLink } = await import('../src/lib/events/event-meetings');
  const { sendEventEmail } = await import('../src/lib/events/event-emails');
  const {
    registrationConfirmedEmail,
    weekBeforeEmail,
    dayBeforeEmail,
    hourBeforeEmail,
  } = await import('../src/lib/events/quantum-leap-emails');

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const event = findEvent(EVENT_ID);
  if (!event) {
    console.error(`Event "${EVENT_ID}" not found in events-data.ts`);
    process.exit(1);
  }

  const meetings = await getEventMeetings(supabase, EVENT_ID);
  const meetLink = firstSessionMeetLink(event, meetings);
  const base = { event, registrantName: 'Jordan Test', locale: 'en' as const };

  // Build one entry per email the sequence will actually send, in send order,
  // each using its own target session's wording and Meet link.
  const templates: { key: string; render: () => { subject: string; html: string } }[] = [
    { key: 'confirmation', render: () => registrationConfirmedEmail({ ...base, firstSessionMeetLink: meetLink }) },
  ];

  for (const se of event.scheduledEmails ?? []) {
    const session = event.liveSessions?.find((s) => s.key === se.targetSessionKey);
    const link = meetings.find((m) => m.session_key === se.targetSessionKey)?.meet_link ?? null;
    const input = { ...base, firstSessionMeetLink: link, session };
    const render =
      se.template === 'week_before'
        ? () => weekBeforeEmail(input)
        : se.template === 'day_before'
          ? () => dayBeforeEmail(input)
          : () => hourBeforeEmail(input);
    templates.push({ key: se.key, render });
  }

  const selected = only ? templates.filter((t) => t.key === only || t.key.includes(only)) : templates;
  if (selected.length === 0) {
    console.error(`No template matched "${only}". Available: ${templates.map((t) => t.key).join(', ')}`);
    process.exit(1);
  }

  console.log(`Sending ${selected.length} email(s) to ${emailArg}\n`);
  for (const { key, render } of selected) {
    const { subject, html } = render();
    const ok = await sendEventEmail({ to: emailArg, subject, html, replyTo: event.replyToEmail });
    console.log(`  ${ok ? 'sent' : 'FAILED'}  ${key.padEnd(26)} "${subject}"`);
  }

  console.log(`\nDone. Check the inbox (and spam folder) for ${selected.length} separate email(s).`);
  console.log('This script wrote nothing to event_registrations or event_reminders_sent — nothing to clean up.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
