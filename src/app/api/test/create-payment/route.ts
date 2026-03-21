import { NextRequest, NextResponse } from 'next/server';
import { createZiinaPayment } from '@/lib/payments/ziina';

/**
 * TEST ENDPOINT - Creates a payment session without requiring authentication
 * This is for testing/development purposes only
 * 
 * Request body:
 * {
 *   "amount": 800,
 *   "email": "test@example.com",
 *   "type": "program"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Ziina Test] Payment creation test started');

    // Allow bypass of auth for testing
    const isTestMode = process.env.NODE_ENV === 'development';
    
    if (!isTestMode) {
      console.warn('[Ziina Test] Test endpoint accessed in production');
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('[Ziina Test] Request body:', body);

    const { amount, email = 'test@example.com', type = 'program' } = body;

    if (!amount) {
      console.error('[Ziina Test] Missing amount');
      return NextResponse.json(
        { error: 'Missing required field: amount' },
        { status: 400 }
      );
    }

    if (amount < 1) {
      console.error('[Ziina Test] Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Amount must be at least 1' },
        { status: 400 }
      );
    }

    console.log('[Ziina Test] Test parameters:', {
      amount,
      email,
      type,
    });

    // Create payment with test data
    const result = await createZiinaPayment({
      amount,
      currency: 'AED',
      description: `${type} Payment - Test`,
      reference: `test-${Date.now()}`,
      customerEmail: email,
      customerName: 'Test User',
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/ziina/webhook`,
      metadata: {
        email,
        type,
        test_mode: true,
      },
    });

    console.log('[Ziina Test] Payment creation result:', result);

    if (!result.success) {
      console.error('[Ziina Test] Payment creation failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    console.log('[Ziina Test] SUCCESS - Payment created:', {
      payment_url: result.paymentLink,
      payment_id: result.sessionId,
    });

    return NextResponse.json({
      success: true,
      payment_url: result.paymentLink,
      payment_id: result.sessionId,
      message: 'Test payment created successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Ziina Test] Exception error:', errorMessage);
    console.error('[Ziina Test] Full error:', error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage || 'An error occurred',
      },
      { status: 500 }
    );
  }
}
