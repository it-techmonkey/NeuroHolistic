import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch programs awaiting verification
    const { data: programs, error } = await supabase
      .from('programs')
      .select('*')
      .eq('payment_status', 'pending_verification')
      .order('payment_submitted_at', { ascending: false });

    if (error) {
      console.error('[Admin Payments]', error);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    // 2. Fetch pending payment records that have a program_id
    //    (catches any orphaned or mismatched records)
    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .not('program_id', 'is', null)
      .order('created_at', { ascending: false });

    // Build a set of program IDs already from the programs query
    const programIds = new Set((programs || []).map((p: any) => p.id));

    // 3. For any pending payments whose program isn't already in the list,
    //    fetch the program and add it
    const extraProgramIds: string[] = [];
    for (const pay of (pendingPayments || [])) {
      if (pay.program_id && !programIds.has(pay.program_id)) {
        extraProgramIds.push(pay.program_id);
      }
    }

    let extraPrograms: any[] = [];
    if (extraProgramIds.length > 0) {
      const { data: epData } = await supabase
        .from('programs')
        .select('*')
        .in('id', extraProgramIds);
      extraPrograms = epData || [];
    }

    const allPrograms = [...(programs || []), ...extraPrograms];

    // 4. Fetch related payment records for all programs
    const allProgramIds = allPrograms.map((p: any) => p.id).filter(Boolean);
    let relatedPayments: any[] = [];
    if (allProgramIds.length > 0) {
      const { data: rpData, error: rpError } = await supabase
        .from('payments')
        .select('*')
        .in('program_id', allProgramIds);

      if (rpError) {
        console.error('[Admin Payments] related payments fetch error', rpError);
        relatedPayments = [];
      } else {
        relatedPayments = rpData || [];
      }
    }

    // 5. Build the final payments list
    const payments = allPrograms.map((p: any) => {
      const paymentRow = (relatedPayments || []).find((pay: any) => String(pay.program_id) === String(p.id));
      const metadata = paymentRow?.metadata || {};
      return {
        id: p.id,
        userId: p.user_id,
        clientName: p.client_name || 'Unknown',
        clientEmail: p.client_email || '',
        programType: p.program_type || 'private',
        pricePaid: p.price_paid || 0,
        paymentId: p.payment_id,
        paymentStatus: p.payment_status,
        paymentSubmittedAt: p.payment_submitted_at,
        therapistName: p.therapist_name || 'Unassigned',
        totalSessions: p.total_sessions,
        status: p.status,
        createdAt: p.created_at,
        payment_reference: paymentRow?.payment_reference || null,
        payment_metadata: paymentRow?.metadata || null,
        paymentMethod: metadata.payment_method || (p.payment_id?.startsWith('CASH-') ? 'cash' : 'ziina'),
      };
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('[Admin Payments]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
