import { NextRequest, NextResponse } from 'next/server';
import { sendBookingEmail } from '@/lib/notifications/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    if (!payload || !type) {
        return NextResponse.json({ error: 'Missing type or payload' }, { status: 400 });
    }

    // Currently handling booking/session emails
    if (type === 'booking_email' || type === 'booking_confirmed') {
        const result = await sendBookingEmail(payload);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    }
    
    // Add other types as needed
    return NextResponse.json({ message: 'Notification type not supported' }, { status: 400 });

  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
