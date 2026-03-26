import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

// GET - Fetch therapist's availability and unavailability
export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const therapistId = request.nextUrl.searchParams.get('therapistId') || user.id;

    const { data: availability, error } = await supabase
      .from('therapist_availability')
      .select('*')
      .eq('therapist_id', therapistId)
      .order('day_of_week', { ascending: true })
      .order('exception_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Separate into recurring availability and blocked times
    const recurring = (availability ?? []).filter(a => a.day_of_week !== null && !a.is_blocked);
    const blockedSlots = (availability ?? []).filter(a => a.is_blocked);

    return NextResponse.json({
      availability: availability ?? [],
      recurring,
      blockedSlots,
    });
  } catch (error) {
    console.error('[Availability GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Set availability or block time
export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, day_of_week, date, start_time, end_time, is_blocked, recurring_days } = body;

    const supabase = getServiceSupabase();
    const therapistId = user.id;

    if (action === 'set_recurring' && recurring_days) {
      // Set recurring weekly availability
      const records = recurring_days.map((day: number) => ({
        therapist_id: therapistId,
        day_of_week: day,
        start_time: start_time || '09:00',
        end_time: end_time || '17:00',
        is_blocked: false,
        exception_date: null,
      }));

      // Delete existing recurring availability for these days
      await supabase
        .from('therapist_availability')
        .delete()
        .eq('therapist_id', therapistId)
        .in('day_of_week', recurring_days)
        .is('exception_date', null)
        .eq('is_blocked', false);

      const { data, error } = await supabase
        .from('therapist_availability')
        .insert(records)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === 'block_full_day') {
      // Block entire day
      const { data, error } = await supabase
        .from('therapist_availability')
        .upsert({
          therapist_id: therapistId,
          exception_date: date,
          day_of_week: null,
          start_time: '00:00',
          end_time: '23:59',
          is_blocked: true,
        }, {
          onConflict: 'therapist_id,exception_date,start_time,end_time'
        })
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === 'block_time_slot') {
      // Block specific time slot
      const { data, error } = await supabase
        .from('therapist_availability')
        .insert({
          therapist_id: therapistId,
          exception_date: date,
          day_of_week: null,
          start_time: start_time,
          end_time: end_time,
          is_blocked: true,
        })
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('therapist_availability')
        .delete()
        .eq('id', body.id)
        .eq('therapist_id', therapistId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Availability POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
