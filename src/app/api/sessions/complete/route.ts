import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const service = new BookingService();
    const result = await service.completeSession(sessionId);

    return NextResponse.json(result, { status: result.statusCode ?? (result.success ? 200 : 500) });
  } catch (error) {
    console.error('[Session Complete]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
