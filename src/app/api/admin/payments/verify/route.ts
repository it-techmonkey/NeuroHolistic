import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPaymentVerifiedEmail({
  email,
  clientName,
  programType,
}: {
  email: string;
  clientName: string;
  programType: string;
}) {
  await resend.emails.send({
    from: process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <noreply@neuroholisticinstitute.com>',
    to: email,
    subject: 'Payment Verified — NeuroHolistic Institute',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Payment Verified</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px 40px;">
    <div style="background:linear-gradient(135deg,#059669 0%,#10b981 100%);padding:36px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;margin-bottom:14px;">
        <span style="color:#fff;font-size:24px;">✓</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;">Payment Verified</h1>
    </div>
    <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
      <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">
        Hi ${clientName}, your payment for the <strong>${programType.charAt(0).toUpperCase() + programType.slice(1)} Program</strong> has been verified and your program is now active!
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #059669;padding:16px 20px;border-radius:8px;margin-bottom:28px;">
        <p style="margin:0;color:#166534;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">What's next</p>
        <ul style="margin:10px 0 0;padding-left:18px;color:#475569;font-size:14px;line-height:1.8;">
          <li>Log in to your NeuroHolistic dashboard</li>
          <li>Schedule your therapy sessions</li>
          <li>Choose your preferred date and time</li>
        </ul>
      </div>
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/schedule-session"
           style="display:inline-block;padding:14px 32px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Schedule Your Sessions
        </a>
      </div>
      <p style="color:#94a3b8;font-size:13px;margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;">
        If you need any assistance, please contact the Admin.<br><br>
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
}

async function sendPaymentRejectedEmail({
  email,
  clientName,
  programType,
  reason,
}: {
  email: string;
  clientName: string;
  programType: string;
  reason?: string;
}) {
  await resend.emails.send({
    from: process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <noreply@neuroholisticinstitute.com>',
    to: email,
    subject: 'Payment Update — NeuroHolistic Institute',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Payment Update</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px 40px;">
    <div style="background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%);padding:36px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;margin-bottom:14px;">
        <span style="color:#fff;font-size:24px;">!</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;">Payment Update</h1>
    </div>
    <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
      <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">
        Hi ${clientName}, we were unable to verify your payment for the <strong>${programType.charAt(0).toUpperCase() + programType.slice(1)} Program</strong>.
      </p>
      ${reason ? `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px 20px;border-radius:8px;margin-bottom:28px;">
        <p style="margin:0;color:#991b1b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Reason</p>
        <p style="margin:8px 0 0;color:#475569;font-size:14px;line-height:1.6;">${reason}</p>
      </div>` : ''}
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/paid-program-booking"
           style="display:inline-block;padding:14px 32px;background:#2B2F55;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Try Again
        </a>
      </div>
      <p style="color:#94a3b8;font-size:13px;margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;">
        If you believe this is an error, please contact the Admin.<br><br>
        <strong style="color:#1e293b;">Best regards,<br>NeuroHolistic Institute</strong>
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { programId, action, notes } = body;

    if (!programId || !action) {
      return NextResponse.json({ error: 'Missing programId or action' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "accept" or "reject"' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Get the program
    const { data: program, error: fetchError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (fetchError || !program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (program.payment_status !== 'pending_verification') {
      return NextResponse.json({
        error: `Program payment is already ${program.payment_status}`,
      }, { status: 400 });
    }

    if (action === 'accept') {
      // Activate the program
      const { error: updateError } = await supabase
        .from('programs')
        .update({
          status: 'active',
          payment_status: 'verified',
          payment_verified_at: new Date().toISOString(),
          admin_notes: notes || null,
        })
        .eq('id', programId);

      if (updateError) {
        console.error('[Payment Verify]', updateError);
        return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
      }

      // Assign therapist-client relationship
      if (program.therapist_user_id && program.user_id) {
        await supabase.from('therapist_clients').upsert({
          therapist_id: program.therapist_user_id,
          client_id: program.user_id,
          status: 'active',
        }, { onConflict: 'therapist_id,client_id' });
      }

      // Send verification email
      if (program.client_email) {
        sendPaymentVerifiedEmail({
          email: program.client_email,
          clientName: program.client_name || 'Client',
          programType: program.program_type || 'private',
        }).catch(err => console.error('[Payment Verify] Email failed:', err));
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified and program activated',
        program: { id: programId, status: 'active', paymentStatus: 'verified' },
      });
    } else {
      // Reject the payment
      const { error: updateError } = await supabase
        .from('programs')
        .update({
          status: 'cancelled',
          payment_status: 'rejected',
          admin_notes: notes || null,
        })
        .eq('id', programId);

      if (updateError) {
        console.error('[Payment Verify]', updateError);
        return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 });
      }

      // Send rejection email
      if (program.client_email) {
        sendPaymentRejectedEmail({
          email: program.client_email,
          clientName: program.client_name || 'Client',
          programType: program.program_type || 'private',
          reason: notes,
        }).catch(err => console.error('[Payment Verify] Email failed:', err));
      }

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
        program: { id: programId, status: 'cancelled', paymentStatus: 'rejected' },
      });
    }
  } catch (error) {
    console.error('[Payment Verify]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
