import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { resolveTherapistUserRow } from '@/lib/bookings/resolve-therapist-user';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const therapistId = searchParams.get('therapistId');

    if (!therapistId) {
      return NextResponse.json({ error: 'therapistId is required.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const resolved = await resolveTherapistUserRow(supabase, therapistId);

    if (!resolved) {
      return NextResponse.json({ blockedDates: [] });
    }

    const { data: blocks } = await supabase
      .from('therapist_availability')
      .select('exception_date, start_time, end_time')
      .eq('therapist_id', resolved.id)
      .eq('is_blocked', true)
      .not('exception_date', 'is', null);

    const blockedDates: string[] = [];
    for (const block of blocks ?? []) {
      if (!block.exception_date) continue;
      const bs = block.start_time ?? '00:00';
      const be = block.end_time ?? '23:59';
      const startMinutes = parseInt(bs.split(':')[0]) * 60 + parseInt(bs.split(':')[1] || '0');
      const endMinutes = parseInt(be.split(':')[0]) * 60 + parseInt(be.split(':')[1] || '0');
      if (endMinutes - startMinutes >= 720) {
        blockedDates.push(block.exception_date);
      }
    }

    return NextResponse.json({ blockedDates });
  } catch (error) {
    console.error('[Blocked Dates]', error);
    return NextResponse.json({ blockedDates: [] });
  }
}
