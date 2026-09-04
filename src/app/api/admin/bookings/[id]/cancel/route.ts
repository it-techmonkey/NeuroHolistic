import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { BookingService } from '@/lib/services/booking.service';

/**
 * Admin-side booking cancellation.
 *
 * Unlike the client route, this does not require the caller to own the booking
 * and is not bound by the 24-hour cut-off — an admin cancelling on someone's
 * behalf is usually doing so precisely because the session is imminent.
 */
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

    const { data: userData } = await supabase
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : null;

    const service = new BookingService();
    const result = await service.cancelBooking(id, user.id, { asAdmin: true, reason });

    return NextResponse.json(result, { status: result.statusCode ?? (result.success ? 200 : 500) });
  } catch (error) {
    console.error('[POST /api/admin/bookings/cancel]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
