import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { Database } from '@/lib/supabase/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

function generateMeetingLink(): string {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `https://meet.neuroholistic.com/session/${code}`;
}

function formatDisplayDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

async function sendConsultationEmail(params: {
  name: string;
  email: string;
  therapistName: string;
  date: string;
  time: string;
  meetingLink: string;
}) {
  const firstName = params.name.split(' ')[0];
  const displayDate = formatDisplayDate(params.date);
  const displayTime = formatDisplayTime(params.time);

  try {
    await resend.emails.send({
      from: 'NeuroHolistic Institute <onboarding@resend.dev>',
      to: params.email,
      subject: 'Your Free Consultation is Confirmed — NeuroHolistic Institute',
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Consultation Confirmed</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px 40px;">
    <div style="background:linear-gradient(135deg,#2B2F55 0%,#3d4270 100%);padding:36px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;margin-bottom:14px;">
        <span style="color:#fff;font-size:24px;">✓</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;">Booking Confirmed!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Your free consultation session is scheduled</p>
    </div>
    <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
      <p style="font-size:16px;color:#1e293b;margin:0 0 6px;"><strong>Dear ${firstName},</strong></p>
      <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 28px;">
        Your free consultation has been successfully booked. We look forward to meeting with you!
      </p>

      <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:28px;border:1px solid #e2e8f0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Practitioner</span><br>
              <span style="color:#1e293b;font-size:15px;font-weight:600;margin-top:4px;display:block;">${params.therapistName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Date</span><br>
              <span style="color:#1e293b;font-size:15px;font-weight:600;margin-top:4px;display:block;">${displayDate}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0 0;">
              <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Time</span><br>
              <span style="color:#1e293b;font-size:15px;font-weight:600;margin-top:4px;display:block;">${displayTime} (UAE Time)</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <p style="color:#64748b;font-size:13px;margin:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your Meeting Link</p>
        <a href="${params.meetingLink}"
           style="display:inline-block;padding:14px 32px;background:#2B2F55;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;word-break:break-all;">
          Join Meeting
        </a>
        <p style="color:#94a3b8;font-size:12px;margin:10px 0 0;">${params.meetingLink}</p>
      </div>

      <p style="color:#94a3b8;font-size:13px;margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;">
        If you have any questions, please contact our team.<br><br>
        <strong style="color:#1e293b;">Best regards,<br>NeuroHolistic Institute</strong>
      </p>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">
      © ${new Date().getFullYear()} NeuroHolistic Institute. All rights reserved.
    </p>
  </div>
</body>
</html>`,
    });
  } catch (err) {
    console.error('[ConsultationEmail] Failed to send:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, country, therapist_id, therapist_name, date, time } = body;

    if (!name || !email || !therapist_id || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate time slot
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('therapist_id', therapist_id)
      .eq('date', date)
      .eq('time', time)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another.' },
        { status: 409 }
      );
    }

    const meetingLink = generateMeetingLink();

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        country: country || '',
        therapist_id,
        therapist_name: therapist_name || therapist_id,
        date,
        time,
        type: 'free_consultation',
        status: 'confirmed',
        meeting_link: meetingLink,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[ConsultationBook] DB error:', insertError);
      return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 });
    }

    // Send confirmation email (non-blocking)
    sendConsultationEmail({
      name,
      email,
      therapistName: therapist_name,
      date,
      time,
      meetingLink,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      meetingLink,
    });
  } catch (err) {
    console.error('[ConsultationBook] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
