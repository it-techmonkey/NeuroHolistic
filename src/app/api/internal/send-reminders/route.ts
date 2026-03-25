import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/services/supabase-admin';
import {
  sendNotification,
  checkAlreadySent,
  type NotificationBooking,
} from '@/lib/services/notification.service';

const DUBAI_OFFSET_MS = 4 * 60 * 60 * 1000;

function sessionToUtcMs(date: string, time: string): number {
  const [h, m] = time.split(':');
  const ms = Date.UTC(
    parseInt(date.slice(0, 4)),
    parseInt(date.slice(5, 7)) - 1,
    parseInt(date.slice(8, 10)),
    parseInt(h),
    parseInt(m),
  );
  return ms - DUBAI_OFFSET_MS;
}

function toDubaiDateStr(utcMs: number): string {
  return new Date(utcMs + DUBAI_OFFSET_MS).toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const nowUtc = Date.now();

  const windows: { type: 'reminder_24h' | 'reminder_1h'; startMs: number; endMs: number }[] = [
    { type: 'reminder_24h', startMs: nowUtc + 23 * 3_600_000, endMs: nowUtc + 25 * 3_600_000 },
    { type: 'reminder_1h', startMs: nowUtc + 55 * 60_000, endMs: nowUtc + 65 * 60_000 },
  ];

  const candidateDates = new Set<string>();
  for (const w of windows) {
    candidateDates.add(toDubaiDateStr(w.startMs));
    candidateDates.add(toDubaiDateStr(w.endMs));
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .in('date', Array.from(candidateDates));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { bookingId: string; type: string; sent: boolean }[] = [];

  for (const booking of bookings ?? []) {
    const sessionUtcMs = sessionToUtcMs(booking.date, booking.time);

    for (const w of windows) {
      if (sessionUtcMs < w.startMs || sessionUtcMs > w.endMs) continue;

      const alreadySent = await checkAlreadySent(booking.id, w.type, 'email');
      if (alreadySent) {
        results.push({ bookingId: booking.id, type: w.type, sent: false });
        continue;
      }

      const payload: NotificationBooking = {
        id: booking.id,
        clientName: booking.name,
        clientEmail: booking.email,
        clientPhone: booking.phone || null,
        therapistName: booking.therapist_name,
        therapistEmail: null,
        sessionDate: booking.date,
        sessionTime: booking.time,
        meetingLink: booking.meeting_link ?? null,
        sessionNumber: booking.session_number ?? null,
        type: booking.type,
      };

      await sendNotification(w.type, payload);
      results.push({ bookingId: booking.id, type: w.type, sent: true });
    }
  }

  const sentCount = results.filter((r) => r.sent).length;
  return NextResponse.json({
    processed: results.length,
    sent: sentCount,
    skipped: results.length - sentCount,
    details: results,
  });
}
