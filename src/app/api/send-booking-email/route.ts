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

    // Validate required fields
    if (!name || !email || !therapistName || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format date for display
    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Send email using Resend
    const response = await resend.emails.send({
      from: 'NeuroHolistic <noreply@neuroholistic.app>',
      to: email,
      subject: 'Your Booking Confirmation with NeuroHolistic',
      html: generateEmailHTML({
        name,
        therapistName,
        formattedDate,
        time,
        meetingLink,
      }),
    });

    if (response.error) {
      console.error('Resend API error:', response.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML email template for booking confirmation
 */
function generateEmailHTML(data: {
  name: string;
  therapistName: string;
  formattedDate: string;
  time: string;
  meetingLink?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .header {
            background: linear-gradient(135deg, #2B2F55 0%, #3d4270 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            background: white;
            padding: 40px 30px;
            border-radius: 0 0 12px 12px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #2B2F55;
            margin-bottom: 20px;
          }
          .booking-details {
            background-color: #f1f5f9;
            border-left: 4px solid #2B2F55;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 16px;
          }
          .detail-row:last-child {
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #475569;
          }
          .detail-value {
            color: #2B2F55;
            font-weight: 500;
          }
          .meeting-link {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #2B2F55;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
          }
          .message {
            color: #64748b;
            font-size: 14px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Booking Confirmed</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${data.name},</p>
            <p>Thank you for booking a session with NeuroHolistic. Your appointment has been confirmed with all the details below.</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Therapist</span>
                <span class="detail-value">${data.therapistName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${data.formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${data.time}</span>
              </div>
            </div>

            ${
              data.meetingLink
                ? `
                <p style="text-align: center; margin-top: 30px;">
                  <a href="${data.meetingLink}" class="meeting-link">Join Your Session</a>
                </p>
                `
                : ''
            }

            <p class="message">
              If you need to reschedule or cancel your appointment, please contact us as soon as possible. We look forward to working with you on your journey to restoration and transformation.
            </p>

            <p style="margin-top: 20px;">
              <strong>NeuroHolistic</strong><br>
              Restoring the System. Transforming Your Life.
            </p>

            <div class="footer">
              <p>© ${new Date().getFullYear()} NeuroHolistic. All rights reserved.</p>
              <p>This is an automated confirmation email. Please do not reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
