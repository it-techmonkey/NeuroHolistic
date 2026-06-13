import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';

function generateTempPassword(length = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
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

    const { userId, email } = await request.json();

    if (!userId && !email) {
      return NextResponse.json({ error: 'Either userId or email is required' }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();

    let targetUserId = userId;
    if (!targetUserId && email) {
      const { data: usersList } = await serviceSupabase.auth.admin.listUsers();
      const found = usersList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!found) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      targetUserId = found.id;
    }

    const tempPassword = generateTempPassword();

    const { error: updateError } = await serviceSupabase.auth.admin.updateUserById(
      targetUserId,
      {
        password: tempPassword,
        email_confirm: true,
      }
    );

    if (updateError) {
      console.error('[Admin Reset Password] Failed to update password:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Log the admin action
    const { data: targetUser } = await serviceSupabase
      .from('users')
      .select('email, full_name, role')
      .eq('id', targetUserId)
      .single();

    await serviceSupabase.from('admin_actions').insert({
      admin_id: user.id,
      action: 'reset_password',
      target_type: 'user',
      target_id: targetUserId,
      notes: `Password reset for ${targetUser?.full_name || targetUser?.email || targetUserId} (${targetUser?.role || 'unknown role'})`,
    });

    return NextResponse.json({
      success: true,
      tempPassword,
      user: {
        id: targetUserId,
        email: targetUser?.email,
        name: targetUser?.full_name,
        role: targetUser?.role,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
