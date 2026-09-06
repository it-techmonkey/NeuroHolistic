import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { sendCuratedScheduledEmails, sendGenericSessionReminders } from '@/lib/events/event-reminders';

/**
 * Daily cron entry point. The actual logic lives in
 * `@/lib/events/event-reminders` so it can be unit/integration tested with an
 * explicit `now` rather than always reading the real clock.
 */
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
