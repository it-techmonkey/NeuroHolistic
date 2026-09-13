import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase/service';
import { normalizePhone } from '@/lib/phone';

/**
 * Public sign-up used by the booking flows (free consultation, paid program).
 *
 * Two rules this route exists to enforce, both learned the hard way:
 *
 *  1. It never sets a password on an account that already exists. Proving you
 *     own an address is the whole point of a password, so the only way past an
 *     existing account is to supply its current one. Callers already treat 409
 *     as "carry on without a session", so an existing client booking again
 *     still completes their booking.
 *
 *  2. The role is never taken from the request. This endpoint is unauthenticated;
 *     anything it accepts, a stranger can send. Privileged roles are granted
 *     only by the authenticated admin routes.
 */

/** Supabase reports a duplicate address differently across versions. */
function isDuplicateEmail(error: { code?: string; message?: string; status?: number }): boolean {
  if (error.code === 'email_exists' || error.code === 'user_already_exists') return true;
  const message = (error.message || '').toLowerCase();
  return message.includes('already been registered') || message.includes('already registered');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone, country } = body;

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

    // Store phones in one shape everywhere, and refuse what we cannot store.
    let normalizedPhone: string | null = null;
    if (phone) {
      normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        return NextResponse.json(
          { error: 'Please enter a valid mobile number including the country code.' },
          { status: 400 }
        );
      }
    }

    // Self-service sign-up only ever creates a client.
    const userRole = 'client';

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Creating first and reacting to the duplicate error keeps this atomic —
    // no "list every user" scan that silently stops at the first page, and no
    // gap between checking and creating for two requests to race through.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: normalizedPhone,
        country,
      },
    });

    let userId: string;
    let isNewUser = false;

    if (authError) {
      if (!isDuplicateEmail(authError)) {
        console.error('[Auth Signup] Failed to create user:', authError);
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      // The address is taken. The supplied password is the only acceptable
      // proof of ownership — if it is wrong we change nothing at all.
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.user) {
        return NextResponse.json(
          {
            error: 'An account with this email already exists. Please log in, or reset your password if you have forgotten it.',
            accountExists: true,
          },
          { status: 409 }
        );
      }

      userId = signInData.user.id;

      // Owner confirmed: refresh their details, but never their password.
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...signInData.user.user_metadata,
          first_name: firstName,
          last_name: lastName,
          phone: normalizedPhone ?? signInData.user.user_metadata?.phone ?? null,
          country: country ?? signInData.user.user_metadata?.country ?? null,
        },
      });
    } else {
      if (!authData.user) {
        return NextResponse.json({ error: 'Failed to create auth user.' }, { status: 500 });
      }
      userId = authData.user.id;
      isNewUser = true;
    }

    const supabase = getServiceSupabase();

    // Preserve privileged roles when the account already exists.
    const { data: existingProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    const preservedRole =
      existingProfile?.role === 'admin' || existingProfile?.role === 'therapist'
        ? existingProfile.role
        : userRole;

    if (isNewUser) {
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email,
        role: preservedRole,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: normalizedPhone,
        country: country ?? null,
      });

      if (profileError) {
        console.error('[Auth Signup] Failed to create user profile:', profileError);
      }
    } else {
      await supabase.from('users').upsert({
        id: userId,
        email,
        role: preservedRole,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: normalizedPhone,
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
      role: preservedRole,
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
