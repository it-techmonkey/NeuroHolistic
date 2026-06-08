import type { PaymentOption, ProgramType } from './pricing';
import type { DiscountPercent } from './discount';

/**
 * Initiate a Ziina checkout session.
 * Prices and user identity are resolved server-side.
 */
export async function redirectToZiinaCheckout(paymentData: {
  programType: ProgramType | 'academy';
  paymentOption: PaymentOption;
  therapistName?: string | null;
  therapistSlug?: string | null;
  discountPercent?: DiscountPercent;
}) {
  const response = await fetch('/api/ziina/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create Ziina payment session');
  }

  if (!data.paymentLink) {
    throw new Error('No payment link received from Ziina');
  }

  window.location.href = data.paymentLink;
}
