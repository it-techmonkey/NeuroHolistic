import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { cancelBooking } from '@/lib/services/booking.service';

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
    const result = await cancelBooking(id, user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[POST /api/bookings/${(error as Error)?.message ?? 'unknown'}/cancel]`, error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = error instanceof Error && 'status' in error ? (error as Error & { status: number }).status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
