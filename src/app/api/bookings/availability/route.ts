import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import {
  defaultHourlyBookingSlots,
  generateHourlySlotStarts,
  therapistBookingsOrFilter,
} from '@/lib/bookings/therapist-scope';
import { resolveTherapistUserRow } from '@/lib/bookings/resolve-therapist-user';

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** 1-hour session starting at slotStartMin overlaps [blockStart, blockEnd) in minutes-of-day. */
function hourSlotBlocked(slotStartMin: number, blockStart: number, blockEnd: number): boolean {
  const slotEnd = slotStartMin + 60;
  return slotStartMin < blockEnd && slotEnd > blockStart;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTherapistId = searchParams.get('therapistId');
    const date = searchParams.get('date');

    if (!rawTherapistId || !date) {
      return NextResponse.json({ error: 'therapistId and date are required.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const resolved = await resolveTherapistUserRow(supabase, rawTherapistId);

    console.log('[Availability] Request:', { rawTherapistId, date, resolvedId: resolved?.id });

    // ── Blocked exception rows (full-day + partial time-off) ─────────────────
    let partialBlockRanges: { start: number; end: number }[] = [];
    if (resolved) {
      const { data: blockRows } = await supabase
        .from('therapist_availability')
        .select('start_time, end_time')
        .eq('therapist_id', resolved.id)
        .eq('exception_date', date)
        .eq('is_blocked', true);

      for (const b of blockRows ?? []) {
        const bs = b.start_time ?? '00:00';
        const be = b.end_time ?? '23:59';
        const fullDay =
          bs === '00:00' && (be === '23:59' || be === '24:00' || be === '23:59:00');
        if (fullDay) {
          console.log('[Availability] Date is fully blocked');
          return NextResponse.json({
            slots: [],
            message: 'Therapist is not available on this date.',
          });
        }
        partialBlockRanges.push({
          start: parseTimeToMinutes(bs.slice(0, 5)),
          end: parseTimeToMinutes(be.slice(0, 5)),
        });
      }
    }

    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
    const allSlotsSet = new Set<string>();

    if (resolved) {
      const { data: availRows } = await supabase
        .from('therapist_availability')
        .select('start_time, end_time, day_of_week, exception_date')
        .eq('therapist_id', resolved.id)
        .eq('is_blocked', false)
        .or(`day_of_week.eq.${dayOfWeek},exception_date.eq.${date}`);

      const windows = (availRows ?? []).filter((row) => {
        if (row.exception_date === date) return true;
        if (row.day_of_week === dayOfWeek && !row.exception_date) return true;
        return false;
      });

      if (windows.length > 0) {
        for (const w of windows) {
          const starts = generateHourlySlotStarts(w.start_time ?? '09:00', w.end_time ?? '17:00');
          starts.forEach((t) => allSlotsSet.add(t));
        }
      } else {
        defaultHourlyBookingSlots().forEach((t) => allSlotsSet.add(t));
      }
    } else {
      defaultHourlyBookingSlots().forEach((t) => allSlotsSet.add(t));
    }

    let allSlots = Array.from(allSlotsSet).sort((a, b) => a.localeCompare(b));

    // Remove slots overlapping partial-day blocks
    if (partialBlockRanges.length > 0) {
      allSlots = allSlots.filter((slot) => {
        const sm = parseTimeToMinutes(slot);
        return !partialBlockRanges.some((r) => hourSlotBlocked(sm, r.start, r.end));
      });
    }

    // ── Existing bookings & sessions ────────────────────────────────────────
    const bookedTimes = new Set<string>();

    if (resolved) {
      const orBook = therapistBookingsOrFilter(
        resolved.id,
        resolved.full_name,
        rawTherapistId
      );

      const { data: bookingRows } = await supabase
        .from('bookings')
        .select('time')
        .eq('date', date)
        .neq('status', 'cancelled')
        .or(orBook);

      const { data: sessionRows } = await supabase
        .from('sessions')
        .select('time')
        .eq('date', date)
        .neq('status', 'cancelled')
        .eq('therapist_id', resolved.id);

      for (const b of bookingRows ?? []) {
        if (b.time) bookedTimes.add(b.time.slice(0, 5));
      }
      for (const s of sessionRows ?? []) {
        if (s.time) bookedTimes.add(s.time.slice(0, 5));
      }
    } else {
      const { data: bookingRows } = await supabase
        .from('bookings')
        .select('time')
        .eq('date', date)
        .neq('status', 'cancelled')
        .eq('therapist_id', rawTherapistId);

      for (const b of bookingRows ?? []) {
        if (b.time) bookedTimes.add(b.time.slice(0, 5));
      }
    }

    let availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const today = `${todayYear}-${todayMonth}-${todayDay}`;

    if (date === today) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      availableSlots = availableSlots.filter((slot) => {
        const slotMinutes = parseTimeToMinutes(slot);
        return slotMinutes >= currentMinutes + 60;
      });
    }

    console.log('[Availability] Available slots:', availableSlots);

    return NextResponse.json({
      slots: availableSlots.map((time) => ({
        time,
        display: formatTimeDisplay(time),
      })),
    });
  } catch (error) {
    console.error('[Bookings Availability] Error:', error);
    return NextResponse.json({
      slots: defaultHourlyBookingSlots().map((time) => ({
        time,
        display: formatTimeDisplay(time),
      })),
    });
  }
}

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}
