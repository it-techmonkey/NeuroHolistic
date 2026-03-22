import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { normalizeUserRole } from '@/lib/auth/role-routing';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          role: null,
        },
        { status: 200 }
      );
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return NextResponse.json(
      {
        authenticated: true,
        role: normalizeUserRole(profile?.role as string | null | undefined),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        role: null,
        error: error instanceof Error ? error.message : 'Unknown auth snapshot failure',
      },
      { status: 500 }
    );
  }
}