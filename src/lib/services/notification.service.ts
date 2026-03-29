import { Resend } from 'resend';
import { getServiceSupabase } from '@/lib/supabase/service';

const BRAND_COLOR = '#2B2F55';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@neuroholistic.com';

type TriggerType =
  | 'booking_confirmed'
  | 'payment_success'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'session_completed'
  | 'booking_rescheduled'
  | 'booking_cancelled';

type Channel = 'email' | 'whatsapp';

export type NotificationBooking = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  therapistName: string;
  therapistEmail?: string | null;
  sessionDate: string;
  sessionTime: string;
  meetingLink?: string | null;
  sessionNumber?: number | null;
  type?: string;
};

type SendPayload = {
  to: string;
  subject: string;
  html: string;
  bookingId?: string;
  triggerType: TriggerType;
};

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes ?? '00'} ${ampm}`;
}

function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
      <div style="background:${BRAND_COLOR};padding:24px 32px;">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">NeuroHolistic Institute</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 20px;color:${BRAND_COLOR};font-size:18px;">${title}</h2>
        ${body}
      </div>
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">NeuroHolistic Institute &bull; Dubai, UAE</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function sessionDetailsBlock(booking: NotificationBooking): string {
  const meetingRow = booking.meetingLink
    ? `<tr><td style="padding:6px 12px;color:#64748b;">Meeting</td><td style="padding:6px 12px;"><a href="${booking.meetingLink}" style="color:${BRAND_COLOR};text-decoration:none;">Join Meeting</a></td></tr>`
    : '';
  const sessionRow = booking.sessionNumber
    ? `<tr><td style="padding:6px 12px;color:#64748b;">Session</td><td style="padding:6px 12px;">#${booking.sessionNumber}</td></tr>`
    : '';

  return `<table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0;">
  <tr><td style="padding:6px 12px;color:#64748b;">Client</td><td style="padding:6px 12px;font-weight:500;">${booking.clientName}</td></tr>
  <tr><td style="padding:6px 12px;color:#64748b;">Therapist</td><td style="padding:6px 12px;font-weight:500;">${booking.therapistName}</td></tr>
  <tr><td style="padding:6px 12px;color:#64748b;">Date</td><td style="padding:6px 12px;">${formatDate(booking.sessionDate)}</td></tr>
  <tr><td style="padding:6px 12px;color:#64748b;">Time</td><td style="padding:6px 12px;">${formatTime(booking.sessionTime)} (UAE)</td></tr>
  ${sessionRow}${meetingRow}
</table>`;
}

function buildEmailContent(triggerType: TriggerType, booking: NotificationBooking, recipient: 'client' | 'therapist' | 'admin'): { subject: string; html: string } {
  const firstName = booking.clientName.trim().split(' ')[0] || 'there';
  const details = sessionDetailsBlock(booking);

  switch (triggerType) {
    case 'booking_confirmed': {
      if (recipient === 'client') {
        return {
          subject: 'Your session is confirmed',
          html: emailLayout('Booking Confirmed', `
            <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
            <p style="margin:0 0 16px;color:#334155;">Your session with ${booking.therapistName} has been confirmed. Here are the details:</p>
            ${details}
            <p style="margin:16px 0 0;color:#64748b;font-size:14px;">Need to reschedule? You can do so from your dashboard at least 24 hours before the session.</p>`),
        };
      }
      if (recipient === 'therapist') {
        return {
          subject: `New booking: ${booking.clientName}`,
          html: emailLayout('New Session Booked', `
            <p style="margin:0 0 12px;color:#334155;">Hi ${booking.therapistName},</p>
            <p style="margin:0 0 16px;color:#334155;">A new session has been booked with you.</p>
            ${details}`),
        };
      }
      return {
        subject: `[Admin] New booking: ${booking.clientName} × ${booking.therapistName}`,
        html: emailLayout('New Booking (Admin)', `
          <p style="margin:0 0 16px;color:#334155;">A new booking has been created.</p>
          ${details}`),
      };
    }

    case 'booking_rescheduled': {
      if (recipient === 'client') {
        return {
          subject: 'Your session has been rescheduled',
          html: emailLayout('Session Rescheduled', `
            <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
            <p style="margin:0 0 16px;color:#334155;">Your session has been rescheduled to a new date and time:</p>
            ${details}`),
        };
      }
      return {
        subject: `Session rescheduled: ${booking.clientName}`,
        html: emailLayout('Session Rescheduled', `
          <p style="margin:0 0 16px;color:#334155;">A session with ${booking.clientName} has been rescheduled.</p>
          ${details}`),
      };
    }

    case 'booking_cancelled': {
      if (recipient === 'client') {
        return {
          subject: 'Your session has been cancelled',
          html: emailLayout('Session Cancelled', `
            <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
            <p style="margin:0 0 16px;color:#334155;">Your session on ${formatDate(booking.sessionDate)} at ${formatTime(booking.sessionTime)} has been cancelled.</p>
            <p style="margin:0;color:#64748b;font-size:14px;">If this was a mistake, please book a new session from your dashboard.</p>`),
        };
      }
      if (recipient === 'therapist') {
        return {
          subject: `Cancelled: ${booking.clientName} on ${formatDate(booking.sessionDate)}`,
          html: emailLayout('Session Cancelled', `
            <p style="margin:0 0 16px;color:#334155;">A session with ${booking.clientName} has been cancelled.</p>
            ${details}`),
        };
      }
      return {
        subject: `[Admin] Cancellation: ${booking.clientName} × ${booking.therapistName}`,
        html: emailLayout('Booking Cancelled (Admin)', `
          <p style="margin:0 0 16px;color:#334155;">A booking has been cancelled.</p>
          ${details}`),
      };
    }

    case 'reminder_24h':
      return {
        subject: 'Reminder: Your session is tomorrow',
        html: emailLayout('Session Tomorrow', `
          <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
          <p style="margin:0 0 16px;color:#334155;">This is a reminder that your session is tomorrow.</p>
          ${details}`),
      };

    case 'reminder_1h':
      return {
        subject: 'Your session starts in 1 hour',
        html: emailLayout('Session Starting Soon', `
          <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
          <p style="margin:0 0 16px;color:#334155;">Your session starts in about 1 hour. Please be ready!</p>
          ${details}`),
      };

    case 'session_completed':
      return {
        subject: 'Session complete — notes are available',
        html: emailLayout('Session Complete', `
          <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
          <p style="margin:0 0 16px;color:#334155;">Your session with ${booking.therapistName} on ${formatDate(booking.sessionDate)} is now marked as complete. Your therapist's notes and resources are available on your dashboard.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://neuroholistic.com'}/dashboard" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:#fff;border-radius:8px;text-decoration:none;font-weight:500;">View Dashboard</a>
          </div>`),
      };

    case 'payment_success':
      return {
        subject: 'Payment received — thank you!',
        html: emailLayout('Payment Confirmed', `
          <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
          <p style="margin:0 0 16px;color:#334155;">We've received your payment. You can now book your sessions from the dashboard.</p>`),
      };
  }
}

export async function logNotification(
  bookingId: string | null,
  userId: string | null,
  channel: Channel,
  triggerType: TriggerType,
  recipientEmail: string | null,
  recipientPhone: string | null,
  status: 'sent' | 'failed',
  errorMessage?: string
): Promise<void> {
  try {
    const supabase = getServiceSupabase();
    await supabase.from('notifications_log').insert({
      booking_id: bookingId,
      user_id: userId,
      channel,
      trigger_type: triggerType,
      recipient_email: recipientEmail,
      recipient_phone: recipientPhone,
      status,
      error_message: errorMessage ?? null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    });
  } catch (err) {
    console.error('[NotificationService] Failed to log notification:', err);
  }
}

export async function checkAlreadySent(
  bookingId: string,
  triggerType: TriggerType,
  channel: Channel
): Promise<boolean> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('notifications_log')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('trigger_type', triggerType)
    .eq('channel', channel)
    .eq('status', 'sent')
    .limit(1)
    .maybeSingle();

  return !!data;
}

async function sendEmail(payload: SendPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[NotificationService] RESEND_API_KEY not set, skipping email');
    return;
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <noreply@neuroholisticinstitute.com>';

  try {
    await resend.emails.send({
      from: fromAddress,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    await logNotification(payload.bookingId ?? null, null, 'email', payload.triggerType, payload.to, null, 'sent');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[NotificationService] Email to ${payload.to} failed:`, msg);
    await logNotification(payload.bookingId ?? null, null, 'email', payload.triggerType, payload.to, null, 'failed', msg);
  }
}

async function sendWhatsApp(
  phone: string,
  message: string,
  bookingId: string | null,
  triggerType: TriggerType
): Promise<void> {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl || !phone) return;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, message, triggerType }),
    });

    const status = res.ok ? 'sent' : 'failed';
    await logNotification(bookingId, null, 'whatsapp', triggerType, null, phone, status, res.ok ? undefined : `HTTP ${res.status}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[NotificationService] WhatsApp failed:', msg);
    await logNotification(bookingId, null, 'whatsapp', triggerType, null, phone, 'failed', msg);
  }
}

function buildWhatsAppMessage(triggerType: TriggerType, booking: NotificationBooking): string {
  const dateStr = formatDate(booking.sessionDate);
  const timeStr = formatTime(booking.sessionTime);

  const lines: (string | null)[] = [];

  switch (triggerType) {
    case 'booking_confirmed':
      lines.push(
        `Hi ${booking.clientName.split(' ')[0]}, your session is confirmed!`,
        `Therapist: ${booking.therapistName}`,
        `Date: ${dateStr}`,
        `Time: ${timeStr} (UAE)`,
        booking.meetingLink ? `Meeting: ${booking.meetingLink}` : null,
      );
      break;
    case 'booking_rescheduled':
      lines.push(
        `Hi ${booking.clientName.split(' ')[0]}, your session has been rescheduled.`,
        `New Date: ${dateStr}`,
        `New Time: ${timeStr} (UAE)`,
        booking.meetingLink ? `Meeting: ${booking.meetingLink}` : null,
      );
      break;
    case 'booking_cancelled':
      lines.push(
        `Hi ${booking.clientName.split(' ')[0]}, your session on ${dateStr} at ${timeStr} has been cancelled.`,
      );
      break;
    case 'reminder_24h':
      lines.push(
        `Reminder: Your session is tomorrow at ${timeStr} (UAE) with ${booking.therapistName}.`,
        booking.meetingLink ? `Meeting: ${booking.meetingLink}` : null,
      );
      break;
    case 'reminder_1h':
      lines.push(
        `Your session with ${booking.therapistName} starts in 1 hour!`,
        booking.meetingLink ? `Join: ${booking.meetingLink}` : null,
      );
      break;
    default:
      lines.push(`NeuroHolistic session update for ${booking.clientName}.`);
  }

  return lines.filter(Boolean).join('\n');
}

async function sendToRecipient(
  triggerType: TriggerType,
  booking: NotificationBooking,
  recipient: 'client' | 'therapist' | 'admin',
  email: string
): Promise<void> {
  const alreadySent = await checkAlreadySent(booking.id, triggerType, 'email');
  if (alreadySent && recipient === 'client') return;

  const content = buildEmailContent(triggerType, booking, recipient);
  await sendEmail({
    to: email,
    subject: content.subject,
    html: content.html,
    bookingId: booking.id,
    triggerType,
  });
}

export async function notifyBookingConfirmed(booking: NotificationBooking): Promise<void> {
  const tasks: Promise<void>[] = [];

  tasks.push(sendToRecipient('booking_confirmed', booking, 'client', booking.clientEmail));

  if (booking.therapistEmail) {
    tasks.push(sendToRecipient('booking_confirmed', booking, 'therapist', booking.therapistEmail));
  }

  tasks.push(sendToRecipient('booking_confirmed', booking, 'admin', ADMIN_EMAIL));

  if (booking.clientPhone) {
    const msg = buildWhatsAppMessage('booking_confirmed', booking);
    tasks.push(sendWhatsApp(booking.clientPhone, msg, booking.id, 'booking_confirmed'));
  }

  await Promise.allSettled(tasks);
}

export async function notifyRescheduled(booking: NotificationBooking): Promise<void> {
  const tasks: Promise<void>[] = [];

  tasks.push(sendToRecipient('booking_rescheduled', booking, 'client', booking.clientEmail));

  if (booking.therapistEmail) {
    tasks.push(sendToRecipient('booking_rescheduled', booking, 'therapist', booking.therapistEmail));
  }

  if (booking.clientPhone) {
    const msg = buildWhatsAppMessage('booking_rescheduled', booking);
    tasks.push(sendWhatsApp(booking.clientPhone, msg, booking.id, 'booking_rescheduled'));
  }

  await Promise.allSettled(tasks);
}

export async function notifyCancelled(booking: NotificationBooking): Promise<void> {
  const tasks: Promise<void>[] = [];

  tasks.push(sendToRecipient('booking_cancelled', booking, 'client', booking.clientEmail));

  if (booking.therapistEmail) {
    tasks.push(sendToRecipient('booking_cancelled', booking, 'therapist', booking.therapistEmail));
  }

  tasks.push(sendToRecipient('booking_cancelled', booking, 'admin', ADMIN_EMAIL));

  if (booking.clientPhone) {
    const msg = buildWhatsAppMessage('booking_cancelled', booking);
    tasks.push(sendWhatsApp(booking.clientPhone, msg, booking.id, 'booking_cancelled'));
  }

  await Promise.allSettled(tasks);
}

export async function notifySessionCompleted(booking: NotificationBooking): Promise<void> {
  await sendToRecipient('session_completed', booking, 'client', booking.clientEmail);
}

export async function sendNotification(
  triggerType: TriggerType,
  booking: NotificationBooking
): Promise<void> {
  switch (triggerType) {
    case 'booking_confirmed':
      return notifyBookingConfirmed(booking);
    case 'booking_rescheduled':
      return notifyRescheduled(booking);
    case 'booking_cancelled':
      return notifyCancelled(booking);
    case 'session_completed':
      return notifySessionCompleted(booking);
    case 'reminder_24h':
    case 'reminder_1h':
      await sendToRecipient(triggerType, booking, 'client', booking.clientEmail);
      if (booking.clientPhone) {
        const msg = buildWhatsAppMessage(triggerType, booking);
        await sendWhatsApp(booking.clientPhone, msg, booking.id, triggerType);
      }
      return;
    case 'payment_success':
      await sendToRecipient(triggerType, booking, 'client', booking.clientEmail);
      return;
  }
}
