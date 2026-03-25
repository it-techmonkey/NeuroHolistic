import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone, country, role = 'client' } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'First name, last name, email, and password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }
    if (phone && !country) {
      return NextResponse.json({ error: 'Country is required when phone is provided.' }, { status: 400 });
    }

    const validRoles = ['client', 'therapist', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'client';

    // Create auth user via admin SDK
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: userRole === 'client', // Auto-confirm for clients during free consultation
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        country,
      },
    });

    if (authError) {
      // Handle duplicate email
      if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user.' }, { status: 500 });
    }

    // Create record in users table
    const supabase = getServiceSupabase();
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      role: userRole,
      full_name: `${firstName} ${lastName}`.trim(),
      phone: phone ?? null,
      country: country ?? null,
    });

    if (profileError) {
      console.error('[Auth Signup] Failed to create user profile:', profileError);
      // Don't fail the request — auth user was created, profile can be retried
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      email: authData.user.email,
      role: userRole,
    }, { status: 201 });
  } catch (error) {
    console.error('[Auth Signup]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
