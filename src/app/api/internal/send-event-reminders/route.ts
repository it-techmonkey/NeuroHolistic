import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { sendCuratedScheduledEmails, sendGenericSessionReminders } from '@/lib/events/event-reminders';

/**
 * Daily cron entry point. The actual logic lives in
 * `@/lib/events/event-reminders` so it can be unit/integration tested with an
 * explicit `now` rather than always reading the real clock.
 *
 * SCHEDULE — see vercel.json: this route runs once a day at 13:00 UTC
 * (17:00 Dubai), which is the most Vercel's Hobby plan allows. Every
 * scheduled email in events-data.ts is deliberately set to fire at 16:45
 * Dubai, 15 minutes before this cron runs, so a single daily check catches
 * all of them — including the "one hour before" emails, which land roughly
 * an hour ahead of an 18:00 session. If you ever change this cron's
 * schedule, the sendAt times in events-data.ts must move with it, or the
 * hour-before emails will start missing their catch-up window and get
 * silently skipped (see CATCH_UP_WINDOW_MS in event-reminders.ts).
 */

/**
 * Each email takes ~400ms to hand off to Resend. The platform default of 10s
 * would cut the run short at roughly 25 registrants, silently leaving everyone
 * after that without their email — and for the time-sensitive reminders, the
 * next day's run is past the window, so they would never receive it at all.
 */
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const now = Date.now();

  const [curated, generic] = await Promise.all([
    sendCuratedScheduledEmails(supabase, now),
    sendGenericSessionReminders(supabase, now),
  ]);

  return NextResponse.json({
    success: true,
    curated,
    generic,
    sent: curated.sent + generic.sent,
    alreadySent: curated.alreadySent + generic.alreadySent,
    errors: curated.errors + generic.errors,
  });
}
