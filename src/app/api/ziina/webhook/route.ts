import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { getServiceSupabase } from '@/lib/supabase/service';
import { BookingService } from '@/lib/services/booking.service';
import type { Database } from '@/lib/supabase/database.types';

const resend = new Resend(process.env.RESEND_API_KEY);
const ZIINA_WEBHOOK_IPS = new Set(['3.29.184.186', '3.29.190.95', '20.233.47.127']);

type PaymentRow = Database['public']['Tables']['payments']['Row'];

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
  latest_error?: { message?: string; code?: string };
}

interface PaymentMetadata {
  gateway?: string;
  userId?: string;
  storedProgramType?: string;
  programType?: string;
  paymentOption?: 'full' | 'per_session';
  amountAed?: number;
  amountFils?: number;
  currency?: string;
  totalSessions?: number;
  therapistId?: string | null;
  therapistName?: string | null;
  clientName?: string;
  clientEmail?: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
}

function verifyWebhookSignature(rawBody: string, request: NextRequest) {
  const secret = process.env.ZIINA_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';

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
  if (data && typeof data === 'object' && 'object' in data && data.object) return data.object;
  if (data && typeof data === 'object') return data as ZiinaPaymentIntent;
  return payload as ZiinaPaymentIntent;
}

function normalizeMetadata(payment: PaymentRow): PaymentMetadata {
  if (!payment.metadata || typeof payment.metadata !== 'object' || Array.isArray(payment.metadata)) return {};
  return payment.metadata as PaymentMetadata;
}

async function sendProgramConfirmationEmail(email: string, sessionCount: number) {
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

  console.log('[Ziina Webhook] Received webhook request');

  if (!isAllowedZiinaIp(request)) {
    console.error('[Ziina Webhook] IP not allowed');
    return NextResponse.json({ error: 'Webhook source IP is not allowed' }, { status: 403 });
  }

  if (!verifyWebhookSignature(rawBody, request)) {
    console.error('[Ziina Webhook] Invalid signature');
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
    return NextResponse.json({ error: 'Payment record not found yet' }, { status: 409 });
  }

  const metadata = normalizeMetadata(payment);
  const successStatuses = new Set(['completed']);
  const failedStatuses = new Set(['failed', 'canceled', 'cancelled']);

  if (metadata.gateway && metadata.gateway !== 'ziina') {
    return NextResponse.json({ error: 'Payment record does not belong to Ziina' }, { status: 400 });
  }

  if (metadata.amountFils && intent.amount && metadata.amountFils !== intent.amount) {
    console.error('[Ziina Webhook] Amount mismatch:', { paymentIntentId, expected: metadata.amountFils, received: intent.amount });
    return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
  }

  if (metadata.currency && intent.currency_code && metadata.currency !== intent.currency_code) {
    console.error('[Ziina Webhook] Currency mismatch:', { paymentIntentId, expected: metadata.currency, received: intent.currency_code });
    return NextResponse.json({ error: 'Payment currency mismatch' }, { status: 400 });
  }

  if (failedStatuses.has(status)) {
    await supabase
      .from('payments')
      .update({ status: 'failed', metadata: { ...metadata, ziinaStatus: status, ziinaError: intent.latest_error?.message } })
      .eq('id', payment.id);
    return NextResponse.json({ success: true, message: `Payment marked ${status}` });
  }

  if (!successStatuses.has(status)) {
    await supabase
      .from('payments')
      .update({ metadata: { ...metadata, ziinaStatus: status } })
      .eq('id', payment.id);
    return NextResponse.json({ success: true, message: `Payment status ${status} ignored` });
  }

  const paymentId = `ziina:${paymentIntentId}`;
  const userId = metadata.userId || payment.user_id;

  const { data: existingProgram } = await supabase
    .from('programs')
    .select('id, user_id, therapist_user_id, therapist_name')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existingProgram) {
    const preferredDate = metadata.preferredDate || null;
    const preferredTime = metadata.preferredTime || null;

    // Ensure first session booking exists even if created by old code
    if (preferredDate && preferredTime) {
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('program_id', existingProgram.id)
        .eq('session_number', 1)
        .eq('user_id', existingProgram.user_id || userId)
        .maybeSingle();

      if (!existingBooking) {
        console.log('[Ziina Webhook] Program exists but no booking for session 1, creating...');
        const { data: clientUser } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', existingProgram.user_id || userId)
          .maybeSingle();

        await supabase.from('bookings').insert({
          user_id: existingProgram.user_id || userId,
          name: clientUser?.full_name || metadata.clientName || 'Client',
          email: clientUser?.email || metadata.clientEmail || '',
          phone: '',
          country: '',
          therapist_id: existingProgram.therapist_user_id || 'unknown',
          therapist_user_id: existingProgram.therapist_user_id,
          therapist_name: existingProgram.therapist_name || 'Assigned Therapist',
          date: preferredDate,
          time: preferredTime,
          type: 'program',
          status: 'scheduled',
          program_id: existingProgram.id,
          session_number: 1,
          meeting_link: null,
          google_calendar_event_id: null,
        });

        await supabase
          .from('sessions')
          .update({ date: preferredDate, time: preferredTime, status: 'scheduled' })
          .eq('program_id', existingProgram.id)
          .eq('session_number', 1);
      }
    }

    // Update payment to link to existing program
    await supabase
      .from('payments')
      .update({ status: 'paid', program_id: existingProgram.id, metadata: { ...metadata, ziinaStatus: status } })
      .eq('id', payment.id);

    return NextResponse.json({ success: true, message: 'Payment already processed', programId: existingProgram.id });
  }

  if (!userId) {
    return NextResponse.json({ error: 'Payment is missing user id' }, { status: 400 });
  }

  const { data: activeProgram } = await supabase
    .from('programs')
    .select('id, therapist_user_id, therapist_name')
    .eq('user_id', userId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeProgram) {
    // Ensure first session booking exists
    const preferredDate = metadata.preferredDate || null;
    const preferredTime = metadata.preferredTime || null;

    if (preferredDate && preferredTime) {
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('program_id', activeProgram.id)
        .eq('session_number', 1)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingBooking) {
        console.log('[Ziina Webhook] Active program exists but no booking for session 1, creating...');
        const { data: clientUser } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', userId)
          .maybeSingle();

        await supabase.from('bookings').insert({
          user_id: userId,
          name: clientUser?.full_name || metadata.clientName || 'Client',
          email: clientUser?.email || metadata.clientEmail || '',
          phone: '',
          country: '',
          therapist_id: activeProgram.therapist_user_id || 'unknown',
          therapist_user_id: activeProgram.therapist_user_id,
          therapist_name: activeProgram.therapist_name || 'Assigned Therapist',
          date: preferredDate,
          time: preferredTime,
          type: 'program',
          status: 'scheduled',
          program_id: activeProgram.id,
          session_number: 1,
          meeting_link: null,
          google_calendar_event_id: null,
        });

        await supabase
          .from('sessions')
          .update({ date: preferredDate, time: preferredTime, status: 'scheduled' })
          .eq('program_id', activeProgram.id)
          .eq('session_number', 1);
      }
    }

    await supabase
      .from('payments')
      .update({ status: 'paid', program_id: activeProgram.id, metadata: { ...metadata, ziinaStatus: status, duplicateProgramPayment: true } })
      .eq('id', payment.id);

    return NextResponse.json({ success: true, message: 'User already has a pending or active program', programId: activeProgram.id });
  }

  // Create program via BookingService
  const totalSessions = Number(metadata.totalSessions) || 10;
  const programType = metadata.storedProgramType || metadata.programType || 'private';
  const clientEmail = metadata.clientEmail || '';

  const { data: finalClientUser } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .maybeSingle();

  const clientFullName = finalClientUser?.full_name || metadata.clientName || 'Client';
  const clientEmailAddress = finalClientUser?.email || clientEmail;

  const service = new BookingService();
  console.log('[Ziina Webhook] Calling purchaseProgram with:', {
    userId,
    programType,
    therapistId: metadata.therapistId || null,
    therapistName: metadata.therapistName,
    preferredDate: metadata.preferredDate || null,
    preferredTime: metadata.preferredTime || null,
    totalSessions,
  });
  const result = await service.purchaseProgram({
    userId,
    programType: programType as 'private' | 'group' | 'academy',
    therapistId: metadata.therapistId || null,
    therapistName: metadata.therapistName || (programType === 'academy' ? 'NeuroHolistic Academy' : null),
    totalSessions,
    amountAed: metadata.amountAed || payment.amount,
    paymentId,
    clientName: clientFullName,
    clientEmail: clientEmailAddress,
    preferredDate: metadata.preferredDate || null,
    preferredTime: metadata.preferredTime || null,
  });

  console.log('[Ziina Webhook] purchaseProgram result:', result);

  if (!result.success || !result.programId) {
    console.error('[Ziina Webhook] Program creation failed:', result.error);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }

  // Update payment
  await supabase
    .from('payments')
    .update({ status: 'paid', program_id: result.programId, metadata: { ...metadata, ziinaStatus: status } })
    .eq('id', payment.id);

  // Send confirmation email
  if (clientEmail) {
    sendProgramConfirmationEmail(clientEmail, totalSessions).catch((error) =>
      console.error('[Ziina Webhook] Failed to send confirmation email:', error)
    );
  }

  return NextResponse.json({ success: true, message: 'Payment processed and program activated', programId: result.programId });
}
