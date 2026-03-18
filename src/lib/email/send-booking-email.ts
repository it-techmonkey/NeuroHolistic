/**
 * Email sending utility
 * Sends booking confirmation emails without blocking the UI
 */

interface SendBookingEmailParams {
  name: string;
  email: string;
  therapistName: string;
  date: string;
  time: string;
  meetingLink?: string;
}

/**
 * Send booking confirmation email
 * Non-blocking: fires and forgets, doesn't impact UI
 */
export async function sendBookingConfirmationEmail(
  params: SendBookingEmailParams
): Promise<void> {
  try {
    // Fire-and-forget: don't await or block the flow
    fetch('/api/send-booking-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).catch((err) => {
      // Log but don't throw - UI should never be affected
      console.error('Failed to send booking email:', err);
    });
  } catch (error) {
    console.error('Error triggering email send:', error);
    // Silently fail - user booking is already confirmed
  }
}
