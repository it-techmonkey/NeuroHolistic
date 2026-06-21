import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { BookingService } from '@/lib/services/booking.service';
import { notifyBookingConfirmed, type NotificationBooking } from '@/lib/services/notification.service';

const BOOKING_TIME_SLOTS = ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'] as const;

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientUserId,
      therapistUserId,
      date,
      time,
      sessionType,
      programId,
      sessionNumber,
      paymentStatus,
      amountAed,
      adminNotes,
      createNewProgram,
      totalSessions,
      programType,
    } = body;

    if (!clientUserId || !therapistUserId || !date || !time || !sessionType) {
      return NextResponse.json(
        { error: 'Missing required fields: clientUserId, therapistUserId, date, time, sessionType' },
        { status: 400 }
      );
    }

    if (sessionType !== 'free_consultation' && sessionType !== 'program') {
      return NextResponse.json(
        { error: 'Invalid sessionType. Must be free_consultation or program' },
        { status: 400 }
      );
    }

    if (!BOOKING_TIME_SLOTS.includes(time)) {
      return NextResponse.json(
        { error: 'Invalid time slot' },
        { status: 400 }
      );
    }

    if (!paymentStatus || !['free', 'paid', 'pending'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid paymentStatus. Must be free, paid, or pending' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Validate client exists
    const { data: client, error: clientErr } = await supabase
      .from('users')
      .select('id, full_name, email, phone, country, role')
      .eq('id', clientUserId)
      .maybeSingle();

    if (clientErr || !client || client.role !== 'client') {
      return NextResponse.json(
        { error: 'Client not found or not a registered client' },
        { status: 404 }
      );
    }

    // Validate therapist exists
    const { data: therapist, error: therapistErr } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('id', therapistUserId)
      .maybeSingle();

    if (therapistErr || !therapist || therapist.role !== 'therapist') {
      return NextResponse.json(
        { error: 'Therapist not found' },
        { status: 404 }
      );
    }

    // Check therapist availability (no conflicting bookings)
    const { data: conflict } = await supabase
      .from('bookings')
      .select('id')
      .eq('therapist_id', therapistUserId)
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (conflict) {
      return NextResponse.json(
        { error: 'This time slot is already booked for this therapist' },
        { status: 409 }
      );
    }

    // Free consultation: check client doesn't already have one
    if (sessionType === 'free_consultation') {
      const { data: existingConsultation } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('user_id', clientUserId)
        .eq('type', 'free_consultation')
        .neq('status', 'cancelled')
        .maybeSingle();

      if (existingConsultation) {
        return NextResponse.json(
          { error: 'Client already has a free consultation booked' },
          { status: 409 }
        );
      }
    }

    // Program session: validate or create program
    let resolvedProgramId = programId;
    let resolvedSessionNumber = sessionNumber;

    if (sessionType === 'program') {
      // If creating a new program
      if (createNewProgram) {
        if (!totalSessions || totalSessions < 1) {
          return NextResponse.json(
            { error: 'totalSessions is required when creating a new program' },
            { status: 400 }
          );
        }

        // Create the program
        const adminPaymentId = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { data: newProgram, error: programErr } = await supabase
          .from('programs')
          .insert({
            user_id: clientUserId,
            therapist_user_id: therapistUserId,
            therapist_name: therapist.full_name || 'Therapist',
            total_sessions: totalSessions,
            used_sessions: 0,
            sessions_completed: 0,
            status: 'active',
            payment_id: adminPaymentId,
            program_type: programType || 'private',
            client_name: client.full_name || 'Client',
            client_email: client.email,
            payment_status: paymentStatus === 'paid' ? 'verified' : paymentStatus === 'pending' ? 'pending_verification' : 'verified',
            price_paid: amountAed || null,
            admin_notes: adminNotes || null,
          })
          .select('id')
          .single();

        if (programErr || !newProgram) {
          console.error('[AdminBookingCreate] Program creation failed:', programErr);
          return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
        }

        resolvedProgramId = newProgram.id;
        resolvedSessionNumber = 1;
      } else {
        // Using existing program
        if (!programId || !sessionNumber) {
          return NextResponse.json(
            { error: 'programId and sessionNumber are required for existing program sessions' },
            { status: 400 }
          );
        }

        // Validate program belongs to client
        const { data: program } = await supabase
          .from('programs')
          .select('id, total_sessions, status')
          .eq('id', programId)
          .eq('user_id', clientUserId)
          .maybeSingle();

        if (!program) {
          return NextResponse.json(
            { error: 'Program not found for this client' },
            { status: 404 }
          );
        }

        if (program.status === 'completed' || program.status === 'cancelled') {
          return NextResponse.json(
            { error: 'Program is not active' },
            { status: 400 }
          );
        }

        // Check session number is valid
        const { data: existingSession } = await supabase
          .from('sessions')
          .select('id, status, date')
          .eq('program_id', programId)
          .eq('session_number', sessionNumber)
          .eq('client_id', clientUserId)
          .maybeSingle();

        if (existingSession && existingSession.status === 'scheduled' && existingSession.date) {
          return NextResponse.json(
            { error: `Session ${sessionNumber} is already scheduled` },
            { status: 409 }
          );
        }
      }
    }

    // Create booking via central service
    const service = new BookingService();
    const result = await service.createBooking({
      userId: clientUserId,
      name: client.full_name || 'Client',
      email: client.email,
      phone: client.phone || '',
      country: client.country || '',
      therapistId: therapistUserId,
      therapistName: therapist.full_name || 'Therapist',
      date,
      time,
      type: sessionType,
      programId: resolvedProgramId || null,
      sessionNumber: resolvedSessionNumber || null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode ?? 500 });
    }

    // Create payment record if paid
    if (paymentStatus === 'paid' && amountAed && amountAed > 0) {
      await supabase.from('payments').insert({
        user_id: clientUserId,
        amount: amountAed,
        currency: 'AED',
        type: sessionType === 'program' ? 'full_program' : 'single_session',
        status: 'paid',
        payment_reference: `admin-${Date.now()}`,
        program_id: resolvedProgramId || null,
        metadata: {
          bookedBy: 'admin',
          adminUserId: user.id,
          adminNotes: adminNotes || null,
        },
      });
    }

    // If admin notes, store on program if applicable
    if (adminNotes && resolvedProgramId) {
      await supabase
        .from('programs')
        .update({ admin_notes: adminNotes })
        .eq('id', resolvedProgramId);
    }

    // Send notifications to client + therapist
    const therapistEmail = therapist.email;
    const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const hr = parseInt(time.split(':')[0], 10);
    const min = time.split(':')[1];
    const formattedTime = `${hr % 12 || 12}:${min} ${hr >= 12 ? 'PM' : 'AM'}`;

    const notificationBooking: NotificationBooking = {
      id: result.bookingId!,
      clientName: client.full_name || 'Client',
      clientEmail: client.email,
      clientPhone: client.phone,
      therapistName: therapist.full_name || 'Therapist',
      therapistEmail,
      sessionDate: formattedDate,
      sessionTime: formattedTime,
      meetingLink: result.meetLink || null,
      sessionNumber: resolvedSessionNumber ?? undefined,
      type: sessionType,
    };

    notifyBookingConfirmed(notificationBooking).catch((err) =>
      console.error('[AdminBookingCreate] Notification error:', err)
    );

    return NextResponse.json({
      success: true,
      booking: {
        id: result.bookingId,
        meetLink: result.meetLink,
        date,
        time,
        therapistName: therapist.full_name,
        clientName: client.full_name,
      },
      programId: resolvedProgramId || null,
    });
  } catch (error) {
    console.error('[AdminBookingCreate]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
