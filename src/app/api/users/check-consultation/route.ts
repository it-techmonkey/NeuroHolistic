import { createClient } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/users/check-consultation
 *
 * Check if a user already has a consultation booking.
 * Clients get one free consultation — after that they must book a program.
 *
 * Request body: { email: string }
 * Response:     { hasHadConsultation: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error('[check-consultation] User lookup error:', userError);
      return NextResponse.json({ error: 'Failed to check user' }, { status: 500 });
    }

    if (!user) {
      // No user record → no consultation yet
      return NextResponse.json({ hasHadConsultation: false });
    }

    // Check if any booking of type 'consultation' exists for this user
    const { data: consultation, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'consultation')
      .limit(1)
      .maybeSingle();

    if (bookingError) {
      console.error('[check-consultation] Booking lookup error:', bookingError);
      return NextResponse.json({ error: 'Failed to check bookings' }, { status: 500 });
    }

    return NextResponse.json({ hasHadConsultation: !!consultation });
  } catch (error) {
    console.error('[check-consultation] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
