import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';
import { BOOKING_TIME_SLOTS } from '@/lib/booking/slots';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');
    const therapistId = request.nextUrl.searchParams.get('therapistId');
    const therapistUserId = request.nextUrl.searchParams.get('therapistUserId');
    const excludeBookingId = request.nextUrl.searchParams.get('excludeBookingId');

    if (!date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    let resolvedTherapistId = therapistId;
    let resolvedTherapistUserId = therapistUserId;

    if (!resolvedTherapistId && !resolvedTherapistUserId) {
      const authClient = await createClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: program } = await supabase
        .from('programs')
        .select('therapist_user_id, therapist_name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      resolvedTherapistUserId = program?.therapist_user_id ?? null;
      resolvedTherapistId = program?.therapist_name ?? 'program-session';
    }

    let query = supabase
      .from('bookings')
      .select('id,time')
      .eq('date', date)
      .eq('status', 'confirmed');

    if (resolvedTherapistUserId) {
      query = query.eq('therapist_user_id', resolvedTherapistUserId);
    } else if (resolvedTherapistId) {
      query = query.eq('therapist_id', resolvedTherapistId);
    }

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { data: takenSlots, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const occupied = new Set((takenSlots ?? []).map((slot) => slot.time));
    const availableSlots = BOOKING_TIME_SLOTS.filter((slot) => !occupied.has(slot));

    return NextResponse.json({
      date,
      therapistId: resolvedTherapistId,
      therapistUserId: resolvedTherapistUserId,
      occupiedSlots: Array.from(occupied),
      availableSlots,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}