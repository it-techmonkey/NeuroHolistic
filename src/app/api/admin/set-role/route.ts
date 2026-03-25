import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
    }

    if (!['client', 'therapist', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Find user by email
    const { data: users } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const user = users[0];

    // Update role
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role} for ${email}`,
      user: { id: user.id, email: user.email, role }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
