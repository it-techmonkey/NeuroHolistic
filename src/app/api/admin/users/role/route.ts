import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';

/**
 * Admin API to manage user roles
 * 
 * POST /api/admin/users/role
 * Body: { userId: string, email: string, role: 'client' | 'therapist' }
 * 
 * This endpoint should be protected by additional authentication/authorization checks
 */

async function verifyAdminAccess(request: NextRequest) {
  // TODO: Add proper admin authorization check
  // For now, this is a placeholder that should be implemented with proper admin checks
  const authHeader = request.headers.get('Authorization');
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    if (!(await verifyAdminAccess(request))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, email, role } = await request.json();

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'Either userId or email is required' },
        { status: 400 }
      );
    }

    if (!['client', 'therapist'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update user role
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq(userId ? 'id' : 'email', userId || email)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `User role updated to ${role}`,
        user: data,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!(await verifyAdminAccess(request))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get all users
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: data?.length || 0,
        users: data || [],
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
