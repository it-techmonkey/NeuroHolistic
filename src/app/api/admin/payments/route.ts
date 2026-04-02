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

    const { data: programs, error } = await supabase
      .from('programs')
      .select('*')
      .eq('payment_status', 'pending_verification')
      .order('payment_submitted_at', { ascending: false });

    if (error) {
      console.error('[Admin Payments]', error);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    const payments = (programs || []).map(p => ({
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
    }));

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('[Admin Payments]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
