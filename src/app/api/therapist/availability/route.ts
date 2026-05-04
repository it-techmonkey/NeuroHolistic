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
      // Block entire day without relying on ON CONFLICT.
      // Some environments don't have a matching unique index for this tuple.
      const { data: existing, error: existingError } = await supabase
        .from('therapist_availability')
        .select('id')
        .eq('therapist_id', therapistId)
        .eq('exception_date', date)
        .eq('is_blocked', true)
        .eq('start_time', '00:00')
        .eq('end_time', '23:59')
        .maybeSingle();

      if (existingError) {
        return NextResponse.json({ error: existingError.message }, { status: 500 });
      }

      let data: any = null;
      let error: any = null;

      if (existing?.id) {
        ({ data, error } = await supabase
          .from('therapist_availability')
          .update({
            day_of_week: null,
            is_blocked: true,
          })
          .eq('id', existing.id)
          .eq('therapist_id', therapistId)
          .select());
      } else {
        ({ data, error } = await supabase
          .from('therapist_availability')
          .insert({
            therapist_id: therapistId,
            exception_date: date,
            day_of_week: null,
            start_time: '00:00',
            end_time: '23:59',
            is_blocked: true,
          })
          .select());
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === 'block_time_slot') {
      if (!date || !start_time || !end_time) {
        return NextResponse.json(
          { error: 'date, start_time, and end_time are required for block_time_slot.' },
          { status: 400 }
        );
      }
      const st = String(start_time).slice(0, 5);
      const et = String(end_time).slice(0, 5);
      if (st >= et) {
        return NextResponse.json({ error: 'end_time must be after start_time.' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('therapist_availability')
        .insert({
          therapist_id: therapistId,
          exception_date: date,
          day_of_week: null,
          start_time: st,
          end_time: et,
          is_blocked: true,
        })
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === 'update_block') {
      const id = body.id as string | undefined;
      if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from('therapist_availability')
        .select('id, exception_date, start_time, end_time')
        .eq('id', id)
        .eq('therapist_id', therapistId)
        .eq('is_blocked', true)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json({ error: 'Block not found.' }, { status: 404 });
      }

      const nextStart =
        body.start_time !== undefined
          ? String(body.start_time).slice(0, 5)
          : (existing.start_time?.slice(0, 5) ?? '00:00');
      const nextEnd =
        body.end_time !== undefined
          ? String(body.end_time).slice(0, 5)
          : (existing.end_time?.slice(0, 5) ?? '23:59');
      const nextDate =
        body.exception_date !== undefined ? body.exception_date : existing.exception_date;

      if (!nextDate) {
        return NextResponse.json({ error: 'exception_date required.' }, { status: 400 });
      }
      if (nextStart >= nextEnd) {
        return NextResponse.json({ error: 'end_time must be after start_time.' }, { status: 400 });
      }

      const updates = {
        exception_date: nextDate,
        start_time: nextStart,
        end_time: nextEnd,
      };

      const { data, error } = await supabase
        .from('therapist_availability')
        .update(updates)
        .eq('id', id)
        .eq('therapist_id', therapistId)
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

/** DELETE /api/therapist/availability?id=… — same as POST action delete */
export async function DELETE(request: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id query param required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from('therapist_availability')
      .delete()
      .eq('id', id)
      .eq('therapist_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Availability DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
