import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { BookingService } from '@/lib/services/booking.service';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const service = new BookingService();
    const result = await service.cancelBooking(id, user.id);

    return NextResponse.json(result, { status: result.statusCode ?? (result.success ? 200 : 500) });
  } catch (error) {
    console.error('[POST /api/bookings/cancel]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
