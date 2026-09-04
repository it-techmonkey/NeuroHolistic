import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { formatSessionTime, type EventMeeting } from '@/lib/events/event-meetings';
import { eventEmailLayout, joinButtonHtml, sendEventEmail } from '@/lib/events/event-emails';

/**
 * Reminder emails for live events.
 *
 * Runs daily (Vercel cron). For every upcoming event session it emails the
 * active registrants at the 7-day and 24-hour marks, carrying the Google Meet
 * link. Sends are recorded in `event_reminders_sent` so a re-run — or a second
 * cron invocation on the same day — never double-mails anyone.
 */

type ReminderType = 'reminder_7d' | 'reminder_24h';

interface Window {
  type: ReminderType;
  startMs: number;
  endMs: number;
  label: string;
}

const HOUR_MS = 3_600_000;

interface Registration {
  id: string;
  name: string;
  email: string;
  event_id: string;
  event_title: string;
  payment_status: string;
  status: string;
}

function reminderHtml(registration: Registration, meeting: EventMeeting, label: string): string {
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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const now = Date.now();

  // Daily cron, so each window is a day wide to avoid gaps between runs.
  const windows: Window[] = [
    { type: 'reminder_7d', startMs: now + 6.5 * 24 * HOUR_MS, endMs: now + 7.5 * 24 * HOUR_MS, label: 'in one week' },
    { type: 'reminder_24h', startMs: now + 12 * HOUR_MS, endMs: now + 36 * HOUR_MS, label: 'tomorrow' },
  ];

  const earliest = new Date(Math.min(...windows.map((w) => w.startMs))).toISOString();
  const latest = new Date(Math.max(...windows.map((w) => w.endMs))).toISOString();

  const { data: meetings, error: meetingsError } = await supabase
    .from('event_meetings')
    .select('*')
    .gte('starts_at', earliest)
    .lte('starts_at', latest);

  if (meetingsError) {
    return NextResponse.json({ error: meetingsError.message }, { status: 500 });
  }

  const upcoming = (meetings ?? []) as EventMeeting[];
  if (upcoming.length === 0) {
    return NextResponse.json({ success: true, checked: 0, sent: 0 });
  }

  const eventIds = Array.from(new Set(upcoming.map((m) => m.event_id)));

  // Only people who are still registered and not awaiting payment.
  const { data: registrations, error: regError } = await supabase
    .from('event_registrations')
    .select('id, name, email, event_id, event_title, payment_status, status')
    .in('event_id', eventIds)
    .eq('status', 'active')
    .in('payment_status', ['free', 'paid']);

  if (regError) {
    return NextResponse.json({ error: regError.message }, { status: 500 });
  }

  let sent = 0;
  const skipped: string[] = [];

  for (const meeting of upcoming) {
    const startMs = new Date(meeting.starts_at).getTime();
    const window = windows.find((w) => startMs >= w.startMs && startMs <= w.endMs);
    if (!window) continue;

    const audience = (registrations ?? []).filter(
      (r: Registration) => r.event_id === meeting.event_id
    );

    for (const registration of audience) {
      const { error: claimError } = await supabase.from('event_reminders_sent').insert({
        registration_id: registration.id,
        session_key: meeting.session_key,
        reminder_type: window.type,
      });

      // Unique-violation means this reminder already went out — skip quietly.
      if (claimError) {
        if (claimError.code !== '23505') {
          console.error('[EventReminders] Failed to claim reminder:', claimError);
        }
        skipped.push(`${registration.id}:${meeting.session_key}:${window.type}`);
        continue;
      }

      const ok = await sendEventEmail({
        to: registration.email,
        subject: `Reminder: ${meeting.title} starts ${window.label}`,
        html: reminderHtml(registration, meeting, window.label),
      });

      if (ok) {
        sent += 1;
      } else {
        // Release the claim so the next run can retry.
        await supabase
          .from('event_reminders_sent')
          .delete()
          .eq('registration_id', registration.id)
          .eq('session_key', meeting.session_key)
          .eq('reminder_type', window.type);
      }
    }
  }

  return NextResponse.json({
    success: true,
    checked: upcoming.length,
    sent,
    skipped: skipped.length,
  });
}
