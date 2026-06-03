/**
 * Ziina Payment Intent integration.
 *
 * Current API docs:
 * https://docs.ziina.com/api-reference/payment-intent/create
 */

const ZIINA_API_BASE = 'https://api-v2.ziina.com/api';
const TOKEN = process.env.ZIINA_ACCESS_TOKEN || process.env.ZIINA_API_KEY;

export interface ZiinaPaymentIntent {
  id: string;
  amount: number;
  currency_code: string;
  status: 'requires_payment_instrument' | 'requires_user_action' | 'pending' | 'completed' | 'failed' | 'canceled' | string;
  message?: string;
  redirect_url?: string;
  embedded_url?: string;
  success_url?: string;
  cancel_url?: string;
  latest_error?: {
    message?: string;
    code?: string;
  };
}

interface CreateZiinaPaymentIntentRequest {
  amount: number; // smallest currency unit (fils for AED)
  currency: string;
  message?: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  test?: boolean;
  expiry?: string;
}

interface CreateZiinaPaymentIntentResponse {
  success: boolean;
  paymentIntentId?: string;
  paymentLink?: string;
  intent?: ZiinaPaymentIntent;
  error?: string;
}

function getZiinaToken() {
  if (!TOKEN) {
    throw new Error('Ziina access token not configured. Add ZIINA_ACCESS_TOKEN to .env.local');
  }

  return TOKEN;
}

async function parseZiinaResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Ziina returned a non-JSON response: ${text.slice(0, 200)}`);
  }
}

export async function createZiinaPaymentIntent(
  params: CreateZiinaPaymentIntentRequest
): Promise<CreateZiinaPaymentIntentResponse> {
  try {
    const testMode =
      params.test ??
      (process.env.ZIINA_TEST_MODE
        ? process.env.ZIINA_TEST_MODE === 'true'
        : process.env.NODE_ENV !== 'production');

    const payload = {
      amount: params.amount,
      currency_code: params.currency,
      message: params.message,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      failure_url: params.failureUrl,
      test: testMode,
      allow_tips: false,
      ...(params.expiry && { expiry: params.expiry }),
    };

    const response = await fetch(`${ZIINA_API_BASE}/payment_intent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getZiinaToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await parseZiinaResponse(response)) as Partial<ZiinaPaymentIntent> & {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      return {
        success: false,
        error: data.latest_error?.message || data.error || data.message || 'Failed to create Ziina payment intent',
      };
    }

    if (!data.id || !data.redirect_url) {
      return {
        success: false,
        error: 'Ziina did not return a payment intent id or redirect URL',
      };
    }

    return {
      success: true,
      paymentIntentId: data.id,
      paymentLink: data.redirect_url,
      intent: data as ZiinaPaymentIntent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected Ziina payment error',
    };
  }
}

export async function getZiinaPaymentIntent(paymentIntentId: string): Promise<ZiinaPaymentIntent> {
  const response = await fetch(`${ZIINA_API_BASE}/payment_intent/${paymentIntentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getZiinaToken()}`,
    },
    cache: 'no-store',
  });

  const data = (await parseZiinaResponse(response)) as ZiinaPaymentIntent & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.latest_error?.message || data.error || data.message || 'Failed to fetch Ziina payment intent');
  }

  return data;
}
