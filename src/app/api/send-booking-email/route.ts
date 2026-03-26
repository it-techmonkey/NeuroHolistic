import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailRequest {
  name: string;
  email: string;
  therapistName: string;
  date: string;
  time: string;
  meetingLink?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingEmailRequest = await request.json();
    const { name, email, therapistName, date, time, meetingLink } = body;

    if (!name || !email || !therapistName || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firstName = name.split(' ')[0];

    const bookingDate = new Date(date + 'T00:00:00');
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedTime = (() => {
      const [h, m] = time.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${m ?? '00'} ${ampm}`;
    })();

    const resolvedMeetingLink =
      meetingLink || process.env.NEXT_PUBLIC_MEETING_LINK || null;

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'it@techmonkey.space';

    // Send to the client
    const clientResponse = await resend.emails.send({
      from: process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <noreply@neuroholisticinstitute.com>',
      to: email,
      subject: 'Your Free Consultation is Confirmed',
      html: generateConsultationConfirmationEmail({
        firstName,
        formattedDate,
        formattedTime,
        meetingLink: resolvedMeetingLink,
      }),
    });

    if (clientResponse.error) {
      console.error('[Email] Resend error (client):', clientResponse.error);
    }

    // Send admin notification in parallel (fire-and-forget)
    resend.emails.send({
      from: process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <noreply@neuroholisticinstitute.com>',
      to: adminEmail,
      subject: `New Consultation Booking — ${name}`,
      html: generateAdminNotificationEmail({
        name,
        email,
        therapistName,
        formattedDate,
        formattedTime,
      }),
    }).catch((err) => console.error('[Email] Admin notification error:', err));

    return NextResponse.json({ success: true, message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('[Email] Sending error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateConsultationConfirmationEmail(data: {
  firstName: string;
  formattedDate: string;
  formattedTime: string;
  meetingLink: string | null;
}): string {
  const meetingSection = data.meetingLink
    ? `
      <div style="margin:28px 0;text-align:center;">
        <a href="${data.meetingLink}"
           style="display:inline-block;padding:14px 32px;background:#2B2F55;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Join Your Session
        </a>
      </div>
      <p style="color:#475569;font-size:14px;margin-bottom:16px;">
        Please join the session at the scheduled time using the link above.
      </p>`
    : `
      <p style="color:#475569;font-size:14px;margin:24px 0;">
        Your meeting link will be sent to you shortly before the session.
      </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Consultation Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:580px;margin:40px auto;padding:0 16px 40px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2B2F55 0%,#3d4270 100%);padding:36px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;margin-bottom:14px;">
        <span style="color:#fff;font-size:24px;">✓</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;letter-spacing:-0.02em;">
        Consultation Confirmed
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
      <p style="font-size:16px;font-weight:600;color:#2B2F55;margin:0 0 12px;">Dear ${data.firstName},</p>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Your free consultation has been successfully booked.
      </p>

      <!-- Details Box -->
      <div style="background:#f8fafc;border-left:4px solid #2B2F55;padding:20px 24px;border-radius:8px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;font-weight:600;width:40%;">Date</td>
            <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:500;">${data.formattedDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:14px;font-weight:600;">Time</td>
            <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:500;">${data.formattedTime}</td>
          </tr>
        </table>
      </div>

      ${meetingSection}

      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:24px 0 0;padding-top:20px;border-top:1px solid #f1f5f9;">
        If you need any assistance with booking or accessing the session, you may contact the Admin for support.
      </p>

      <p style="color:#1e293b;font-size:15px;margin:24px 0 0;">
        We look forward to speaking with you.<br><br>
        <strong>Best regards,</strong><br>
        NeuroHolistic Institute
      </p>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px;">
      © ${new Date().getFullYear()} NeuroHolistic Institute. All rights reserved.
    </p>
  </div>
</body>
</html>`;
}

function generateAdminNotificationEmail(data: {
  name: string;
  email: string;
  therapistName: string;
  formattedDate: string;
  formattedTime: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>New Booking</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;">
  <div style="max-width:500px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;">
    <h2 style="margin:0 0 20px;color:#2B2F55;">New Consultation Booking</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#64748b;width:40%;font-weight:600;">Client</td><td style="padding:8px 0;">${data.name}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Email</td><td style="padding:8px 0;"><a href="mailto:${data.email}" style="color:#2B2F55;">${data.email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Therapist</td><td style="padding:8px 0;">${data.therapistName}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Date</td><td style="padding:8px 0;">${data.formattedDate}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Time</td><td style="padding:8px 0;">${data.formattedTime}</td></tr>
    </table>
  </div>
</body>
</html>`;
}
