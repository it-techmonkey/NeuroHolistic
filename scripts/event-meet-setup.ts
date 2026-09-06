/**
 * Event Meet-link & reminder setup checker.
 *
 *   npx tsx scripts/event-meet-setup.ts                 # read-only diagnosis
 *   npx tsx scripts/event-meet-setup.ts --provision     # create the Meet links
 *   npx tsx scripts/event-meet-setup.ts --reminders     # dry-run the reminder cron
 *   npx tsx scripts/event-meet-setup.ts --reset --provision
 *                                                        # wipe + recreate all 5 links
 *                                                        # (use after switching the host's
 *                                                        # connected Google account)
 *
 * Read-only by default. `--provision` and `--reset` are the flags that write
 * anything — `--provision` creates real calendar entries on the host
 * therapist's Google Calendar, `--reset` deletes the local event_meetings
 * rows (not the remote calendar events on the old account).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load .env.local the same way the other scripts in this repo do.
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

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const { MOCK_EVENTS } = await import('../src/components/events/events-data');
  const { ensureEventMeetings, getEventMeetings, resolveHostTherapistId, findEvent } =
    await import('../src/lib/events/event-meetings');
  const { isGoogleCalendarConnected } = await import('../src/lib/google/token-service');

  const EVENT_ID = process.argv.find((a) => a.startsWith('--event='))?.split('=')[1]
    ?? 'neuroholistic-consciousness-quantum-leap';
  const doProvision = process.argv.includes('--provision');
  const doReminders = process.argv.includes('--reminders');
  const doReset = process.argv.includes('--reset');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const ok = (b: boolean) => (b ? '\x1b[32mOK\x1b[0m' : '\x1b[31mMISSING\x1b[0m');
  let blocked = false;

  console.log(`\n=== Event Meet & reminder setup: ${EVENT_ID} ===\n`);

  // ---------- 1. Schema ----------
  console.log('1. Database schema');
  const schemaChecks: [string, string][] = [
    ['event_meetings', 'id,event_id,session_key,meet_link'],
    ['event_reminders_sent', 'id,registration_id,session_key,reminder_type'],
    ['event_registrations', 'payment_status,status,selected_date'],
  ];
  for (const [table, cols] of schemaChecks) {
    const { error } = await supabase.from(table).select(cols).limit(1);
    if (error) blocked = true;
    console.log(`   ${table.padEnd(24)} ${ok(!error)}${error ? `  (${error.message})` : ''}`);
  }

  if (blocked) {
    console.log('\n   \x1b[33m→ Run supabase/migrations/APPLY_ME_027_029_030_combined.sql');
    console.log('     in the Supabase SQL Editor first. Nothing else can work until then.\x1b[0m\n');
    process.exit(1);
  }

  // ---------- 2. Event definition ----------
  console.log('\n2. Event definition');
  const event = findEvent(EVENT_ID);
  if (!event) {
    console.log(`   \x1b[31mNo event with id/slug "${EVENT_ID}" in events-data.ts\x1b[0m`);
    console.log(`   Known: ${MOCK_EVENTS.map((e) => e.slug ?? e.id).join(', ')}`);
    process.exit(1);
  }
  console.log(`   title            ${event.locales.en.title}`);
  console.log(`   paid             ${event.isPaid ? 'yes' : 'no'}`);
  console.log(`   live sessions    ${event.liveSessions?.length ?? 0}`);
  console.log(`   host therapist   ${event.hostTherapistEmail ?? '(none)'}`);

  // ---------- 3. Google connection ----------
  console.log('\n3. Host therapist Google Calendar');
  const hostId = await resolveHostTherapistId(supabase, event);
  console.log(`   user resolved    ${ok(!!hostId)}${hostId ? `  (${hostId})` : '  — email not found in users table'}`);
  let connected = false;
  let connectedEmail: string | null = null;
  if (hostId) {
    connected = await isGoogleCalendarConnected(hostId);
    console.log(`   google connected ${ok(connected)}`);
    if (!connected) {
      console.log('   \x1b[33m→ She must sign in at /dashboard/therapist and connect Google Calendar.\x1b[0m');
    } else {
      try {
        const { getValidAccessToken } = await import('../src/lib/google/token-service');
        const { google } = await import('googleapis');
        const token = await getValidAccessToken(hostId);
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: token });
        const calendar = google.calendar({ version: 'v3', auth });
        const primary = await calendar.calendars.get({ calendarId: 'primary' });
        connectedEmail = primary.data.id ?? null;
        const isWorkspace = connectedEmail && event.hostTherapistEmail
          ? connectedEmail.split('@')[1] === event.hostTherapistEmail.split('@')[1]
          : false;
        console.log(`   connected account ${connectedEmail}${isWorkspace ? ' \x1b[32m(matches institute domain)\x1b[0m' : ' \x1b[33m(personal account — 60min Meet limit risk on 4h sessions)\x1b[0m'}`);
      } catch (err: any) {
        console.log(`   \x1b[33mcould not verify connected account: ${err.message}\x1b[0m`);
      }
    }
  }

  // ---------- 4. Environment ----------
  console.log('\n4. Environment');
  for (const key of ['RESEND_API_KEY', 'CRON_SECRET', 'BOOKING_EMAIL_FROM', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']) {
    console.log(`   ${key.padEnd(24)} ${ok(!!process.env[key])}`);
  }

  // ---------- 5. Meet links ----------
  console.log('\n5. Meet links');

  if (doReset) {
    console.log('   \x1b[33mResetting: deleting all event_meetings rows for this event...\x1b[0m');
    console.log('   Note: this does NOT delete the old calendar events already created on the');
    console.log('   previously-connected Google account — those are harmless leftovers there.');
    const { error: resetError, count } = await supabase
      .from('event_meetings')
      .delete({ count: 'exact' })
      .eq('event_id', EVENT_ID);
    if (resetError) {
      console.log(`   \x1b[31mReset failed: ${resetError.message}\x1b[0m`);
    } else {
      console.log(`   Deleted ${count ?? 0} row(s). Re-run with --provision to create fresh links${connectedEmail ? ` on ${connectedEmail}` : ''}.`);
    }
  }

  if (doProvision) {
    if (!connected) {
      console.log('   \x1b[31mSkipped: host therapist has no connected Google account.\x1b[0m');
    } else {
      console.log('   Provisioning (this creates real calendar events)...');
      const res = await ensureEventMeetings(supabase, EVENT_ID);
      console.log(`   created: ${res.created.length ? res.created.join(', ') : 'none (already existed)'}`);
      for (const f of res.failed) console.log(`   \x1b[31mfailed ${f.sessionKey}: ${f.error}\x1b[0m`);
    }
  }

  const meetings = await getEventMeetings(supabase, EVENT_ID);
  if (meetings.length === 0) {
    console.log('   No rows yet. Run with --provision, or use the admin dashboard button.');
  }
  for (const m of meetings) {
    const when = new Date(m.starts_at).toLocaleString('en-US', {
      timeZone: 'Asia/Dubai', dateStyle: 'medium', timeStyle: 'short',
    });
    console.log(`   ${when.padEnd(24)} ${m.meet_link ?? '\x1b[33m(no link yet)\x1b[0m'}`);
  }

  // ---------- 6. Reminder dry run ----------
  if (doReminders) {
    console.log('\n6. Reminder dry run (no emails sent)');
    const now = Date.now();
    const H = 3_600_000;
    const windows = [
      { type: 'reminder_7d', start: now + 6.5 * 24 * H, end: now + 7.5 * 24 * H, label: 'in one week' },
      { type: 'reminder_24h', start: now + 12 * H, end: now + 36 * H, label: 'tomorrow' },
    ];

    const { data: regs } = await supabase
      .from('event_registrations')
      .select('id,name,email,payment_status,status')
      .eq('event_id', EVENT_ID)
      .eq('status', 'active')
      .in('payment_status', ['free', 'paid']);

    console.log(`   eligible registrants: ${regs?.length ?? 0}`);
    let due = 0;
    for (const m of meetings) {
      const startMs = new Date(m.starts_at).getTime();
      const w = windows.find((x) => startMs >= x.start && startMs <= x.end);
      if (w) {
        due += regs?.length ?? 0;
        console.log(`   \x1b[32mDUE NOW\x1b[0m ${m.title} -> ${w.type} ("${w.label}") to ${regs?.length ?? 0} people`);
      }
    }
    if (due === 0) {
      console.log('   Nothing due in the current windows — expected until ~7 days before a session.');
      const next = meetings.map((m) => new Date(m.starts_at).getTime()).filter((t) => t > now).sort()[0];
      if (next) {
        const days = Math.round((next - now) / 86_400_000);
        console.log(`   Next session is in ~${days} days; first reminder fires ~${Math.max(days - 7, 0)} days from now.`);
      }
    }
  }

  console.log('\nDone.\n');

}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
