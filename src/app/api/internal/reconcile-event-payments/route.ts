import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { reconcileEventPayments } from '@/lib/events/payment-reconciliation';

/**
 * Catches event payments that Ziina completed but this system never finished
 * processing — see the comment on `reconcileEventPayments` for why that is a
 * real failure mode and not a theoretical one.
 *
 * This is deliberately callable on its own rather than only from a schedule.
 * Vercel's Hobby plan allows each cron to run once a day, and the two daily
 * slots in vercel.json are already spoken for, so this also runs at the end
 * of the daily event-reminder cron. Pointing any external scheduler at this
 * URL (with the same Bearer CRON_SECRET) shortens the worst-case wait from a
 * day to whatever interval that scheduler uses.
 */

/** Each pending payment costs a Ziina round-trip plus, on success, an email. */
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await reconcileEventPayments(getServiceSupabase());

  return NextResponse.json({ success: true, ...result });
}
