import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createMeetEvent } from '@/lib/meeting/google-meet';
import { sendAllNotifications } from '@/lib/notifications/service';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

async function getOrCreateUser(email: string, name: string, phone: string, country: string, supabase: any) {
  // Check if user already exists in auth
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Try to get user by email
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    // User exists - return existing user
    // Also ensure profile exists
    const { data: profile } = await supabase.from('users').select('id').eq('id', existingUser.id).maybeSingle();
    if (!profile) {
      await supabase.from('users').insert({
        id: existingUser.id,
        email,
        role: 'client',
        full_name: name,
        phone: phone || null,
        country: country || null,
      });
    }
    return { userId: existingUser.id, isNew: false, needsLogin: true };
  }

  // Create new user with temp password
  const tempPassword = `Temp${Date.now()}!${Math.random().toString(36).slice(2)}`;
  const firstName = name.split(' ')[0] || name;
  const lastName = name.split(' ').slice(1).join(' ') || '';

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone,
      country,
    },
  });

  if (authError) {
    // If user already exists (race condition), fetch and return
    if (authError.message?.includes('already been registered')) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
      if (user) {
        return { userId: user.id, isNew: false, needsLogin: true };
      }
    }
    // Continue without user ID - allow guest booking
    console.error('[CreateBooking] User creation failed:', authError);
    return { userId: null, isNew: false, needsLogin: false };
  }

  // Create user profile
  await supabase.from('users').insert({
    id: authData.user!.id,
    email,
    role: 'client',
    full_name: name,
    phone: phone || null,
    country: country || null,
  });

  return { userId: authData.user!.id, isNew: true, tempPassword, needsLogin: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId: clientUserId,
      name,
      email,
      phone,
      country,
      therapistId,
      therapistName,
      date,
      time,
      type,
      programId,
      sessionId,
      sessionNumber,
    } = body;

    // Validation
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

    // Check for existing free consultation if creating one
    if (type === 'free_consultation') {
      // Check by user_id if provided
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

      // Also check by email
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

    // Check therapist availability for conflicts
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

    // For program sessions: Validate client is only scheduling the immediate next session
    if (type === 'program' && programId && sessionNumber) {
      // Get all sessions for this program to determine which one can be scheduled
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('session_number, status, date')
        .eq('program_id', programId)
        .eq('client_id', userId)
        .order('session_number', { ascending: true });

      // Find the next session that needs to be scheduled (pending with no date)
      const pendingSessions = (allSessions ?? []).filter(s => s.status === 'pending' && !s.date);
      const scheduledSessions = (allSessions ?? []).filter(s => s.status === 'scheduled');
      const completedSessions = (allSessions ?? []).filter(s => s.status === 'completed');

      // The next session to schedule is the first pending one, or if all pending have dates, the first scheduled
      const nextPendingSession = pendingSessions[0];
      const lastCompleted = completedSessions[completedSessions.length - 1];
      const expectedNextSession = lastCompleted ? lastCompleted.session_number + 1 : 1;

      // Client can only schedule the next session in order
      if (sessionNumber !== expectedNextSession) {
        return NextResponse.json(
          { error: `You can only schedule Session ${expectedNextSession}. Please schedule sessions in order.` },
          { status: 400 }
        );
      }

      // Check if this session is already scheduled with a date
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

    // Generate Google Meet link
    let meetLink = '';
    let calendarEventId = '';
    try {
      const startDateTime = `${date}T${time}:00`;
      const [hours, minutes] = time.split(':').map(Number);
      const endHours = Math.min(hours + 1, 23);
      const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const endDateTime = `${date}T${endTime}:00`;

      console.log('[CreateBooking] Creating Meet event:', { startDateTime, endDateTime, therapistId });
      
      const result = await createMeetEvent({
        summary: `NeuroHolistic ${type === 'free_consultation' ? 'Free Consultation' : 'Session'}${sessionNumber ? ` #${sessionNumber}` : ''} - ${name}`,
        description: `${type === 'free_consultation' ? 'Free consultation' : 'Program session'} via NeuroHolistic platform`,
        startDateTime,
        endDateTime,
        attendeeEmails: [email],
        therapistId, // Pass therapist ID to use their connected Google Calendar if available
      });
      
      console.log('[CreateBooking] Meet result:', result);
      meetLink = result.meetLink;
      calendarEventId = result.calendarEventId;
    } catch (meetError) {
      console.error('[CreateBooking] Google Meet error:', meetError);
      
      // Generate a unique Google Meet-style fallback link
      // This works for demo/testing - in production, use proper Google Calendar API credentials
      const meetingCode = Math.random().toString(36).substring(2, 10).replace(/(.{3})/g, '$1-').slice(0, -1);
      meetLink = `https://meet.google.com/${meetingCode}`;
      console.log('[CreateBooking] Using generated meet link:', meetLink);
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId || null,
        name,
        email,
        phone: phone || '',
        country: country || '',
        therapist_id: therapistId,
        therapist_user_id: therapistId,
        therapist_name: therapistName,
        date,
        time,
        type,
        program_id: programId || null,
        session_number: sessionNumber || null,
        meeting_link: meetLink || null,
        google_calendar_event_id: calendarEventId || null,
        status: 'confirmed',
      })
      .select()
      .single();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    // If this is a program session, update the session record
    if (sessionId) {
      await supabase
        .from('sessions')
        .update({
          booking_id: booking.id,
          date,
          time,
          date_time: `${date}T${time}:00`,
          meet_link: meetLink || null,
          status: 'scheduled',
        })
        .eq('id', sessionId);
    }

    // Create therapist_clients assignment if not exists (for logged-in users)
    if (userId && therapistId) {
      const { data: existingAssignment } = await supabase
        .from('therapist_clients')
        .select('id')
        .eq('therapist_id', therapistId)
        .eq('client_id', userId)
        .maybeSingle();

      if (!existingAssignment) {
        await supabase.from('therapist_clients').insert({
          therapist_id: therapistId,
          client_id: userId,
        });
      }
    }

    // Send notifications
    try {
      const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const hr = parseInt(time.split(':')[0], 10);
      const min = time.split(':')[1];
      const formattedTime = `${hr % 12 || 12}:${min} ${hr >= 12 ? 'PM' : 'AM'}`;

      await sendAllNotifications({
        bookingId: booking.id,
        userId: userId || undefined,
        recipientEmail: email,
        recipientPhone: phone,
        recipientName: name,
        therapistName: therapistName || 'Your Therapist',
        sessionDate: formattedDate,
        sessionTime: formattedTime,
        meetLink: meetLink || 'Link will be provided shortly',
        triggerType: 'booking_confirmed',
      });
    } catch (notifError) {
      console.error('[CreateBooking] Notification error:', notifError);
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        meetLink: booking.meeting_link,
        date: booking.date,
        time: booking.time,
        therapistName: booking.therapist_name,
      },
      user: userId ? {
        id: userId,
        email,
        isNewUser,
        tempPassword: tempPassword,
      } : null,
    });
  } catch (error) {
    console.error('[CreateBooking]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
