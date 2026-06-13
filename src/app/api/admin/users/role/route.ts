import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';

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

    const { userId, email, role } = await request.json();

    if (!userId && !email) {
      return NextResponse.json({ error: 'Either userId or email is required' }, { status: 400 });
    }

    if (!['client', 'therapist', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data, error } = await authClient
      .from('users')
      .update({ role })
      .eq(userId ? 'id' : 'email', userId || email)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `User role updated to ${role}`, user: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
