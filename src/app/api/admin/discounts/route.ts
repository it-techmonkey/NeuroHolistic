import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { isValidDiscount } from '@/lib/payments/discount';

async function requireAdmin() {
  const authClient = await createClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };

  return { user, supabase: getServiceSupabase() };
}

// GET /api/admin/discounts — list all active discounts with client info
export async function GET() {
  try {
    const admin = await requireAdmin();
    if ('error' in admin) return admin.error;

    const { data, error } = await admin.supabase
      .from('client_discounts')
      .select(`
        id,
        client_id,
        discount_percent,
        assigned_by,
        reason,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Discounts] Fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const discounts = data ?? [];

    // Fetch client and admin names in parallel
    const clientIds = [...new Set(discounts.map(d => d.client_id))];
    const adminIds = [...new Set(discounts.map(d => d.assigned_by))];

    const [clientsResult, adminsResult] = await Promise.all([
      admin.supabase.from('users').select('id, full_name, email').in('id', clientIds),
      admin.supabase.from('users').select('id, full_name').in('id', adminIds),
    ]);

    const clientMap = new Map((clientsResult.data ?? []).map(c => [c.id, c]));
    const adminMap = new Map((adminsResult.data ?? []).map(a => [a.id, a]));

    const enriched = discounts.map(d => ({
      id: d.id,
      clientId: d.client_id,
      clientName: clientMap.get(d.client_id)?.full_name || 'Unknown',
      clientEmail: clientMap.get(d.client_id)?.email || '',
      discountPercent: d.discount_percent,
      assignedBy: d.assigned_by,
      assignedByName: adminMap.get(d.assigned_by)?.full_name || 'Unknown',
      reason: d.reason,
      isActive: d.is_active,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));

    return NextResponse.json({ discounts: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/discounts — assign discount to a client
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if ('error' in admin) return admin.error;

    const body = await request.json();
    const { clientId, discountPercent, reason } = body;

    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    if (!isValidDiscount(discountPercent)) {
      return NextResponse.json({ error: 'discountPercent must be 10, 15, or 20' }, { status: 400 });
    }

    // Verify the target user exists and is a client
    const { data: targetUser, error: userError } = await admin.supabase
      .from('users')
      .select('id, role, full_name')
      .eq('id', clientId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (targetUser.role !== 'client') {
      return NextResponse.json({ error: 'Discounts can only be assigned to clients' }, { status: 400 });
    }

    // Deactivate any existing active discount for this client
    await admin.supabase
      .from('client_discounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('is_active', true);

    // Insert new discount
    const { data: discount, error: insertError } = await admin.supabase
      .from('client_discounts')
      .insert({
        client_id: clientId,
        discount_percent: discountPercent,
        assigned_by: admin.user.id,
        reason: reason || null,
        is_active: true,
      })
      .select('id, client_id, discount_percent, created_at')
      .single();

    if (insertError) {
      console.error('[Admin Discounts] Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Log admin action
    await admin.supabase.from('admin_actions').insert({
      admin_id: admin.user.id,
      action: 'assign_discount',
      target_type: 'client_discount',
      target_id: discount.id,
      notes: `${discountPercent}% discount assigned to ${targetUser.full_name || clientId}${reason ? ` — ${reason}` : ''}`,
    });

    return NextResponse.json({
      success: true,
      discount: {
        id: discount.id,
        clientId: discount.client_id,
        clientName: targetUser.full_name,
        discountPercent: discount.discount_percent,
        createdAt: discount.created_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/discounts — deactivate a discount
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if ('error' in admin) return admin.error;

    const body = await request.json();
    const { clientId } = body;

    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await admin.supabase
      .from('client_discounts')
      .select('id, discount_percent')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'No active discount found for this client' }, { status: 404 });
    }

    const { error: updateError } = await admin.supabase
      .from('client_discounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (updateError) {
      console.error('[Admin Discounts] Deactivate error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log admin action
    await admin.supabase.from('admin_actions').insert({
      admin_id: admin.user.id,
      action: 'remove_discount',
      target_type: 'client_discount',
      target_id: existing.id,
      notes: `${existing.discount_percent}% discount removed from client ${clientId}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
