import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getServiceSupabase } from '@/lib/supabase/service';
import { normalizePhone } from '@/lib/phone';
import { ensureEventMeetings } from '@/lib/events/event-meetings';
import { sessionScheduleHtml } from '@/lib/events/event-emails';

const BRAND_COLOR = '#2B2F55';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@neuroholistic.com';
const FROM_ADDRESS = process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <noreply@neuroholisticinstitute.com>';

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

async function sendRegistrationEmails(params: {
  eventTitle: string;
  name: string;
  email: string;
  phone: string | null;
  scheduleHtml: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[EventRegister] RESEND_API_KEY not set, skipping emails');
    return;
  }

  const resend = new Resend(apiKey);
  const firstName = params.name.trim().split(' ')[0] || 'there';

  const detailsTable = `<table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0;">
  <tr><td style="padding:6px 12px;color:#64748b;">Name</td><td style="padding:6px 12px;font-weight:500;">${params.name}</td></tr>
  <tr><td style="padding:6px 12px;color:#64748b;">Email</td><td style="padding:6px 12px;">${params.email}</td></tr>
  ${params.phone ? `<tr><td style="padding:6px 12px;color:#64748b;">Phone</td><td style="padding:6px 12px;">${params.phone}</td></tr>` : ''}
</table>`;

  const clientEmail = resend.emails.send({
    from: FROM_ADDRESS,
    to: params.email,
    subject: `You're registered: ${params.eventTitle}`,
    html: emailLayout('Registration Confirmed', `
      <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;color:#334155;">You're registered for <strong>${params.eventTitle}</strong>.</p>
      ${params.scheduleHtml || `<p style="margin:0 0 16px;color:#334155;">We&rsquo;ll send the joining details to this email closer to the event date.</p>`}
      <p style="margin:16px 0 0;color:#64748b;font-size:13px;">We'll also email you a reminder before each session.</p>`),
  });

  const adminEmail = resend.emails.send({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    subject: `[Admin] New event registration: ${params.eventTitle}`,
    html: emailLayout('New Event Registration', `
      <p style="margin:0 0 16px;color:#334155;">A new registrant signed up for <strong>${params.eventTitle}</strong>.</p>
      ${detailsTable}`),
  });

  const results = await Promise.allSettled([clientEmail, adminEmail]);
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('[EventRegister] Email send failed:', result.reason);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, eventTitle, name, email, phone } = body;

    if (!eventId || !eventTitle || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, eventTitle, name, email' },
        { status: 400 }
      );
    }

    // A mobile number with a country code is mandatory for every registration.
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'A valid mobile number including the country code is required.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      event_title: eventTitle,
      name,
      email,
      phone: normalizedPhone,
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You are already registered for this event.' },
          { status: 409 }
        );
      }
      console.error('[EventRegister]', error);
      return NextResponse.json({ error: 'Failed to register.' }, { status: 500 });
    }

    // Provision the Meet links (idempotent) so the confirmation email can
    // carry the joining details straight away. Provisioning must never block
    // the confirmation email — if it fails, we still confirm the registration
    // and the reminder emails will carry the links later.
    (async () => {
      let scheduleHtml = '';
      try {
        const { meetings } = await ensureEventMeetings(supabase, eventId);
        scheduleHtml = sessionScheduleHtml(meetings);
      } catch (err) {
        console.error('[EventRegister] Meet provisioning failed:', err);
      }

      await sendRegistrationEmails({
        eventTitle,
        name,
        email,
        phone: normalizedPhone,
        scheduleHtml,
      });
    })().catch((err) => console.error('[EventRegister] Notification error:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EventRegister]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
