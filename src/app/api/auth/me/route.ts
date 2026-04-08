import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { resolveUserRole } from '@/lib/auth/role-routing';

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

    // Use service role to bypass RLS when fetching role
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error: profileError } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('[Auth ME] User ID:', user.id, 'Email:', user.email);
    console.log('[Auth ME] Profile from DB:', profile, 'Error:', profileError?.message);

    return NextResponse.json(
      {
        authenticated: true,
        role: resolveUserRole(profile?.role as string | null | undefined, user),
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