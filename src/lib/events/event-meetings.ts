import type { SupabaseClient } from '@supabase/supabase-js';
import { MOCK_EVENTS } from '@/components/events/events-data';
import type { EventItem, EventLiveSession } from '@/components/events/types';
import { createMeetEvent } from '@/lib/meeting/google-meet';

/**
 * Google Meet provisioning for live events.
 *
 * Each live session gets its own Meet link and calendar entry, created on the
 * host therapist's connected Google account — so the event sits on her own
 * calendar alongside her one-to-one sessions, rather than on a generic
 * institute account.
 */

export interface EventMeeting {
  id: string;
  event_id: string;
  session_key: string;
  title: string;
  starts_at: string;
  ends_at: string;
  meet_link: string | null;
  calendar_event_id: string | null;
  host_therapist_id: string | null;
}

/** Events are static content, so look the definition up by slug or id. */
export function findEvent(eventId: string): EventItem | undefined {
  return MOCK_EVENTS.find((e) => (e.slug ?? e.id) === eventId);
}

/** Dubai is UTC+4 year-round (no DST), so a fixed offset is safe here. */
const DUBAI_OFFSET = '+04:00';

export function toDubaiIso(localDateTime: string): string {
  return `${localDateTime}${DUBAI_OFFSET}`;
}

/** Resolve the host therapist's user id from the email in the event definition. */
export async function resolveHostTherapistId(
  supabase: SupabaseClient,
  event: EventItem
): Promise<string | null> {
  if (!event.hostTherapistEmail) return null;

  const { data } = await supabase
    .from('users')
    .select('id')
    .ilike('email', event.hostTherapistEmail)
    .maybeSingle();

  return data?.id ?? null;
}

export async function getEventMeetings(
  supabase: SupabaseClient,
  eventId: string
): Promise<EventMeeting[]> {
  const { data, error } = await supabase
    .from('event_meetings')
    .select('*')
    .eq('event_id', eventId)
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('[EventMeetings] Failed to load meetings:', error);
    return [];
  }
  return (data ?? []) as EventMeeting[];
}

interface ProvisionResult {
  meetings: EventMeeting[];
  created: string[];
  failed: { sessionKey: string; error: string }[];
}

/** Postgres "relation does not exist" — the migration has not been applied yet. */
const UNDEFINED_TABLE = '42P01';
const UNIQUE_VIOLATION = '23505';

/**
 * How long to wait before a session whose provisioning failed may be retried.
 * Doubles as a lock window: a concurrent caller will not re-attempt a session
 * that another request touched within this period.
 */
const RETRY_AFTER_MS = 2 * 60 * 1000;

/**
 * Ensure every live session of an event has a Meet link.
 *
 * Idempotent and safe under concurrency: the unique index on
 * (event_id, session_key) acts as the lock. Whoever inserts the row owns the
 * first provisioning attempt; everyone else reads the result. A session whose
 * provisioning failed is retried only after RETRY_AFTER_MS, so two
 * simultaneous registrations can never create two calendar events for the
 * same session.
 */
export async function ensureEventMeetings(
  supabase: SupabaseClient,
  eventId: string
): Promise<ProvisionResult> {
  const event = findEvent(eventId);
  const sessions: EventLiveSession[] = event?.liveSessions ?? [];
  const result: ProvisionResult = { meetings: [], created: [], failed: [] };

  if (!event || sessions.length === 0) return result;

  const hostTherapistId = await resolveHostTherapistId(supabase, event);

  for (const session of sessions) {
    const startsAt = toDubaiIso(session.startsAt);
    const endsAt = toDubaiIso(session.endsAt);
    const title = `${event.locales.en.title} — ${session.title.en}`;
    const now = new Date().toISOString();

    // --- Step 1: claim this session -------------------------------------
    // Inserting is the lock. Success means we own the provisioning attempt.
    const { data: inserted, error: insertError } = await supabase
      .from('event_meetings')
      .insert({
        event_id: eventId,
        session_key: session.key,
        title,
        starts_at: startsAt,
        ends_at: endsAt,
        meet_link: null,
        calendar_event_id: null,
        host_therapist_id: hostTherapistId,
        updated_at: now,
      })
      .select('*')
      .maybeSingle();

    if (insertError && insertError.code === UNDEFINED_TABLE) {
      // Migration not applied — nothing we can do, and callers must still work.
      console.error('[EventMeetings] event_meetings table is missing; run migration 030.');
      return result;
    }

    let owns = !insertError && !!inserted;
    let row = (inserted as EventMeeting | null) ?? null;

    if (insertError && insertError.code !== UNIQUE_VIOLATION) {
      console.error(`[EventMeetings] Failed to claim ${session.key}:`, insertError);
      result.failed.push({ sessionKey: session.key, error: insertError.message });
      continue;
    }

    // --- Step 2: the row already existed — read it, maybe claim a retry --
    if (!owns) {
      const { data: existing } = await supabase
        .from('event_meetings')
        .select('*')
        .eq('event_id', eventId)
        .eq('session_key', session.key)
        .maybeSingle();

      row = (existing as EventMeeting | null) ?? null;

      if (row?.meet_link) {
        result.meetings.push(row);
        continue;
      }

      // Retry a previously failed session, but only if nobody touched it recently.
      const staleBefore = new Date(Date.now() - RETRY_AFTER_MS).toISOString();
      const { data: claimed } = await supabase
        .from('event_meetings')
        .update({ updated_at: now, host_therapist_id: hostTherapistId })
        .eq('event_id', eventId)
        .eq('session_key', session.key)
        .is('meet_link', null)
        .lt('updated_at', staleBefore)
        .select('*')
        .maybeSingle();

      if (!claimed) {
        // Someone else is provisioning right now; report what we have.
        if (row) result.meetings.push(row);
        continue;
      }
      owns = true;
      row = claimed as EventMeeting;
    }

    // --- Step 3: we own it — create the Meet link -----------------------
    if (!hostTherapistId) {
      result.failed.push({
        sessionKey: session.key,
        error: 'Host therapist has not connected a Google account',
      });
      if (row) result.meetings.push(row);
      continue;
    }

    try {
      const meet = await createMeetEvent({
        summary: title,
        description: `${event.locales.en.subtitle ?? ''}\n\n${event.locales.en.title}`.trim(),
        startDateTime: startsAt,
        endDateTime: endsAt,
        therapistId: hostTherapistId,
      });

      const { data: saved } = await supabase
        .from('event_meetings')
        .update({
          meet_link: meet.meetLink || null,
          calendar_event_id: meet.calendarEventId,
          updated_at: new Date().toISOString(),
        })
        .eq('event_id', eventId)
        .eq('session_key', session.key)
        .select('*')
        .maybeSingle();

      if (saved) row = saved as EventMeeting;
      if (meet.meetLink) result.created.push(session.key);
    } catch (error) {
      // Non-fatal: the row stays with a null link so a later run can retry.
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[EventMeetings] Meet creation failed for ${session.key}:`, message);
      result.failed.push({ sessionKey: session.key, error: message });
    }

    if (row) result.meetings.push(row);
  }

  result.meetings.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return result;
}

/** Human-readable session time for emails, in Dubai time. */
export function formatSessionTime(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dubai',
  };
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Dubai',
  };

  return `${start.toLocaleDateString('en-US', dateOpts)} · ${start.toLocaleTimeString(
    'en-US',
    timeOpts
  )} – ${end.toLocaleTimeString('en-US', timeOpts)} (Dubai time)`;
}
