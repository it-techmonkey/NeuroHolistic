import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/lib/services/booking.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const therapistId = searchParams.get('therapistId');
    const date = searchParams.get('date');

    if (!therapistId || !date) {
      return NextResponse.json({ error: 'therapistId and date are required.' }, { status: 400 });
    }

    const service = new BookingService();
    const slots = await service.getAvailableSlots(therapistId, date);

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('[Bookings Availability] Error:', error);
    return NextResponse.json({ slots: [] });
  }
}
