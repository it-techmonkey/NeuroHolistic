/**
 * Ziina Payment Integration
 * API Docs: https://ziina.com/docs/custom-integration
 *
 * Auth: Bearer token only (ZIINA_ACCESS_TOKEN in .env.local)
 * Endpoint: POST https://api.ziina.com/api/v1/payment_intent
 */

const ZIINA_API_BASE = 'https://api-cp.z.gg/api/v1';
const ZIINA_ACCESS_TOKEN = process.env.ZIINA_ACCESS_TOKEN;
// Legacy alias — accepted too so existing .env.local using ZIINA_API_KEY still works
const TOKEN = ZIINA_ACCESS_TOKEN || process.env.ZIINA_API_KEY;

interface ZiinaPaymentRequest {
  amount: number;        // in smallest currency unit (fils for AED, so 100 = 1 AED)
  currency: string;      // 'AED'
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  reference?: string;
  customerEmail?: string;
  customerName?: string;
  test?: boolean;        // set true for test payments
  metadata?: {
    email?: string;
    user_id?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

interface ZiinaPaymentResponse {
  success: boolean;
  paymentLink?: string;
  sessionId?: string;
  error?: string;
}

export async function createZiinaPayment(
  params: ZiinaPaymentRequest
): Promise<ZiinaPaymentResponse> {
  try {
    console.log('[Ziina] Creating payment intent…');

    if (!TOKEN) {
      console.error('[Ziina] Missing ZIINA_ACCESS_TOKEN in environment');
      return {
        success: false,
        error: 'Ziina access token not configured. Add ZIINA_ACCESS_TOKEN to .env.local',
      };
    }

    const isTest = process.env.NODE_ENV !== 'production';

    const payload = {
      amount: params.amount,
      currency_code: params.currency,
      description: params.description,
      redirect_url: params.redirectUrl,
      webhook_url: params.webhookUrl,
      reference_id: params.reference || `booking-${Date.now()}`,
      test: params.test ?? isTest,
      ...(params.customerEmail && { customer_email: params.customerEmail }),
      ...(params.customerName && { customer_name: params.customerName }),
      ...(params.metadata && { message: JSON.stringify(params.metadata) }),
    };

    console.log('[Ziina] Payload:', {
      amount: payload.amount,
      currency_code: payload.currency_code,
      reference_id: payload.reference_id,
      test: payload.test,
    });

    const response = await fetch(`${ZIINA_API_BASE}/payment_intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('[Ziina] Response status:', response.status);

    let data: Record<string, unknown>;
    try {
      data = await response.json();
    } catch {
      const text = await response.text().catch(() => '');
      console.error('[Ziina] Non-JSON response:', text);
      return { success: false, error: 'Invalid response from Ziina' };
    }

    console.log('[Ziina] Response:', data);

    if (!response.ok) {
      const errMsg = (data.message as string) || (data.error as string) || 'Payment creation failed';
      console.error('[Ziina] Error:', errMsg, data);
      return { success: false, error: errMsg };
    }

    // Ziina returns the checkout URL in different fields depending on version
    const paymentLink =
      (data.url as string) ||
      (data.checkout_url as string) ||
      (data.payment_url as string) ||
      (data.checkoutUrl as string) ||
      (data.paymentLink as string);

    const sessionId =
      (data.id as string) ||
      (data.session_id as string) ||
      (data.sessionId as string);

    if (!paymentLink) {
      console.error('[Ziina] No payment URL in response:', data);
      return { success: false, error: 'No payment URL returned by Ziina' };
    }

    console.log('[Ziina] Payment intent created:', { paymentLink, sessionId });
    return { success: true, paymentLink, sessionId };

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Ziina] Exception:', msg);
    return { success: false, error: msg };
  }
}
