import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import {
  type ProgramType,
  type PaymentOption,
  getPrice,
} from '@/lib/payments/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      programType,
      paymentOption,
      therapistName,
      therapistSlug,
      discountPercent,
      preferredDate,
      preferredTime,
    } = body;

    if (!programType || !paymentOption) {
      return NextResponse.json({ error: 'Missing programType or paymentOption' }, { status: 400 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // Check for existing active/pending program
    const { data: existing } = await supabase
      .from('programs')
      .select('id, status, total_sessions, used_sessions')
      .eq('user_id', user.id)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (paymentOption === 'per_session') {
        const remaining = (existing.total_sessions || 0) - (existing.used_sessions || 0);
        if (remaining > 0) {
          return NextResponse.json({ error: 'You still have sessions remaining in your current program' }, { status: 409 });
        }
      } else {
        return NextResponse.json({ error: 'You already have an active program' }, { status: 409 });
      }
    }

    // Get user details
    const { data: userData } = await authClient
      .from('users').select('full_name, email').eq('id', user.id).single();

    // Resolve therapist
    let resolvedTherapistId: string | null = null;
    let resolvedTherapistName: string | null = therapistName || null;

    if (therapistSlug || therapistName) {
      const { data: therapist } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'therapist')
        .ilike('full_name', `%${therapistName || ''}%`)
        .limit(1)
        .maybeSingle();

      if (therapist) {
        resolvedTherapistId = therapist.id;
        resolvedTherapistName = therapist.full_name || resolvedTherapistName;
      }
    }

    // Calculate price
    const basePrice = getPrice(programType as ProgramType, paymentOption as PaymentOption, therapistName, therapistSlug);
    const finalPrice = discountPercent
      ? Math.round(basePrice * (1 - discountPercent / 100))
      : basePrice;

    const totalSessions = paymentOption === 'full' ? 10 : 1;
    const paymentId = `CASH-${Date.now()}`;

    // Create program
    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: user.id,
        therapist_user_id: resolvedTherapistId,
        therapist_name: resolvedTherapistName || 'Assigned Therapist',
        total_sessions: totalSessions,
        used_sessions: 0,
        sessions_completed: 0,
        status: 'pending',
        payment_id: paymentId,
        program_type: programType,
        price_paid: finalPrice,
        client_name: userData?.full_name || 'Client',
        client_email: userData?.email || user.email || '',
        payment_status: 'pending_verification',
        payment_submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (programError || !program) {
      console.error('[Cash Payment] Program creation failed:', programError);
      return NextResponse.json({ error: 'Failed to create cash payment request' }, { status: 500 });
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: finalPrice,
        currency: 'AED',
        type: paymentOption === 'full' ? 'full_program' : 'single_session',
        status: 'pending',
        payment_reference: paymentId,
        program_id: program.id,
        metadata: {
          payment_method: 'cash',
          program_type: programType,
          payment_option: paymentOption,
          therapist_name: resolvedTherapistName,
          discount_percent: discountPercent || null,
          preferred_date: preferredDate || null,
          preferred_time: preferredTime || null,
        },
      });

    if (paymentError) {
      console.error('[Cash Payment] Payment record creation failed:', paymentError);
    }

    return NextResponse.json({
      success: true,
      programId: program.id,
      paymentId,
      message: 'Cash payment request created. Please complete payment via WhatsApp.',
    });
  } catch (error) {
    console.error('[Cash Payment]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
