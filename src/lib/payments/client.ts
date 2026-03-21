/**
 * Initiate a Ziina checkout session.
 * user_id is resolved server-side from the auth session cookie — never passed from the client.
 */
export async function redirectToZiinaCheckout(paymentData: {
  amount: number;
  description: string;
  bookingId?: string;
  customerEmail?: string;
  customerName?: string;
  sessionCount?: number;
}) {
  const response = await fetch('/api/ziina/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create payment session');
  }

  const data = await response.json();

  if (!data.paymentLink) {
    throw new Error('No payment link received');
  }

  window.location.href = data.paymentLink;
}
