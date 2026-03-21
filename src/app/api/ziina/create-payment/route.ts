import { NextRequest, NextResponse } from 'next/server';
import { createZiinaPayment } from '@/lib/payments/ziina';
import { createClient } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Ziina Create Payment] Request started');

    // Require authentication — user_id is derived from the session, never from the request body
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Ziina Create Payment] Authentication failed', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Ziina Create Payment] Authenticated user:', user.id);

    const body = await request.json();
    console.log('[Ziina Create Payment] Request body:', body);

    const {
      amount,
      currency = 'AED',
      description,
      bookingId,
      customerEmail,
      customerName,
      sessionCount,
      type,
    } = body;

    if (!amount || !description) {
      console.error('[Ziina Create Payment] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: amount, description' },
        { status: 400 }
      );
    }

    if (amount < 1) {
      console.error('[Ziina Create Payment] Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Amount must be at least 1' },
        { status: 400 }
      );
    }

    console.log('[Ziina Create Payment] Creating payment with metadata:', {
      amount,
      currency,
      type,
      email: customerEmail,
    });

    // user_id always comes from the verified session, not from the client
    const result = await createZiinaPayment({
      amount,
      currency,
      description,
      reference: bookingId || `booking-${Date.now()}`,
      customerEmail,
      customerName,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/ziina/webhook`,
      metadata: {
        email: customerEmail,
        type: type || 'program',
        user_id: user.id,
        session_count: sessionCount ?? 10,
      },
    });

    console.log('[Ziina Create Payment] Response from Ziina:', result);

    if (!result.success) {
      console.error('[Ziina Create Payment] Payment creation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create payment session' },
        { status: 500 }
      );
    }

    console.log('[Ziina Create Payment] Payment created successfully:', {
      paymentLink: result.paymentLink,
      sessionId: result.sessionId,
    });

    return NextResponse.json({
      success: true,
      paymentLink: result.paymentLink,
      sessionId: result.sessionId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Ziina Create Payment] Error:', errorMessage);
    console.error('[Ziina Create Payment] Full error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the payment' },
      { status: 500 }
    );
  }
}
