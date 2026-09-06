import { getServiceSupabase } from '@/lib/supabase/service';
import { MOCK_EVENTS } from '@/components/events/events-data';
import {
  formatSessionTime,
  getEventMeetings,
  findMeetingBySessionKey,
  toDubaiIso,
  type EventMeeting,
} from '@/lib/events/event-meetings';
import { eventEmailLayout, joinButtonHtml, sendEventEmail } from '@/lib/events/event-emails';
import { renderScheduledEmail } from '@/lib/events/quantum-leap-emails';

/**
 * Event reminder logic — two distinct systems live here. Extracted from the
 * cron route so it's directly testable (pass an explicit `now` rather than
 * always reading `Date.now()`) without waiting for a real calendar date.
 *
 * 1. Curated onboarding sequence (`event.scheduledEmails`): fixed calendar
 *    dates with exact, client-approved copy (currently the Quantum Leap
 *    week-before / day-before / hour-before emails). Fires once its sendAt
 *    has passed, within a catch-up window, per active registrant.
 *
 * 2. Generic per-session reminders (`event.liveSessions`, no scheduledEmails
 *    entry covering that session): a plain "starts in N" email at 7 days and
 *    24 hours before each live session, for events without curated copy.
 *
 * Both are deduplicated through `event_reminders_sent`, keyed by
 * (registration_id, session_key, reminder_type) — inserting that row is the
 * lock, so two overlapping cron runs can never double-send.
 */

type ServiceSupabase = ReturnType<typeof getServiceSupabase>;

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/**
 * How late each kind of scheduled email may still be sent after its target
 * time, if a cron run was missed.
 *
 * These are deliberately tight for the time-sensitive templates: an email
 * saying "we begin in one hour" that arrives the next morning is worse than
 * no email at all, so it is skipped rather than sent wrong. The window must
 * still be at least as long as the gap between cron runs, or the email can
 * never fire — see the note on cron frequency in vercel.json.
 */
// Each window is sized so the email can never contradict itself:
//  - hour_before  : sends are at 16:45 for an 18:00 session, so 60 minutes
//                   keeps it strictly before the session starts.
//  - day_before   : 6 hours keeps it in the same evening, so "tomorrow" is
//                   still true (a wider window could cross midnight).
//  - week_before  : not time-critical; a day late still reads correctly.
// All three comfortably exceed normal Vercel cron drift, which is minutes.
const CATCH_UP_WINDOW_MS: Record<string, number> = {
  week_before: 24 * HOUR_MS,
  day_before: 6 * HOUR_MS,
  hour_before: 60 * 60_000,
};
const DEFAULT_CATCH_UP_MS = 6 * HOUR_MS;

interface Registration {
  id: string;
  name: string;
  email: string;
  event_id: string;
  event_title: string;
  payment_status: string;
  status: string;
}

async function activeRegistrants(supabase: ServiceSupabase, eventIds: string[]): Promise<Registration[]> {
  if (eventIds.length === 0) return [];
  const { data, error } = await supabase
    .from('event_registrations')
    .select('id, name, email, event_id, event_title, payment_status, status')
    .in('event_id', eventIds)
    .eq('status', 'active')
    .in('payment_status', ['free', 'paid']);

  if (error) {
    console.error('[EventReminders] Failed to load registrants:', error);
    return [];
  }
  return data ?? [];
}

type ClaimOutcome = 'claimed' | 'already_sent' | 'error';

/**
 * Claim one (registration, key, type) send via insert — the unique index is
 * the lock. Distinguishes "someone already sent this" (23505, expected and
 * harmless) from a real error (wrong schema, bad reminder_type value, RLS,
 * etc.) so a schema mismatch surfaces as a failure instead of silently
 * miscounting as a normal dedup skip.
 */
async function claimReminder(
  supabase: ServiceSupabase,
  registrationId: string,
  sessionKey: string,
  reminderType: string
): Promise<ClaimOutcome> {
  const { error } = await supabase.from('event_reminders_sent').insert({
    registration_id: registrationId,
    session_key: sessionKey,
    reminder_type: reminderType,
  });
  if (!error) return 'claimed';
  if (error.code === '23505') return 'already_sent';
  console.error('[EventReminders] Failed to claim reminder:', error);
  return 'error';
}

async function releaseClaim(
  supabase: ServiceSupabase,
  registrationId: string,
  sessionKey: string,
  reminderType: string
) {
  await supabase
    .from('event_reminders_sent')
    .delete()
    .eq('registration_id', registrationId)
    .eq('session_key', sessionKey)
    .eq('reminder_type', reminderType);
}

export interface ReminderRunResult {
  sent: number;
  /** Already sent in a previous run — normal, expected dedup behavior. */
  alreadySent: number;
  /** A claim or send genuinely failed — worth investigating. */
  errors: number;
}

// ---------------------------------------------------------------------------
// 1. Curated onboarding sequence
// ---------------------------------------------------------------------------
export async function sendCuratedScheduledEmails(
  supabase: ServiceSupabase,
  now: number
): Promise<ReminderRunResult> {
  let sent = 0;
  let alreadySent = 0;
  let errors = 0;

  for (const event of MOCK_EVENTS) {
    if (!event.scheduledEmails || event.scheduledEmails.length === 0) continue;

    const due = event.scheduledEmails.filter((se) => {
      const sendAtMs = new Date(toDubaiIso(se.sendAt)).getTime();
      const window = CATCH_UP_WINDOW_MS[se.template] ?? DEFAULT_CATCH_UP_MS;
      const lateBy = now - sendAtMs;
      if (lateBy < 0) return false;
      if (lateBy > window) {
        console.warn(
          `[EventReminders] Skipping "${se.key}" — ${Math.round(lateBy / HOUR_MS)}h late, past its ` +
            `${Math.round(window / HOUR_MS)}h window. Sending it now would be misleading.`
        );
        return false;
      }
      return true;
    });
    if (due.length === 0) continue;

    const eventId = event.slug ?? event.id;
    const registrants = await activeRegistrants(supabase, [eventId]);
    if (registrants.length === 0) continue;

    const meetings = await getEventMeetings(supabase, eventId);

    for (const scheduled of due) {
      const targetMeeting = findMeetingBySessionKey(meetings, scheduled.targetSessionKey);
      const meetLink = targetMeeting?.meet_link ?? null;
      const session = event.liveSessions?.find((s) => s.key === scheduled.targetSessionKey);

      for (const registrant of registrants) {
        const outcome = await claimReminder(supabase, registrant.id, scheduled.key, scheduled.template);
        if (outcome === 'already_sent') {
          alreadySent += 1;
          continue;
        }
        if (outcome === 'error') {
          errors += 1;
          continue;
        }

        const { subject, html } = renderScheduledEmail(scheduled.template, {
          event,
          registrantName: registrant.name,
          locale: 'en',
          firstSessionMeetLink: meetLink,
          session,
        });

        const ok = await sendEventEmail({ to: registrant.email, subject, html, replyTo: event.replyToEmail });
        if (ok) {
          sent += 1;
        } else {
          errors += 1;
          await releaseClaim(supabase, registrant.id, scheduled.key, scheduled.template);
        }
      }
    }
  }

  return { sent, alreadySent, errors };
}

// ---------------------------------------------------------------------------
// 2. Generic per-session reminders (events without curated copy)
// ---------------------------------------------------------------------------
function genericReminderHtml(registration: Registration, meeting: EventMeeting, label: string): string {
  const firstName = registration.name.trim().split(' ')[0] || 'there';
  const join = meeting.meet_link
    ? joinButtonHtml(meeting.meet_link)
    : `<p style="margin:16px 0;color:#64748b;">The joining link will be emailed to you shortly before the session.</p>`;

  return eventEmailLayout(`Reminder: ${meeting.title}`, `
      <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;color:#334155;">This is a reminder that <strong>${meeting.title}</strong> starts ${label}.</p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0;">
        <tr><td style="padding:10px 16px;color:#64748b;">Event</td><td style="padding:10px 16px;font-weight:500;">${registration.event_title}</td></tr>
        <tr><td style="padding:10px 16px;color:#64748b;">When</td><td style="padding:10px 16px;font-weight:500;">${formatSessionTime(meeting.starts_at, meeting.ends_at)}</td></tr>
      </table>
      ${join}`);
}

export async function sendGenericSessionReminders(
  supabase: ServiceSupabase,
  now: number
): Promise<ReminderRunResult> {
  const windows = [
    { type: 'reminder_7d', startMs: now + 6.5 * DAY_MS, endMs: now + 7.5 * DAY_MS, label: 'in one week' },
    { type: 'reminder_24h', startMs: now + 12 * HOUR_MS, endMs: now + 36 * HOUR_MS, label: 'tomorrow' },
  ];

  const earliest = new Date(Math.min(...windows.map((w) => w.startMs))).toISOString();
  const latest = new Date(Math.max(...windows.map((w) => w.endMs))).toISOString();

  const { data: meetingRows, error } = await supabase
    .from('event_meetings')
    .select('*')
    .gte('starts_at', earliest)
    .lte('starts_at', latest);

  if (error) {
    console.error('[EventReminders] Failed to load meetings:', error);
    return { sent: 0, alreadySent: 0, errors: 1 };
  }

  // Skip any session already covered by that event's curated onboarding
  // sequence — it gets its own targeted email instead of a generic one.
  const curatedTargets = new Set(
    MOCK_EVENTS.flatMap((e) => (e.scheduledEmails ?? []).map((se) => `${e.slug ?? e.id}:${se.targetSessionKey}`))
  );

  const upcoming = (meetingRows ?? []).filter(
    (m: EventMeeting) => !curatedTargets.has(`${m.event_id}:${m.session_key}`)
  );
  if (upcoming.length === 0) return { sent: 0, alreadySent: 0, errors: 0 };

  const eventIds = Array.from(new Set(upcoming.map((m) => m.event_id)));
  const registrants = await activeRegistrants(supabase, eventIds);

  let sent = 0;
  let alreadySent = 0;
  let errors = 0;

  for (const meeting of upcoming) {
    const startMs = new Date(meeting.starts_at).getTime();
    const window = windows.find((w) => startMs >= w.startMs && startMs <= w.endMs);
    if (!window) continue;

    const audience = registrants.filter((r) => r.event_id === meeting.event_id);

    for (const registration of audience) {
      const outcome = await claimReminder(supabase, registration.id, meeting.session_key, window.type);
      if (outcome === 'already_sent') {
        alreadySent += 1;
        continue;
      }
      if (outcome === 'error') {
        errors += 1;
        continue;
      }

      const ok = await sendEventEmail({
        to: registration.email,
        subject: `Reminder: ${meeting.title} starts ${window.label}`,
        html: genericReminderHtml(registration, meeting, window.label),
      });

      if (ok) {
        sent += 1;
      } else {
        errors += 1;
        await releaseClaim(supabase, registration.id, meeting.session_key, window.type);
      }
    }
  }

  return { sent, alreadySent, errors };
}
