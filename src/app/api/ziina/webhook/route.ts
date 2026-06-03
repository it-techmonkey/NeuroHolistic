import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { getServiceSupabase } from '@/lib/supabase/service';
import type { Database } from '@/lib/supabase/database.types';

const resend = new Resend(process.env.RESEND_API_KEY);
const ZIINA_WEBHOOK_IPS = new Set(['3.29.184.186', '3.29.190.95', '20.233.47.127']);

type PaymentRow = Database['public']['Tables']['payments']['Row'];
type ProgramType = 'private' | 'group' | 'academy';

interface ZiinaWebhookEvent {
  event?: string;
  type?: string;
  data?: ZiinaPaymentIntent | { object?: ZiinaPaymentIntent };
}

interface ZiinaPaymentIntent {
  id?: string;
  status?: string;
  amount?: number;
  currency_code?: string;
  latest_error?: {
    message?: string;
    code?: string;
  };
}

interface PaymentMetadata {
  gateway?: string;
  userId?: string;
  storedProgramType?: ProgramType;
  programType?: ProgramType;
  paymentOption?: 'full' | 'per_session';
  amountAed?: number;
  amountFils?: number;
  currency?: string;
  totalSessions?: number;
  therapistId?: string | null;
  therapistName?: string | null;
  clientName?: string;
  clientEmail?: string;
}

function verifyWebhookSignature(rawBody: string, request: NextRequest) {
  const secret = process.env.ZIINA_WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const signature = request.headers.get('x-hmac-signature');
  if (!signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = signature.trim();

  if (expected.length !== received.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function isAllowedZiinaIp(request: NextRequest) {
  if (process.env.ZIINA_ENFORCE_WEBHOOK_IP_ALLOWLIST !== 'true') return true;

  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip');
  const candidate = firstForwardedIp || realIp;

  return !!candidate && ZIINA_WEBHOOK_IPS.has(candidate);
}

function extractIntent(payload: ZiinaWebhookEvent): ZiinaPaymentIntent {
  const data = payload.data;
  if (data && typeof data === 'object' && 'object' in data && data.object) {
    return data.object;
  }

  if (data && typeof data === 'object') {
    return data as ZiinaPaymentIntent;
  }

  return payload as ZiinaPaymentIntent;
}

function normalizeMetadata(payment: PaymentRow): PaymentMetadata {
  if (!payment.metadata || typeof payment.metadata !== 'object' || Array.isArray(payment.metadata)) {
    return {};
  }

  return payment.metadata as PaymentMetadata;
}

async function ensurePendingSessions({
  supabase,
  programId,
  userId,
  therapistId,
  totalSessions,
}: {
  supabase: ReturnType<typeof getServiceSupabase>;
  programId: string;
  userId: string;
  therapistId: string | null;
  totalSessions: number;
}) {
  const { data: existingSessions, error: existingSessionsError } = await supabase
    .from('sessions')
    .select('session_number')
    .eq('program_id', programId);

  if (existingSessionsError) {
    return existingSessionsError;
  }

  const existingNumbers = new Set((existingSessions || []).map((session) => session.session_number));
  const missingSessions = Array.from({ length: totalSessions }, (_, index) => index + 1)
    .filter((sessionNumber) => !existingNumbers.has(sessionNumber))
    .map((sessionNumber) => ({
      program_id: programId,
      client_id: userId,
      therapist_id: therapistId,
      session_number: sessionNumber,
      date: null,
      time: null,
      status: 'pending' as const,
      is_complete: false,
      development_form_submitted: false,
      meet_link: null,
    }));

  if (missingSessions.length === 0) {
    return null;
  }

  const { error } = await supabase.from('sessions').insert(missingSessions);
  return error;
}

async function sendProgramConfirmationEmail({
  email,
  sessionCount,
}: {
  email: string;
  sessionCount: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <noreply@neuroholisticinstitute.com>',
    to: email,
    subject: 'Program Confirmation - NeuroHolistic Institute',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Program Confirmed</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px 40px;">
    <div style="background:#2B2F55;padding:36px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;">Program Confirmed</h1>
    </div>
    <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
      <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">
        Your NeuroHolistic program (<strong>${sessionCount} session${sessionCount !== 1 ? 's' : ''}</strong>) has been confirmed. You can now schedule your sessions through your dashboard.
      </p>
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client"
           style="display:inline-block;padding:14px 32px;background:#2B2F55;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!isAllowedZiinaIp(request)) {
    return NextResponse.json({ error: 'Webhook source IP is not allowed' }, { status: 403 });
  }

  if (!verifyWebhookSignature(rawBody, request)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  let payload: ZiinaWebhookEvent;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook JSON' }, { status: 400 });
  }

  const eventName = payload.event || payload.type;
  if (eventName && eventName !== 'payment_intent.status.updated') {
    return NextResponse.json({ success: true, message: 'Event ignored' });
  }

  const intent = extractIntent(payload);
  const paymentIntentId = intent.id;
  const status = intent.status?.toLowerCase();

  if (!paymentIntentId || !status) {
    return NextResponse.json({ error: 'Missing payment intent id or status' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_reference', paymentIntentId)
    .maybeSingle();

  if (paymentError) {
    console.error('[Ziina Webhook] Payment lookup failed:', paymentError);
    return NextResponse.json({ error: 'Payment lookup failed' }, { status: 500 });
  }

  if (!payment) {
    // Returning non-2xx asks Ziina to retry; this protects the tiny race between intent creation and local save.
    return NextResponse.json({ error: 'Payment record not found yet' }, { status: 409 });
  }

  const metadata = normalizeMetadata(payment);
  const successStatuses = new Set(['completed']);
  const failedStatuses = new Set(['failed', 'canceled', 'cancelled']);

  if (metadata.gateway && metadata.gateway !== 'ziina') {
    return NextResponse.json({ error: 'Payment record does not belong to Ziina' }, { status: 400 });
  }

  if (metadata.amountFils && intent.amount && metadata.amountFils !== intent.amount) {
    console.error('[Ziina Webhook] Amount mismatch:', {
      paymentIntentId,
      expected: metadata.amountFils,
      received: intent.amount,
    });
    return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
  }

  if (metadata.currency && intent.currency_code && metadata.currency !== intent.currency_code) {
    console.error('[Ziina Webhook] Currency mismatch:', {
      paymentIntentId,
      expected: metadata.currency,
      received: intent.currency_code,
    });
    return NextResponse.json({ error: 'Payment currency mismatch' }, { status: 400 });
  }

  if (failedStatuses.has(status)) {
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        metadata: {
          ...metadata,
          ziinaStatus: status,
          ziinaError: intent.latest_error?.message,
        },
      })
      .eq('id', payment.id);

    return NextResponse.json({ success: true, message: `Payment marked ${status}` });
  }

  if (!successStatuses.has(status)) {
    await supabase
      .from('payments')
      .update({
        metadata: {
          ...metadata,
          ziinaStatus: status,
        },
      })
      .eq('id', payment.id);

    return NextResponse.json({ success: true, message: `Payment status ${status} ignored` });
  }

  const paymentId = `ziina:${paymentIntentId}`;

  const { data: existingProgram, error: existingProgramError } = await supabase
    .from('programs')
    .select('id')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existingProgramError) {
    console.error('[Ziina Webhook] Existing program check failed:', existingProgramError);
    return NextResponse.json({ error: 'Program lookup failed' }, { status: 500 });
  }

  if (existingProgram) {
    const userId = metadata.userId || payment.user_id;
    if (userId) {
      const sessionsError = await ensurePendingSessions({
        supabase,
        programId: existingProgram.id,
        userId,
        therapistId: metadata.therapistId || null,
        totalSessions: Number(metadata.totalSessions) || 10,
      });

      if (sessionsError) {
        console.error('[Ziina Webhook] Failed to repair sessions for existing program:', sessionsError);
        return NextResponse.json({ error: 'Failed to repair program sessions' }, { status: 500 });
      }
    }

    await supabase
      .from('payments')
      .update({
        status: 'paid',
        program_id: existingProgram.id,
        metadata: {
          ...metadata,
          ziinaStatus: status,
        },
      })
      .eq('id', payment.id);

    return NextResponse.json({
      success: true,
      message: 'Payment already processed',
      programId: existingProgram.id,
    });
  }

  const userId = metadata.userId || payment.user_id;
  if (!userId) {
    return NextResponse.json({ error: 'Payment is missing user id' }, { status: 400 });
  }

  const { data: activeProgram, error: activeProgramError } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeProgramError) {
    console.error('[Ziina Webhook] Active program check failed:', activeProgramError);
    return NextResponse.json({ error: 'Active program lookup failed' }, { status: 500 });
  }

  if (activeProgram) {
    await supabase
      .from('payments')
      .update({
        status: 'paid',
        program_id: activeProgram.id,
        metadata: {
          ...metadata,
          ziinaStatus: status,
          duplicateProgramPayment: true,
        },
      })
      .eq('id', payment.id);

    return NextResponse.json({
      success: true,
      message: 'User already has a pending or active program',
      programId: activeProgram.id,
    });
  }

  const totalSessions = Number(metadata.totalSessions) || 10;
  const programType = metadata.storedProgramType || metadata.programType || 'private';
  const therapistId = metadata.therapistId || null;
  const therapistName = metadata.therapistName || (programType === 'academy' ? 'NeuroHolistic Academy' : 'Assigned Therapist');
  const clientEmail = metadata.clientEmail || '';

  const { data: program, error: programError } = await supabase
    .from('programs')
    .insert({
      user_id: userId,
      therapist_user_id: therapistId,
      therapist_name: therapistName,
      total_sessions: totalSessions,
      used_sessions: 0,
      sessions_completed: 0,
      status: 'active',
      payment_id: paymentId,
      program_type: programType,
      price_paid: metadata.amountAed || payment.amount,
      client_name: metadata.clientName || 'Client',
      client_email: clientEmail,
      payment_status: 'verified',
      payment_submitted_at: new Date().toISOString(),
      payment_verified_at: new Date().toISOString(),
      admin_notes: `Automatically verified by Ziina payment intent ${paymentIntentId}`,
    })
    .select('id')
    .single();

  if (programError || !program) {
    console.error('[Ziina Webhook] Program creation failed:', programError);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }

  const sessionsError = await ensurePendingSessions({
    supabase,
    programId: program.id,
    userId,
    therapistId,
    totalSessions,
  });

  if (sessionsError) {
    console.error('[Ziina Webhook] Failed to create sessions:', sessionsError);
    return NextResponse.json({ error: 'Failed to create program sessions' }, { status: 500 });
  }

  if (therapistId) {
    const { error: relationshipError } = await supabase.from('therapist_clients').upsert(
      {
        therapist_id: therapistId,
        client_id: userId,
      },
      { onConflict: 'therapist_id,client_id' }
    );

    if (relationshipError) {
      console.error('[Ziina Webhook] Failed to upsert therapist-client relationship:', relationshipError);
    }
  }

  await supabase
    .from('payments')
    .update({
      status: 'paid',
      program_id: program.id,
      metadata: {
        ...metadata,
        ziinaStatus: status,
      },
    })
    .eq('id', payment.id);

  if (clientEmail) {
    sendProgramConfirmationEmail({
      email: clientEmail,
      sessionCount: totalSessions,
    }).catch((error) => console.error('[Ziina Webhook] Failed to send confirmation email:', error));
  }

  return NextResponse.json({
    success: true,
    message: 'Payment processed and program activated',
    programId: program.id,
  });
}
