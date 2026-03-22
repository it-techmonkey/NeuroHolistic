import { Resend } from 'resend';

export interface BookingNotificationPayload {
  name: string;
  email: string;
  phone?: string | null;
  therapistName: string;
  date: string;
  time: string;
  meetingLink?: string | null;
  context: 'consultation' | 'program_session' | 'reschedule';
}

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

async function sendEmailNotification(payload: BookingNotificationPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const firstName = payload.name.trim().split(' ')[0] || 'there';
  const dateLabel = formatDate(payload.date);
  const timeLabel = formatTime(payload.time);

  const subjectMap: Record<BookingNotificationPayload['context'], string> = {
    consultation: 'Your consultation booking is confirmed',
    program_session: 'Your session booking is confirmed',
    reschedule: 'Your session has been rescheduled',
  };

  await resend.emails.send({
    from: process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <onboarding@resend.dev>',
    to: payload.email,
    subject: subjectMap[payload.context],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
        <h2 style="margin:0 0 16px;color:#2B2F55;">NeuroHolistic Booking Update</h2>
        <p style="margin:0 0 12px;">Hi ${firstName},</p>
        <p style="margin:0 0 18px;">Your ${payload.context === 'consultation' ? 'consultation' : 'session'} is confirmed.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
          <p style="margin:0 0 6px;"><strong>Therapist:</strong> ${payload.therapistName}</p>
          <p style="margin:0 0 6px;"><strong>Date:</strong> ${dateLabel}</p>
          <p style="margin:0 0 6px;"><strong>Time:</strong> ${timeLabel} (UAE)</p>
          ${payload.meetingLink ? `<p style="margin:0;"><strong>Meeting Link:</strong> <a href="${payload.meetingLink}">${payload.meetingLink}</a></p>` : ''}
        </div>
      </div>
    `,
  });
}

async function sendWhatsAppNotification(payload: BookingNotificationPayload): Promise<void> {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl || !payload.phone) return;

  const message = [
    `NeuroHolistic booking confirmed for ${payload.name}.`,
    `Therapist: ${payload.therapistName}`,
    `Date: ${formatDate(payload.date)}`,
    `Time: ${formatTime(payload.time)} (UAE)`,
    payload.meetingLink ? `Meeting: ${payload.meetingLink}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: payload.phone,
      message,
      context: payload.context,
      email: payload.email,
    }),
  });
}

export async function sendBookingNotifications(payload: BookingNotificationPayload): Promise<void> {
  await Promise.allSettled([
    sendEmailNotification(payload),
    sendWhatsAppNotification(payload),
  ]);
}