import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { eventEmailLayout, sendEventEmail } from '@/lib/events/event-emails';

/**
 * Admin cancellation of an event registration.
 *
 * The row is kept and marked cancelled rather than deleted, so the audit trail
 * and any payment reference survive. Cancelled registrations are excluded from
 * reminder emails. Refunds are handled separately in the payment gateway —
 * this endpoint does not move money.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : null;
    const notify = body?.notify !== false;

    const supabase = getServiceSupabase();

    const { data: registration, error: fetchError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status === 'cancelled') {
      return NextResponse.json({ error: 'This registration is already cancelled.' }, { status: 409 });
    }

    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        cancellation_reason: reason,
      })
      .eq('id', id);

    if (updateError) {
      console.error('[AdminCancelEventRegistration]', updateError);
      return NextResponse.json({ error: 'Failed to cancel registration.' }, { status: 500 });
    }

    if (notify) {
      const firstName = String(registration.name || '').trim().split(' ')[0] || 'there';
      const refundNote =
        registration.payment_status === 'paid'
          ? `<p style="margin:0 0 16px;color:#334155;">If a refund is due, our team will be in touch about it separately.</p>`
          : '';

      sendEventEmail({
        to: registration.email,
        subject: `Your registration has been cancelled: ${registration.event_title}`,
        html: eventEmailLayout('Registration Cancelled', `
      <p style="margin:0 0 12px;color:#334155;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;color:#334155;">Your registration for <strong>${registration.event_title}</strong> has been cancelled.</p>
      ${reason ? `<p style="margin:0 0 16px;color:#334155;">Reason: ${reason}</p>` : ''}
      ${refundNote}
      <p style="margin:0;color:#64748b;font-size:13px;">If this was unexpected, please reply to this email and we'll look into it.</p>`),
      }).catch((err) => console.error('[AdminCancelEventRegistration] Email error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AdminCancelEventRegistration]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
