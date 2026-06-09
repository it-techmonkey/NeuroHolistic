import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { getZiinaPaymentIntent } from '@/lib/payments/ziina';
import { BookingService } from '@/lib/services/booking.service';

/**
 * Fallback endpoint: verify a payment intent was completed and ensure
 * the program + booking exist. Called by the success page when the
 * webhook may have been missed.
 */
export async function POST(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { paymentIntentId } = await request.json().catch(() => ({}));
  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    return NextResponse.json({ error: 'payment_intent_id required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const paymentId = `ziina:${paymentIntentId}`;

  const { data: existingProgram } = await supabase
    .from('programs')
    .select('id')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existingProgram) {
    return NextResponse.json({ success: true, programId: existingProgram.id, message: 'Program already exists' });
  }

  let intent;
  try {
    intent = await getZiinaPaymentIntent(paymentIntentId);
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to verify payment: ${err.message}` }, { status: 502 });
  }

  if (intent.status !== 'completed') {
    return NextResponse.json({ success: false, status: intent.status, message: 'Payment not yet completed' });
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_reference', paymentIntentId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  if (payment.status === 'paid' && payment.program_id) {
    return NextResponse.json({ success: true, programId: payment.program_id, message: 'Already processed' });
  }

  const metadata = (payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata))
    ? payment.metadata as Record<string, any>
    : {};

  const userId = metadata.userId || payment.user_id;
  if (!userId) {
    return NextResponse.json({ error: 'Payment missing user id' }, { status: 400 });
  }

  const { data: activeProgram } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeProgram) {
    await supabase
      .from('payments')
      .update({ status: 'paid', program_id: activeProgram.id, metadata: { ...metadata, ziinaStatus: 'completed', fallbackProcessed: true } })
      .eq('id', payment.id);
    return NextResponse.json({ success: true, programId: activeProgram.id, message: 'Linked to existing program' });
  }

  const totalSessions = Number(metadata.totalSessions) || 10;
  const programType = metadata.storedProgramType || metadata.programType || 'private';
  const clientEmail = metadata.clientEmail || '';

  // Get user details
  const { data: finalClient } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .maybeSingle();

  const clientFullName = finalClient?.full_name || metadata.clientName || 'Client';
  const clientEmailAddress = finalClient?.email || clientEmail;

  // Use BookingService to create program
  const service = new BookingService();
  const result = await service.purchaseProgram({
    userId,
    programType,
    therapistId: metadata.therapistId || null,
    therapistName: metadata.therapistName || null,
    totalSessions,
    amountAed: metadata.amountAed || payment.amount,
    paymentId,
    clientName: clientFullName,
    clientEmail: clientEmailAddress,
    preferredDate: metadata.preferredDate || null,
    preferredTime: metadata.preferredTime || null,
    paymentStatus: 'verified',
  });

  if (!result.success || !result.programId) {
    return NextResponse.json({ error: result.error || 'Failed to create program' }, { status: 500 });
  }

  // Update payment record
  await supabase
    .from('payments')
    .update({ status: 'paid', program_id: result.programId, metadata: { ...metadata, ziinaStatus: 'completed', fallbackProcessed: true } })
    .eq('id', payment.id);

  return NextResponse.json({ success: true, programId: result.programId, message: 'Program created via fallback' });
}
