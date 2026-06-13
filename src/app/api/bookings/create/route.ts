import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { BookingService } from '@/lib/services/booking.service';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

async function getOrCreateUser(email: string, name: string, phone: string, country: string, supabase: any) {
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    const { data: profile } = await supabase.from('users').select('id').eq('id', existingUser.id).maybeSingle();
    if (!profile) {
      await supabase.from('users').insert({
        id: existingUser.id, email, role: 'client', full_name: name,
        phone: phone || null, country: country || null,
      });
    }
    return { userId: existingUser.id, isNew: false, needsLogin: true };
  }

  const tempPassword = `Temp${Date.now()}!${Math.random().toString(36).slice(2)}`;
  const firstName = name.split(' ')[0] || name;
  const lastName = name.split(' ').slice(1).join(' ') || '';

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email, password: tempPassword, email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, phone, country },
  });

  if (authError) {
    if (authError.message?.includes('already been registered')) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
      if (user) return { userId: user.id, isNew: false, needsLogin: true };
    }
    return { userId: null, isNew: false, needsLogin: false };
  }

  await supabase.from('users').insert({
    id: authData.user!.id, email, role: 'client', full_name: name,
    phone: phone || null, country: country || null,
  });

  return { userId: authData.user!.id, isNew: true, tempPassword, needsLogin: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId: clientUserId, name, email, phone, country,
      therapistId, therapistName, date, time, type,
      programId, sessionId, sessionNumber,
    } = body;

    if (!name || !email || !therapistId || !date || !time || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, therapistId, date, time, type' },
        { status: 400 }
      );
    }

    if (type !== 'free_consultation' && type !== 'program') {
      return NextResponse.json(
        { error: 'Invalid booking type. Must be free_consultation or program' },
        { status: 400 }
      );
    }

    const bookingType: 'free_consultation' | 'program' =
      type === 'program' || !!programId || !!sessionId ? 'program' : 'free_consultation';

    const supabase = getServiceSupabase();

    // Get or create user account
    let userId = clientUserId;
    let tempPassword = null;
    let isNewUser = false;

    if (!userId) {
      const userResult = await getOrCreateUser(email, name, phone, country, supabase);
      userId = userResult.userId;
      tempPassword = userResult.tempPassword;
      isNewUser = userResult.isNew;
    }

    // Check for existing free consultation
    if (bookingType === 'free_consultation') {
      if (userId) {
        const { data: existingBooking } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('user_id', userId)
          .eq('type', 'free_consultation')
          .neq('status', 'cancelled')
          .maybeSingle();

        if (existingBooking) {
          return NextResponse.json(
            { error: 'You already have a free consultation booked.' },
            { status: 409 }
          );
        }
      }

      const { data: existingByEmail } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('email', email)
        .eq('type', 'free_consultation')
        .neq('status', 'cancelled')
        .maybeSingle();

      if (existingByEmail) {
        return NextResponse.json(
          { error: 'A booking with this email already exists.' },
          { status: 409 }
        );
      }
    }

    // Check therapist availability
    const { data: conflict } = await supabase
      .from('bookings')
      .select('id')
      .eq('therapist_id', therapistId)
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (conflict) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another.' },
        { status: 409 }
      );
    }

    // Validate session order for program sessions
    if (bookingType === 'program' && programId && sessionNumber) {
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('session_number, status, date')
        .eq('program_id', programId)
        .eq('client_id', userId)
        .order('session_number', { ascending: true });

      const completedSessions = (allSessions ?? []).filter(s => s.status === 'completed');
      const expectedNextSession = completedSessions.length > 0
        ? completedSessions[completedSessions.length - 1].session_number + 1
        : 1;

      if (sessionNumber !== expectedNextSession) {
        return NextResponse.json(
          { error: `You can only schedule Session ${expectedNextSession}. Please schedule sessions in order.` },
          { status: 400 }
        );
      }

      const { data: existingScheduled } = await supabase
        .from('sessions')
        .select('id, status, date')
        .eq('program_id', programId)
        .eq('session_number', sessionNumber)
        .eq('client_id', userId)
        .maybeSingle();

      if (existingScheduled && existingScheduled.status === 'scheduled' && existingScheduled.date) {
        return NextResponse.json(
          { error: `Session ${sessionNumber} is already scheduled. You can reschedule it from your dashboard.` },
          { status: 409 }
        );
      }
    }

    // Create booking via central service
    const service = new BookingService();
    const result = await service.createBooking({
      userId,
      name,
      email,
      phone,
      country,
      therapistId,
      therapistName,
      date,
      time,
      type: bookingType,
      programId,
      sessionId,
      sessionNumber,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode ?? 500 });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: result.bookingId,
        meetLink: result.meetLink,
        date,
        time,
        therapistName,
      },
      user: userId ? {
        id: userId,
        email,
        isNewUser,
        tempPassword: tempPassword ?? null,
      } : null,
    });
  } catch (error) {
    console.error('[CreateBooking]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
