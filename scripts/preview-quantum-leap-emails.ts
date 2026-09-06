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
  console.log(`First-session Meet link: ${meetLink ?? '(none provisioned — emails will show the "being prepared" fallback)'}\n`);

  const input = {
    event,
    registrantName: 'Jordan Test',
    locale: 'en' as const,
    firstSessionMeetLink: meetLink,
  };

  const templates: Record<string, () => { subject: string; html: string }> = {
    confirmation: () => registrationConfirmedEmail(input),
    week_before: () => weekBeforeEmail(input),
    day_before: () => dayBeforeEmail(input),
    hour_before: () => hourBeforeEmail(input),
  };

  const keys = only ? [only] : Object.keys(templates);
  const invalid = keys.filter((k) => !templates[k]);
  if (invalid.length) {
    console.error(`Unknown template(s): ${invalid.join(', ')}. Valid: ${Object.keys(templates).join(', ')}`);
    process.exit(1);
  }

  for (const key of keys) {
    const { subject, html } = templates[key]();
    console.log(`Sending "${key}" -> ${emailArg} ...`);
    const ok = await sendEventEmail({ to: emailArg, subject, html, replyTo: event.replyToEmail });
    console.log(`  ${ok ? 'sent' : 'FAILED'} — subject: "${subject}"`);
  }

  console.log('\nDone. Check the inbox (and spam folder) for 4 separate emails.');
  console.log('This script wrote nothing to event_registrations or event_reminders_sent — nothing to clean up.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
