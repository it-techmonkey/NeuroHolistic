import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { BookingService } from '@/lib/services/booking.service';

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await authClient.from('users').select('role, full_name').eq('id', user.id).single();
    if (userData?.role !== 'therapist' && userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const service = new BookingService();
    const sessions = await service.getTherapistSessions(user.id, userData.full_name);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[Therapist Sessions]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
