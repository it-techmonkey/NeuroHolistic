import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { BookingService } from '@/lib/services/booking.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, programType, amount, therapistSlug, therapistName } = body;

    if (!planType || !amount) {
      return NextResponse.json({ error: 'Missing planType or amount' }, { status: 400 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const normalizedProgramType = programType || (planType.includes('group') ? 'group' : 'private');
    const paymentId = `MANUAL-${Date.now()}`;

    // Get user details
    const { data: userData } = await authClient.from('users').select('full_name, email').eq('id', user.id).single();

    const service = new BookingService();
    const result = await service.purchaseProgram({
      userId: user.id,
      programType: normalizedProgramType,
      therapistId: therapistSlug || null,
      therapistName: therapistName || null,
      totalSessions: 10,
      amountAed: Math.round(amount / 100),
      paymentId,
      clientName: userData?.full_name || 'Client',
      clientEmail: userData?.email || user.email || '',
      paymentStatus: 'pending_verification',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      program: {
        id: result.programId,
        status: 'pending',
        paymentStatus: 'pending_verification',
        totalSessions: 10,
      },
      message: 'Payment submitted for verification.',
    });
  } catch (error) {
    console.error('[Purchase Program]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
