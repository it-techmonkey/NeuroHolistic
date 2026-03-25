import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { rescheduleBooking } from '@/lib/services/booking.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { date, time } = body;

    if (!date || !time) {
      return NextResponse.json({ error: 'date and time are required' }, { status: 400 });
    }

    const result = await rescheduleBooking(id, user.id, date, time);

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[POST /api/bookings/${(error as Error)?.message ?? 'unknown'}/reschedule]`, error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = error instanceof Error && 'status' in error ? (error as Error & { status: number }).status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
