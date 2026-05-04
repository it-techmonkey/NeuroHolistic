import { NextRequest, NextResponse } from 'next/server';
import { createClient, getCurrentUserWithRole } from '@/lib/auth/server';
import { therapistBookingsOrFilter } from '@/lib/bookings/therapist-scope';

export async function POST(request: NextRequest) {
  // POST is handled by /api/bookings/create
  return NextResponse.json(
    { error: 'Use POST /api/bookings/create for creating bookings' },
    { status: 301 }
  );
}

export async function GET() {
  try {
    const authUser = await getCurrentUserWithRole();

    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = await createClient();

    let query = supabase
      .from('bookings')
      .select('*');

    if (authUser.role === 'client') {
      query = query.eq('user_id', authUser.id);
    } else if (authUser.role === 'therapist') {
      // Get therapist's name
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', authUser.id)
        .single();
      
      query = query.or(therapistBookingsOrFilter(authUser.id, userData?.full_name));
    }
    // admin: no filter — returns all bookings

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('[GET /api/bookings] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ bookings: data ?? [] });
  } catch (error) {
    console.error('[GET /api/bookings]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
