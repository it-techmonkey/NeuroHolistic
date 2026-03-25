/**
 * Notification service — sends email via Resend and logs to notifications_log.
 * WhatsApp/SMS is stubbed (requires customer's API setup).
 */

import { Resend } from 'resend';
import { getServiceSupabase } from '@/lib/supabase/service';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificationPayload {
  bookingId?: string;
  userId?: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  meetLink: string;
  triggerType: 'booking_confirmed' | 'booking_rescheduled' | 'session_completed' | 'program_confirmed';
}

/**
 * Send booking/session confirmation email via Resend.
 */
export async function sendBookingEmail(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceSupabase();

  try {
    const { error: emailError } = await resend.emails.send({
      from: 'NeuroHolistic <notifications@neuroholistic.com>',
      to: payload.recipientEmail,
      subject: 'Your session is confirmed — NeuroHolistic',
      html: `
        <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #2B2F55; margin-bottom: 24px;">Session Confirmed ✓</h2>
          <p>Hello ${payload.recipientName},</p>
          <p>Your session has been confirmed with the following details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr><td style="padding: 8px 0; color: #666;">Therapist</td><td style="padding: 8px 0; font-weight: 600;">${payload.therapistName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="padding: 8px 0; font-weight: 600;">${payload.sessionDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Time</td><td style="padding: 8px 0; font-weight: 600;">${payload.sessionTime}</td></tr>
          </table>
          <a href="${payload.meetLink}" style="display: inline-block; background: #2B2F55; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Join Google Meet</a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">Need help? Contact us at support@neuroholistic.com</p>
        </div>
      `,
    });

    if (emailError) throw emailError;

    // Log success
    await supabase.from('notifications_log').insert({
      booking_id: payload.bookingId ?? null,
      user_id: payload.userId ?? null,
      channel: 'email',
      trigger_type: payload.triggerType,
      recipient_email: payload.recipientEmail,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (err) {
    console.error('[Notification] Email send failed:', err);

    // Log failure
    await supabase.from('notifications_log').insert({
      booking_id: payload.bookingId ?? null,
      user_id: payload.userId ?? null,
      channel: 'email',
      trigger_type: payload.triggerType,
      recipient_email: payload.recipientEmail,
      status: 'failed',
      error_message: err instanceof Error ? err.message : String(err),
    });

    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send WhatsApp/SMS notification (stub — requires customer's API).
 */
export async function sendWhatsAppNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceSupabase();

  if (!payload.recipientPhone || !process.env.WHATSAPP_API_KEY || !process.env.WHATSAPP_API_URL) {
    // Log skipped
    await supabase.from('notifications_log').insert({
      booking_id: payload.bookingId ?? null,
      user_id: payload.userId ?? null,
      channel: 'whatsapp',
      trigger_type: payload.triggerType,
      recipient_phone: payload.recipientPhone ?? null,
      status: 'failed',
      error_message: 'WhatsApp API not configured or no phone number',
    });
    return { success: false, error: 'WhatsApp API not configured' };
  }

  try {
    const message = `NeuroHolistic: Your session with ${payload.therapistName} is confirmed for ${payload.sessionDate} at ${payload.sessionTime}. Join here: ${payload.meetLink}`;

    const response = await fetch(process.env.WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
      },
      body: JSON.stringify({
        phone: payload.recipientPhone,
        message,
      }),
    });

    if (!response.ok) throw new Error(`WhatsApp API returned ${response.status}`);

    await supabase.from('notifications_log').insert({
      booking_id: payload.bookingId ?? null,
      user_id: payload.userId ?? null,
      channel: 'whatsapp',
      trigger_type: payload.triggerType,
      recipient_phone: payload.recipientPhone,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (err) {
    console.error('[Notification] WhatsApp send failed:', err);

    await supabase.from('notifications_log').insert({
      booking_id: payload.bookingId ?? null,
      user_id: payload.userId ?? null,
      channel: 'whatsapp',
      trigger_type: payload.triggerType,
      recipient_phone: payload.recipientPhone,
      status: 'failed',
      error_message: err instanceof Error ? err.message : String(err),
    });

    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send all notifications (email + WhatsApp) for a booking event.
 */
export async function sendAllNotifications(payload: NotificationPayload) {
  const results = await Promise.allSettled([
    sendBookingEmail(payload),
    sendWhatsAppNotification(payload),
  ]);

  return {
    email: results[0].status === 'fulfilled' ? results[0].value : { success: false, error: 'Promise rejected' },
    whatsapp: results[1].status === 'fulfilled' ? results[1].value : { success: false, error: 'Promise rejected' },
  };
}
