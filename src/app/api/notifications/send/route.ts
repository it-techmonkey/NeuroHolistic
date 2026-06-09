import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, type NotificationBooking } from '@/lib/services/notification.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    if (!payload || !type) {
      return NextResponse.json({ error: 'Missing type or payload' }, { status: 400 });
    }

    const booking: NotificationBooking = {
      id: payload.bookingId || payload.id || '',
      clientName: payload.clientName || payload.name || '',
      clientEmail: payload.clientEmail || payload.email || '',
      clientPhone: payload.clientPhone || payload.phone,
      therapistName: payload.therapistName || 'Your Therapist',
      therapistEmail: payload.therapistEmail,
      sessionDate: payload.sessionDate || payload.date || '',
      sessionTime: payload.sessionTime || payload.time || '',
      meetingLink: payload.meetingLink || payload.meetLink,
      sessionNumber: payload.sessionNumber,
      type: payload.type,
    };

    const triggerType = type === 'booking_email' ? 'booking_confirmed' : type;

    await sendNotification(triggerType, booking);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
