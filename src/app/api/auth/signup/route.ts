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

    // Create admin client
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if user already exists by listing users and finding by email
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = usersList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // User already exists - update their password and ensure email is confirmed
      userId = existingUser.id;
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            phone,
            country,
          },
        }
      );

      if (updateError) {
        console.error('[Auth Signup] Failed to update user password:', updateError);
        return NextResponse.json({ error: 'Failed to update account. Please try again.' }, { status: 500 });
      }
    } else {
      // Create new user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: userRole === 'client',
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone,
          country,
        },
      });

      if (authError) {
        console.error('[Auth Signup] Failed to create user:', authError);
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      if (!authData.user) {
        return NextResponse.json({ error: 'Failed to create auth user.' }, { status: 500 });
      }

      userId = authData.user.id;
      isNewUser = true;
    }

    // Create or update record in users table
    const supabase = getServiceSupabase();
    if (isNewUser) {
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email,
        role: userRole,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: phone ?? null,
        country: country ?? null,
      });

      if (profileError) {
        console.error('[Auth Signup] Failed to create user profile:', profileError);
      }
    } else {
      // Update existing user profile
      await supabase.from('users').upsert({
        id: userId,
        email,
        role: userRole,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: phone ?? null,
        country: country ?? null,
      }, { onConflict: 'id' });
    }

    // Sign in the user to get a session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('[Auth Signup] Auto sign-in failed:', signInError);
      return NextResponse.json({ 
        error: 'Account created but sign-in failed. Please try logging in manually.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      userId: userId,
      email: email,
      role: userRole,
      session: {
        access_token: signInData.session?.access_token,
        refresh_token: signInData.session?.refresh_token,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[Auth Signup]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
