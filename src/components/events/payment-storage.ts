/**
 * Shared between the payment button (which stores the reference before
 * redirecting to Ziina) and the return banner (which reads it back to confirm
 * the payment). Kept in its own module so neither component has to import the
 * other.
 */
export const PENDING_PAYMENT_KEY = "nh:pending-event-payment";
