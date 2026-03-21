import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { Database } from '@/lib/supabase/database.types';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendProgramConfirmationEmail({
  email,
  sessionCount,
  programId,
}: {
  email: string;
  sessionCount: number;
  programId: string;
}) {
  await resend.emails.send({
    from: 'NeuroHolistic Institute <nboarding@resend.dev>',
    to: email,
    subject: 'Program Confirmation — NeuroHolistic Institute',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Program Confirmed</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px 40px;">
    <div style="background:linear-gradient(135deg,#2B2F55 0%,#3d4270 100%);padding:36px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:50%;margin-bottom:14px;">
        <span style="color:#fff;font-size:24px;">✓</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;">Program Confirmed</h1>
    </div>
    <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
      <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">
        Your NeuroHolistic program (<strong>${sessionCount} session${sessionCount !== 1 ? 's' : ''}</strong>) has been confirmed. You can now schedule your sessions through your dashboard.
      </p>
      <div style="background:#f8fafc;border-left:4px solid #2B2F55;padding:16px 20px;border-radius:8px;margin-bottom:28px;">
        <p style="margin:0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">What's next</p>
        <ul style="margin:10px 0 0;padding-left:18px;color:#475569;font-size:14px;line-height:1.8;">
          <li>Log in to your NeuroHolistic dashboard</li>
          <li>Click "Schedule Your Session" to book your first appointment</li>
          <li>Choose your preferred therapist, date, and time</li>
        </ul>
      </div>
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;padding:14px 32px;background:#2B2F55;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Go to Dashboard
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

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ZiinaWebhookPayload {
  status: string;
  id?: string;
  reference?: string;
  sessionId?: string;
  amount?: number;
  currency?: string;
  metadata?: {
    email?: string;
    user_id?: string;
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[Webhook] ERROR - Invalid JSON in request body:', {
        error: e instanceof Error ? e.message : String(e),
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const payload: ZiinaWebhookPayload = body;

    // Log full request body
    console.log('[Webhook] Full request body:', JSON.stringify(body, null, 2));

    // Extract payment identifier from any available field
    const paymentId = payload.id || payload.reference || payload.sessionId;
    const idFieldUsed = payload.id ? 'id' : payload.reference ? 'reference' : 'sessionId';

    // Log incoming webhook with flexible validation info
    console.log('[Webhook] Received Ziina webhook:', {
      status: payload.status,
      paymentId: paymentId,
      paymentIdField: idFieldUsed,
      hasMetadata: !!payload.metadata,
      timestamp: new Date().toISOString(),
    });

    // Validate required fields: status is mandatory, and at least one ID field must exist
    if (!payload.status) {
      console.error('[Webhook] VALIDATION FAILED - Missing status field');
      return NextResponse.json(
        { error: 'Status field is required' },
        { status: 400 }
      );
    }

    if (!paymentId) {
      console.error('[Webhook] VALIDATION FAILED - Missing payment identifier (id, reference, or sessionId)', {
        id: payload.id ? 'present' : 'missing',
        reference: payload.reference ? 'present' : 'missing',
        sessionId: payload.sessionId ? 'present' : 'missing',
      });
      return NextResponse.json(
        { error: 'Payment identifier required (id, reference, or sessionId)' },
        { status: 400 }
      );
    }

    // Check payment status - only proceed if successful
    const successStatuses = ['completed', 'succeeded', 'approved', 'success'];
    if (!successStatuses.includes(payload.status.toLowerCase())) {
      console.log('[Webhook] SKIPPED - Ignoring payment with non-success status:', {
        status: payload.status,
        reference: payload.reference,
        reason: 'status not in success list',
      });
      return NextResponse.json({
        success: true,
        message: `Payment status ${payload.status} does not require action`,
      });
    }

    // Extract metadata
    const userEmail = payload.metadata?.email;
    const userId = payload.metadata?.user_id;
    const sessionCount = Number(payload.metadata?.session_count) || 10;

    console.log('[Webhook] Extracted metadata:', {
      email: userEmail || 'NOT PROVIDED',
      user_id: userId || 'NOT PROVIDED',
      fullMetadata: payload.metadata || {},
    });

    if (!userEmail) {
      console.error(
        '[Webhook] VALIDATION FAILED - Missing email in metadata for reference:',
        payload.reference
      );
      return NextResponse.json(
        { error: 'Email not found in payment metadata' },
        { status: 400 }
      );
    }

    console.log('[Webhook] Processing successful payment:', {
      reference: payload.reference,
      email: userEmail,
      userId: userId || 'not-provided',
    });

    // Check for existing program with this payment identifier
    console.log('[Webhook] Checking for existing program with payment ID:', {
      paymentId,
      field: idFieldUsed,
    });
    const { data: existingProgram, error: checkError } = await supabase
      .from('programs')
      .select('id')
      .eq('payment_id', paymentId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = "not found", which is expected
      console.error('[Webhook] ERROR - Database query failed when checking for duplicates:', {
        code: checkError.code,
        message: checkError.message,
        paymentId,
      });
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // If program already exists, return success (idempotent)
    if (existingProgram) {
      console.log('[Webhook] DUPLICATE DETECTED - Program already exists for payment:', {
        paymentId,
        paymentIdField: idFieldUsed,
        programId: existingProgram.id,
        email: userEmail,
        action: 'returning early (idempotent)',
      });
      return NextResponse.json({
        success: true,
        message: 'Program already exists for this payment',
        programId: existingProgram.id,
      });
    }

    // Create new program record
    const { data: newProgram, error: insertError } = await supabase
      .from('programs')
      .insert({
        user_id: userId || null,
        total_sessions: sessionCount,
        used_sessions: 0,
        payment_id: paymentId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[Webhook] ERROR - Failed to create program:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        paymentId,
        email: userEmail,
        userId: userId || 'null',
      });
      return NextResponse.json(
        { error: 'Failed to create program' },
        { status: 500 }
      );
    }

    console.log('[Webhook] SUCCESS - Program created:', {
      programId: newProgram.id,
      paymentId,
      email: userEmail,
      userId: userId || 'not-provided',
      totalSessions: sessionCount,
      timestamp: new Date().toISOString(),
    });

    // Send program confirmation email (fire-and-forget)
    if (userEmail) {
      sendProgramConfirmationEmail({
        email: userEmail,
        sessionCount,
        programId: newProgram.id,
      }).catch((err) => console.error('[Webhook] Failed to send program email:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Payment processed and program created',
      programId: newProgram.id,
      payment: {
        paymentId,
        paymentIdField: idFieldUsed,
        amount: payload.amount,
        currency: payload.currency,
      },
    });
  } catch (error) {
    console.error('[Webhook] ERROR - Unexpected error during processing:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
