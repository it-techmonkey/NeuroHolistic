/**
 * Central BookingService — single source of truth for all booking/session operations.
 *
 * Every API route and dashboard calls this service instead of duplicating logic.
 * Handles: create, reschedule, cancel, complete, purchaseProgram, queries, availability.
 */

import { getServiceSupabase } from '@/lib/supabase/service';
import { createMeetEvent, updateMeetEvent } from '@/lib/meeting/google-meet';
import {
  notifyBookingConfirmed,
  notifyRescheduled,
  notifyCancelled,
  notifySessionCompleted,
  type NotificationBooking,
} from '@/lib/services/notification.service';
import { toDubaiDateTime, isUpcomingSession, isPastSession } from '@/lib/booking/session-flow';
import { resolveTherapistUserRow } from '@/lib/bookings/resolve-therapist-user';
import { generateSlug, therapistBookingsOrFilter } from '@/lib/bookings/therapist-scope';
import { generateHourlySlotStarts, defaultHourlyBookingSlots } from '@/lib/bookings/therapist-scope';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_RESCHEDULES = 2;
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@neuroholistic.com';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateBookingInput = {
  userId?: string | null;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  therapistId: string;
  therapistName?: string;
  date: string;
  time: string;
  type: 'free_consultation' | 'program';
  programId?: string | null;
  sessionId?: string | null;
  sessionNumber?: number | null;
};

export type BookingResult = {
  success: boolean;
  bookingId?: string;
  meetLink?: string;
  sessionNumber?: number;
  remainingSessions?: number;
  error?: string;
  statusCode?: number;
};

export type PurchaseProgramInput = {
  userId: string;
  programType: 'private' | 'group' | 'academy';
  therapistId?: string | null;
  therapistName?: string | null;
  totalSessions: number;
  amountAed: number;
  paymentId: string;
  clientName: string;
  clientEmail: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  paymentStatus?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function hourSlotBlocked(slotStartMin: number, blockStart: number, blockEnd: number): boolean {
  return slotStartMin < blockEnd && slotStartMin + 60 > blockStart;
}

function formatBookingDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function makeFallbackMeetLink(): string {
  const code = Math.random().toString(36).substring(2, 10).replace(/(.{3})/g, '$1-').slice(0, -1);
  return `https://meet.google.com/${code}`;
}

// ---------------------------------------------------------------------------
// BookingService
// ---------------------------------------------------------------------------

export class BookingService {
  private supabase = getServiceSupabase();

  // -----------------------------------------------------------------------
  // normalizeTherapistId — always resolve to UUID
  // -----------------------------------------------------------------------
  async normalizeTherapistId(rawId: string): Promise<{ id: string; fullName: string | null } | null> {
    const resolved = await resolveTherapistUserRow(this.supabase, rawId);
    return resolved ? { id: resolved.id, fullName: resolved.full_name } : null;
  }

  // -----------------------------------------------------------------------
  // createBooking — single implementation for all booking creation
  // -----------------------------------------------------------------------
  async createBooking(input: CreateBookingInput): Promise<BookingResult> {
    // 1. Resolve therapist to UUID
    const therapist = await this.normalizeTherapistId(input.therapistId);
    const therapistUserId = therapist?.id ?? null;
    const therapistName = input.therapistName || therapist?.fullName || 'Assigned Therapist';

    // 2. Create Google Meet link
    let meetLink = '';
    let calendarEventId = '';
    try {
      const startDateTime = `${input.date}T${input.time}:00`;
      const [hours, minutes] = input.time.split(':').map(Number);
      const endHours = Math.min(hours + 1, 23);
      const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const endDateTime = `${input.date}T${endTime}:00`;

      if (therapistUserId) {
        const result = await createMeetEvent({
          summary: `NeuroHolistic ${input.type === 'free_consultation' ? 'Free Consultation' : 'Session'}${input.sessionNumber ? ` #${input.sessionNumber}` : ''} - ${input.name}`,
          description: `${input.type === 'free_consultation' ? 'Free consultation' : 'Program session'} via NeuroHolistic platform`,
          startDateTime,
          endDateTime,
          attendeeEmails: [input.email],
          therapistId: therapistUserId,
        });
        meetLink = result.meetLink;
        calendarEventId = result.calendarEventId ?? '';
      }
    } catch (err) {
      console.error('[BookingService] Meet creation failed, using fallback:', err);
      meetLink = makeFallbackMeetLink();
    }

    // 3. Create booking record
    const { data: booking, error: bookingError } = await this.supabase
      .from('bookings')
      .insert({
        user_id: input.userId || null,
        name: input.name,
        email: input.email,
        phone: input.phone || '',
        country: input.country || '',
        therapist_id: therapistUserId || input.therapistId,
        therapist_user_id: therapistUserId,
        therapist_name: therapistName,
        date: input.date,
        time: input.time,
        type: input.type,
        program_id: input.programId || null,
        session_number: input.sessionNumber || null,
        meeting_link: meetLink || null,
        google_calendar_event_id: calendarEventId || null,
        status: 'confirmed',
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      console.error('[BookingService] Booking insert failed:', bookingError);
      return { success: false, error: 'Failed to create booking', statusCode: 500 };
    }

    // 4. Update or create session record
    if (input.sessionId) {
      // Update existing session (from purchase-program)
      await this.supabase
        .from('sessions')
        .update({
          booking_id: booking.id,
          date: input.date,
          time: input.time,
          date_time: toDubaiDateTime(input.date, input.time),
          meet_link: meetLink || null,
          therapist_id: therapistUserId,
          status: 'scheduled',
        })
        .eq('id', input.sessionId);
    } else if (input.type === 'program' && input.programId) {
      // Create new session record (from booking.service.ts path)
      const { error: sessionErr } = await this.supabase
        .from('sessions')
        .insert({
          program_id: input.programId,
          booking_id: booking.id,
          client_id: input.userId ?? null,
          therapist_id: therapistUserId,
          session_number: input.sessionNumber ?? null,
          date: input.date,
          time: input.time,
          date_time: toDubaiDateTime(input.date, input.time),
          meet_link: meetLink || null,
          status: 'scheduled',
        });

      if (sessionErr) {
        console.error('[BookingService] Session insert failed:', sessionErr);
      }

      // Update program used_sessions
      if (input.sessionNumber) {
        await this.supabase
          .from('programs')
          .update({ used_sessions: input.sessionNumber, updated_at: new Date().toISOString() })
          .eq('id', input.programId);
      }
    }

    // 5. Create therapist_clients assignment
    if (input.userId && therapistUserId) {
      const { data: existing } = await this.supabase
        .from('therapist_clients')
        .select('id')
        .eq('therapist_id', therapistUserId)
        .eq('client_id', input.userId)
        .maybeSingle();

      if (!existing) {
        await this.supabase.from('therapist_clients').insert({
          therapist_id: therapistUserId,
          client_id: input.userId,
        });
      }
    }

    // 6. Send notifications (client + therapist + admin)
    this.sendBookingNotifications(booking.id, input, therapistName, meetLink).catch((err) =>
      console.error('[BookingService] Notification error:', err)
    );

    return {
      success: true,
      bookingId: booking.id,
      meetLink,
      sessionNumber: input.sessionNumber ?? undefined,
    };
  }

  // -----------------------------------------------------------------------
  // rescheduleBooking — updates booking + session + calendar + notifications
  // -----------------------------------------------------------------------
  async rescheduleBooking(
    bookingId: string,
    userId: string,
    newDate: string,
    newTime: string
  ): Promise<BookingResult> {
    const { data: booking, error: fetchErr } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchErr || !booking) {
      return { success: false, error: 'Booking not found', statusCode: 404 };
    }

    if (booking.user_id !== userId) {
      return { success: false, error: 'Not authorized', statusCode: 403 };
    }

    if (booking.status !== 'confirmed' && booking.status !== 'scheduled') {
      return { success: false, error: `Cannot reschedule a booking with status "${booking.status}"`, statusCode: 409 };
    }

    if ((booking.reschedule_count ?? 0) >= MAX_RESCHEDULES) {
      return { success: false, error: `Maximum reschedule limit (${MAX_RESCHEDULES}) reached`, statusCode: 409 };
    }

    // Check conflict
    const { data: conflict } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('therapist_id', booking.therapist_id)
      .eq('date', newDate)
      .eq('time', newTime)
      .neq('status', 'cancelled')
      .neq('id', bookingId)
      .maybeSingle();

    if (conflict) {
      return { success: false, error: 'This time slot is no longer available', statusCode: 409 };
    }

    // Update Google Calendar
    let meetLink = booking.meeting_link;
    let calendarEventId = booking.google_calendar_event_id;

    if (calendarEventId && booking.therapist_user_id) {
      try {
        const result = await updateMeetEvent(calendarEventId, {
          startDateTime: `${newDate}T${newTime}:00`,
          endDateTime: `${newDate}T${String(Math.min(parseInt(newTime.split(':')[0], 10) + 1, 23)).padStart(2, '0')}:${newTime.split(':')[1]}:00`,
          therapistId: booking.therapist_user_id,
        });
        meetLink = result.meetLink;
      } catch (err) {
        console.error('[BookingService] Calendar update failed:', err);
        // Try creating new event
        try {
          const result = await createMeetEvent({
            summary: `NeuroHolistic — ${booking.type === 'free_consultation' ? 'Free Consultation' : 'Session'} (Rescheduled)`,
            description: `Session with ${booking.therapist_name}`,
            startDateTime: `${newDate}T${newTime}:00`,
            endDateTime: `${newDate}T${String(Math.min(parseInt(newTime.split(':')[0], 10) + 1, 23)).padStart(2, '0')}:${newTime.split(':')[1]}:00`,
            attendeeEmails: [booking.email],
            therapistId: booking.therapist_user_id,
          });
          meetLink = result.meetLink;
          calendarEventId = result.calendarEventId ?? calendarEventId;
        } catch (createErr) {
          console.error('[BookingService] Create new Meet event failed:', createErr);
        }
      }
    }

    // Update booking
    const { error: updateErr } = await this.supabase
      .from('bookings')
      .update({
        date: newDate,
        time: newTime,
        meeting_link: meetLink,
        google_calendar_event_id: calendarEventId,
        reschedule_count: (booking.reschedule_count ?? 0) + 1,
        rescheduled_from_date: booking.date,
        rescheduled_from_time: booking.time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateErr) {
      return { success: false, error: 'Failed to update booking', statusCode: 500 };
    }

    // Update linked session
    if (booking.program_id) {
      await this.supabase
        .from('sessions')
        .update({
          date: newDate,
          time: newTime,
          date_time: toDubaiDateTime(newDate, newTime),
          meet_link: meetLink,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId);
    }

    // Send reschedule notifications
    this.sendRescheduleNotifications(booking, newDate, newTime, meetLink).catch((err) =>
      console.error('[BookingService] Reschedule notification error:', err)
    );

    return { success: true, bookingId, meetLink: meetLink ?? undefined };
  }

  // -----------------------------------------------------------------------
  // cancelBooking — cancels booking + session + program count + notifications
  // -----------------------------------------------------------------------
  async cancelBooking(bookingId: string, userId: string): Promise<BookingResult> {
    const { data: booking, error: fetchErr } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchErr || !booking) {
      return { success: false, error: 'Booking not found', statusCode: 404 };
    }

    if (booking.user_id !== userId) {
      return { success: false, error: 'Not authorized', statusCode: 403 };
    }

    if (booking.status !== 'confirmed' && booking.status !== 'scheduled') {
      return { success: false, error: `Cannot cancel a booking with status "${booking.status}"`, statusCode: 409 };
    }

    // Cancel booking
    const { error: updateErr } = await this.supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateErr) {
      return { success: false, error: 'Failed to cancel booking', statusCode: 500 };
    }

    // Cancel linked session + decrement program
    if (booking.program_id) {
      await this.supabase
        .from('sessions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('booking_id', bookingId);

      const { data: program } = await this.supabase
        .from('programs')
        .select('used_sessions')
        .eq('id', booking.program_id)
        .maybeSingle();

      if (program && program.used_sessions > 0) {
        await this.supabase
          .from('programs')
          .update({ used_sessions: program.used_sessions - 1, updated_at: new Date().toISOString() })
          .eq('id', booking.program_id);
      }
    }

    // Send cancellation notifications
    this.sendCancelNotifications(booking).catch((err) =>
      console.error('[BookingService] Cancel notification error:', err)
    );

    return { success: true, bookingId };
  }

  // -----------------------------------------------------------------------
  // completeSession — marks session complete + booking complete + program count + notifications
  // -----------------------------------------------------------------------
  async completeSession(sessionId: string): Promise<BookingResult> {
    // Find session (try by id or booking_id)
    const { data: session } = await this.supabase
      .from('sessions')
      .select('*, programs!inner(user_id, therapist_user_id, therapist_name)')
      .or(`id.eq.${sessionId},booking_id.eq.${sessionId}`)
      .maybeSingle();

    // Also check if this is a free consultation booking
    const { data: booking } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    const isFreeConsultation = booking?.type === 'free_consultation';
    const isProgramSession = !!session?.program_id;

    // Validate required forms
    if (isFreeConsultation) {
      const clientId = booking?.user_id;
      const clientName = booking?.name;
      let assessment = null;

      if (clientId) {
        const { data } = await this.supabase
          .from('diagnostic_assessments')
          .select('id')
          .eq('client_id', clientId)
          .eq('status', 'submitted')
          .limit(1)
          .maybeSingle();
        assessment = data;
      }

      if (!assessment && clientName) {
        const { data } = await this.supabase
          .from('diagnostic_assessments')
          .select('id')
          .eq('client_name', clientName)
          .eq('status', 'submitted')
          .limit(1)
          .maybeSingle();
        assessment = data;
      }

      if (!assessment) {
        return {
          success: false,
          error: 'Diagnostic assessment required before completing free consultation',
          statusCode: 400,
        };
      }
    }

    if (session && isProgramSession && !session.development_form_submitted) {
      return {
        success: false,
        error: 'Development form required before completing program session',
        statusCode: 400,
      };
    }

    // Handle free consultation without session record
    if (!session && booking && isFreeConsultation) {
      const { error } = await this.supabase
        .from('bookings')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) {
        return { success: false, error: error.message, statusCode: 500 };
      }

      // Send completion notification
      this.sendSessionCompletedNotifications(booking).catch((err) =>
        console.error('[BookingService] Session completed notification error:', err)
      );

      return { success: true, bookingId: sessionId };
    }

    if (!session) {
      return { success: false, error: 'Session not found', statusCode: 404 };
    }

    if (session.status === 'completed') {
      return { success: true, bookingId: sessionId };
    }

    // Update session
    const { error: sessionUpdateErr } = await this.supabase
      .from('sessions')
      .update({ status: 'completed', is_complete: true, updated_at: new Date().toISOString() })
      .eq('id', session.id);

    if (sessionUpdateErr) {
      return { success: false, error: sessionUpdateErr.message, statusCode: 500 };
    }

    // Update linked booking
    if (session.booking_id) {
      await this.supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', session.booking_id);
    }

    // Update program counts
    if (session.program_id) {
      const { data: completedSessions } = await this.supabase
        .from('sessions')
        .select('id')
        .eq('program_id', session.program_id)
        .eq('status', 'completed');

      const sessionsCompleted = (completedSessions ?? []).length;

      await this.supabase
        .from('programs')
        .update({
          sessions_completed: sessionsCompleted,
          used_sessions: sessionsCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.program_id);
    }

    // Send completion notification
    if (booking) {
      this.sendSessionCompletedNotifications(booking).catch((err) =>
        console.error('[BookingService] Session completed notification error:', err)
      );
    }

    return { success: true, bookingId: sessionId };
  }

  // -----------------------------------------------------------------------
  // purchaseProgram — creates program + sessions (first scheduled if preferredDate)
  // -----------------------------------------------------------------------
  async purchaseProgram(input: PurchaseProgramInput): Promise<{ success: boolean; programId?: string; error?: string }> {
    // Check for existing active program
    const { data: existing } = await this.supabase
      .from('programs')
      .select('id')
      .eq('user_id', input.userId)
      .in('status', ['pending', 'active'])
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'You already have an active program' };
    }

    // Resolve therapist
    let resolvedTherapistId = input.therapistId ?? null;
    let resolvedTherapistName = input.therapistName ?? null;

    if (!resolvedTherapistId && resolvedTherapistName) {
      const resolved = await this.normalizeTherapistId(
        resolvedTherapistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      );
      resolvedTherapistId = resolved?.id ?? null;
      resolvedTherapistName = resolved?.fullName || resolvedTherapistName;
    }

    // Create program
    const { data: program, error: programError } = await this.supabase
      .from('programs')
      .insert({
        user_id: input.userId,
        therapist_user_id: resolvedTherapistId,
        therapist_name: resolvedTherapistName || 'Assigned Therapist',
        total_sessions: input.totalSessions,
        used_sessions: 0,
        sessions_completed: 0,
        status: 'active',
        payment_id: input.paymentId,
        program_type: input.programType,
        price_paid: input.amountAed,
        client_name: input.clientName,
        client_email: input.clientEmail,
        payment_status: input.paymentStatus || 'verified',
        payment_submitted_at: new Date().toISOString(),
        payment_verified_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (programError || !program) {
      console.error('[BookingService] Program creation failed:', programError);
      return { success: false, error: 'Failed to create program' };
    }

    // Create sessions — first one scheduled if preferredDate provided
    const sessions = Array.from({ length: input.totalSessions }, (_, i) => ({
      program_id: program.id,
      session_number: i + 1,
      client_id: input.userId,
      therapist_id: resolvedTherapistId,
      date: i === 0 && input.preferredDate ? input.preferredDate : null,
      time: i === 0 && input.preferredTime ? input.preferredTime : null,
      date_time: i === 0 && input.preferredDate && input.preferredTime
        ? toDubaiDateTime(input.preferredDate, input.preferredTime)
        : null,
      status: i === 0 && input.preferredDate && input.preferredTime ? 'scheduled' as const : 'pending' as const,
      is_complete: false,
      development_form_submitted: false,
      meet_link: null,
    }));

    const { error: sessionsError } = await this.supabase.from('sessions').insert(sessions);
    if (sessionsError) {
      console.error('[BookingService] Sessions creation failed:', sessionsError);
    }

    // Create initial booking for first session if preferred date provided
    if (input.preferredDate && input.preferredTime) {
      let meetLink = '';
      let calendarEventId = '';

      try {
        const startDateTime = `${input.preferredDate}T${input.preferredTime}:00`;
        const [hours, minutes] = input.preferredTime.split(':').map(Number);
        const endHours = Math.min(hours + 1, 23);
        const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const endDateTime = `${input.preferredDate}T${endTime}:00`;

        if (resolvedTherapistId) {
          const result = await createMeetEvent({
            summary: `NeuroHolistic Session #1 - ${input.clientName}`,
            description: 'Program session via NeuroHolistic platform',
            startDateTime,
            endDateTime,
            attendeeEmails: [input.clientEmail],
            therapistId: resolvedTherapistId,
          });
          meetLink = result.meetLink;
          calendarEventId = result.calendarEventId ?? '';

          // Update session with meet link
          await this.supabase
            .from('sessions')
            .update({ meet_link: meetLink, booking_id: null })
            .eq('program_id', program.id)
            .eq('session_number', 1);
        }
      } catch (err) {
        console.error('[BookingService] Meet creation for initial booking failed:', err);
        meetLink = makeFallbackMeetLink();
      }

      // Create booking record with session_number
      await this.supabase.from('bookings').insert({
        user_id: input.userId,
        name: input.clientName,
        email: input.clientEmail,
        phone: '',
        country: '',
        therapist_id: resolvedTherapistId || 'unknown',
        therapist_user_id: resolvedTherapistId,
        therapist_name: resolvedTherapistName || 'Assigned Therapist',
        date: input.preferredDate,
        time: input.preferredTime,
        type: 'program',
        status: 'scheduled',
        program_id: program.id,
        session_number: 1,
        meeting_link: meetLink || null,
        google_calendar_event_id: calendarEventId || null,
      });

      // Link session to booking
      const { data: createdBooking } = await this.supabase
        .from('bookings')
        .select('id')
        .eq('program_id', program.id)
        .eq('session_number', 1)
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (createdBooking) {
        await this.supabase
          .from('sessions')
          .update({ booking_id: createdBooking.id })
          .eq('program_id', program.id)
          .eq('session_number', 1);
      }

      // Create therapist_clients assignment
      if (resolvedTherapistId) {
        await this.supabase.from('therapist_clients').upsert(
          { therapist_id: resolvedTherapistId, client_id: input.userId, status: 'active' },
          { onConflict: 'therapist_id,client_id' }
        );
      }
    }

    // Assign therapist-client relationship
    if (resolvedTherapistId) {
      await this.supabase.from('therapist_clients').upsert(
        { therapist_id: resolvedTherapistId, client_id: input.userId, status: 'active' },
        { onConflict: 'therapist_id,client_id' }
      );
    }

    return { success: true, programId: program.id };
  }

  // -----------------------------------------------------------------------
  // getTherapistSessions — merged bookings+sessions for therapist dashboard
  // -----------------------------------------------------------------------
  async getTherapistSessions(therapistUserId: string, therapistFullName: string | null) {
    // 1. Fetch bookings
    let bookingsQuery = this.supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true });

    bookingsQuery = bookingsQuery.or(therapistBookingsOrFilter(therapistUserId, therapistFullName));

    const { data: bookings } = await bookingsQuery;

    // 2. Fetch sessions — match by UUID or by therapist name/slug
    let sessionsQuery = this.supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: true });

    const sessionFilters = [`therapist_id.eq.${therapistUserId}`];
    if (therapistFullName) {
      sessionFilters.push(`therapist_id.eq.${therapistFullName}`);
      sessionFilters.push(`therapist_id.eq.${generateSlug(therapistFullName)}`);
    }
    const { data: sessions } = await sessionsQuery.or(sessionFilters.join(','));

    // 3. Fetch client details
    const allClientIds = new Set<string>();
    (bookings ?? []).forEach((b) => { if (b.user_id) allClientIds.add(b.user_id); });
    (sessions ?? []).forEach((s) => { if (s.client_id) allClientIds.add(s.client_id); });

    let clientMap: Record<string, any> = {};
    if (allClientIds.size > 0) {
      const { data: clients } = await this.supabase
        .from('users')
        .select('id, full_name, email, phone, country')
        .in('id', Array.from(allClientIds));
      clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c]));
    }

    // 4. Fetch assessments
    const { data: assessments } = await this.supabase
      .from('diagnostic_assessments')
      .select('client_id, client_name, status')
      .eq('therapist_id', therapistUserId)
      .in('status', ['submitted', 'completed']);

    const assessedClientIds = new Set<string>();
    const assessedClientNames = new Set<string>();
    (assessments ?? []).forEach((a: any) => {
      if (a.client_id) assessedClientIds.add(a.client_id.toLowerCase().trim());
      if (a.client_name) assessedClientNames.add(a.client_name.toLowerCase().trim());
    });

    // 5. Combine bookings
    const combined: any[] = [];

    (bookings ?? []).forEach((booking) => {
      let hasAssessment = false;
      if (booking.user_id) hasAssessment = assessedClientIds.has(booking.user_id.toLowerCase().trim());
      if (!hasAssessment && booking.name) hasAssessment = assessedClientNames.has(booking.name.toLowerCase().trim());
      if (!hasAssessment && booking.user_id && clientMap[booking.user_id]?.full_name) {
        hasAssessment = assessedClientNames.has(clientMap[booking.user_id].full_name.toLowerCase().trim());
      }

      combined.push({
        id: booking.id,
        source: 'booking',
        client_id: booking.user_id,
        client_name: booking.name,
        clients: booking.user_id ? clientMap[booking.user_id] : null,
        date: booking.date,
        time: booking.time,
        type: booking.type,
        status: booking.status,
        session_number: booking.session_number,
        meet_link: booking.meeting_link || booking.meet_link,
        meeting_link: booking.meeting_link || booking.meet_link,
        program_id: booking.program_id,
        development_form_submitted: false,
        assessment_submitted: hasAssessment,
        is_complete: booking.status === 'completed',
        reschedule_count: booking.reschedule_count ?? 0,
        created_at: booking.created_at,
      });
    });

    // 6. Merge sessions with bookings
    (sessions ?? []).forEach((session) => {
      const existingIndex = combined.findIndex((s) => s.id === session.booking_id);
      if (existingIndex >= 0) {
        combined[existingIndex] = {
          ...combined[existingIndex],
          development_form_submitted: session.development_form_submitted ?? false,
          is_complete: session.is_complete ?? false,
          session_status: session.status,
        };
      } else if (session.status !== 'pending') {
        combined.push({
          id: session.id,
          source: 'session',
          client_id: session.client_id,
          client_name: clientMap[session.client_id]?.full_name || 'Client',
          clients: session.client_id ? clientMap[session.client_id] : null,
          date: session.date,
          time: session.time,
          type: 'program_session',
          status: session.status,
          session_number: session.session_number,
          meet_link: session.meet_link,
          meeting_link: session.meet_link,
          program_id: session.program_id,
          development_form_submitted: session.development_form_submitted ?? false,
          is_complete: session.is_complete ?? false,
          reschedule_count: 0,
          created_at: session.created_at,
        });
      }
    });

    // 7. Filter to scheduled only (has date+time)
    const scheduled = combined.filter((s) => s.date && s.time);

    // 8. Dedup free consultations (keep latest per client)
    const freeBestByKey = new Map<string, any>();
    for (const s of scheduled) {
      if (s.type !== 'free_consultation') continue;
      const key = s.client_id || s.id;
      const prev = freeBestByKey.get(key);
      const t = new Date(`${s.date}T${s.time || '00:00'}`).getTime();
      const pt = prev ? new Date(`${prev.date}T${prev.time || '00:00'}`).getTime() : -1;
      if (!prev || t >= pt) freeBestByKey.set(key, s);
    }
    const keepFreeIds = new Set([...freeBestByKey.values()].map((s) => s.id));

    const deduped = scheduled.filter((s) => {
      if (s.type !== 'free_consultation') return true;
      return keepFreeIds.has(s.id);
    });

    deduped.sort((a, b) => new Date(a.date || '9999-12-31').getTime() - new Date(b.date || '9999-12-31').getTime());

    return deduped;
  }

  // -----------------------------------------------------------------------
  // getClientSessions — upcoming+past+pending for client dashboard
  // -----------------------------------------------------------------------
  async getClientSessions(clientId: string) {
    // Fetch all bookings
    let { data: bookings } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('user_id', clientId)
      .order('date', { ascending: false });

    // Fallback by email
    if ((!bookings || bookings.length === 0)) {
      const { data: user } = await this.supabase.from('users').select('email').eq('id', clientId).maybeSingle();
      if (user?.email) {
        const { data: emailBookings } = await this.supabase
          .from('bookings')
          .select('*')
          .eq('email', user.email.toLowerCase())
          .order('date', { ascending: false });
        bookings = emailBookings;
      }
    }

    // Upcoming: confirmed/scheduled and in the future (Dubai timezone)
    const upcoming = (bookings ?? []).filter((b) => {
      if (b.status !== 'confirmed' && b.status !== 'scheduled') return false;
      return isUpcomingSession({ date: b.date, time: b.time });
    });

    // Past: completed, cancelled, or in the past (Dubai timezone)
    const past = (bookings ?? []).filter((b) => {
      if (b.status === 'completed' || b.status === 'cancelled') return true;
      return isPastSession({ date: b.date, time: b.time });
    });

    // Pending sessions
    const { data: pendingSessions } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .order('session_number', { ascending: true });

    // Build booking->session mapping
    const { data: allSessions } = await this.supabase
      .from('sessions')
      .select('id, booking_id, session_number, status')
      .eq('client_id', clientId);

    const bookingToSessionMap = new Map<string, string>();
    const completedSessionIds = new Set<string>();

    (allSessions ?? []).forEach((s: any) => {
      if (s.booking_id && s.id) bookingToSessionMap.set(s.booking_id, s.id);
      if (s.status === 'completed' && s.id) completedSessionIds.add(s.id);
    });

    const addSessionId = (booking: any) => ({
      ...booking,
      session_id: bookingToSessionMap.get(booking.id) || null,
    });

    return {
      upcomingSessions: upcoming.map(addSessionId),
      pastSessions: past.map(addSessionId),
      pendingSessions: pendingSessions ?? [],
      completedSessionIds: Array.from(completedSessionIds),
    };
  }

  // -----------------------------------------------------------------------
  // getAvailableSlots — single slot generation
  // -----------------------------------------------------------------------
  async getAvailableSlots(
    rawTherapistId: string,
    date: string
  ): Promise<{ time: string; display: string }[]> {
    const resolved = await resolveTherapistUserRow(this.supabase, rawTherapistId);

    // Check for full-day block
    if (resolved) {
      const { data: blockRows } = await this.supabase
        .from('therapist_availability')
        .select('start_time, end_time')
        .eq('therapist_id', resolved.id)
        .eq('exception_date', date)
        .eq('is_blocked', true);

      for (const b of blockRows ?? []) {
        const bs = b.start_time ?? '00:00';
        const be = b.end_time ?? '23:59';
        if (bs === '00:00' && (be === '23:59' || be === '24:00')) {
          return [];
        }
      }
    }

    // Generate base slots from availability
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
    const allSlotsSet = new Set<string>();

    if (resolved) {
      const { data: availRows } = await this.supabase
        .from('therapist_availability')
        .select('start_time, end_time, day_of_week, exception_date')
        .eq('therapist_id', resolved.id)
        .eq('is_blocked', false)
        .or(`day_of_week.eq.${dayOfWeek},exception_date.eq.${date}`);

      const windows = (availRows ?? []).filter((row) => {
        if (row.exception_date === date) return true;
        if (row.day_of_week === dayOfWeek && !row.exception_date) return true;
        return false;
      });

      if (windows.length > 0) {
        for (const w of windows) {
          generateHourlySlotStarts(w.start_time ?? '09:00', w.end_time ?? '17:00').forEach((t) => allSlotsSet.add(t));
        }
      } else {
        defaultHourlyBookingSlots().forEach((t) => allSlotsSet.add(t));
      }
    } else {
      defaultHourlyBookingSlots().forEach((t) => allSlotsSet.add(t));
    }

    let allSlots = Array.from(allSlotsSet).sort((a, b) => a.localeCompare(b));

    // Remove slots overlapping partial-day blocks
    if (resolved) {
      const { data: partialBlocks } = await this.supabase
        .from('therapist_availability')
        .select('start_time, end_time')
        .eq('therapist_id', resolved.id)
        .eq('exception_date', date)
        .eq('is_blocked', true);

      for (const b of partialBlocks ?? []) {
        const bs = parseTimeToMinutes(b.start_time ?? '00:00');
        const be = parseTimeToMinutes(b.end_time ?? '23:59');
        allSlots = allSlots.filter((slot) => !hourSlotBlocked(parseTimeToMinutes(slot), bs, be));
      }
    }

    // Remove booked slots
    const bookedTimes = new Set<string>();

    if (resolved) {
      const orBook = therapistBookingsOrFilter(resolved.id, resolved.full_name, rawTherapistId);

      const { data: bookingRows } = await this.supabase
        .from('bookings')
        .select('time')
        .eq('date', date)
        .neq('status', 'cancelled')
        .or(orBook);

      const { data: sessionRows } = await this.supabase
        .from('sessions')
        .select('time')
        .eq('date', date)
        .neq('status', 'cancelled')
        .eq('therapist_id', resolved.id);

      for (const b of bookingRows ?? []) {
        if (b.time) bookedTimes.add(b.time.slice(0, 5));
      }
      for (const s of sessionRows ?? []) {
        if (s.time) bookedTimes.add(s.time.slice(0, 5));
      }
    } else {
      const { data: bookingRows } = await this.supabase
        .from('bookings')
        .select('time')
        .eq('date', date)
        .neq('status', 'cancelled')
        .eq('therapist_id', rawTherapistId);

      for (const b of bookingRows ?? []) {
        if (b.time) bookedTimes.add(b.time.slice(0, 5));
      }
    }

    let availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    // Remove past slots for today
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      availableSlots = availableSlots.filter((slot) => parseTimeToMinutes(slot) >= currentMinutes + 60);
    }

    return availableSlots.map((time) => ({
      time,
      display: formatTimeDisplay(time),
    }));
  }

  // -----------------------------------------------------------------------
  // Private notification helpers
  // -----------------------------------------------------------------------

  private async sendBookingNotifications(
    bookingId: string,
    input: CreateBookingInput,
    therapistName: string,
    meetLink: string
  ) {
    const formattedDate = new Date(`${input.date}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const hr = parseInt(input.time.split(':')[0], 10);
    const min = input.time.split(':')[1];
    const formattedTime = `${hr % 12 || 12}:${min} ${hr >= 12 ? 'PM' : 'AM'}`;

    // Get therapist email
    let therapistEmail: string | null = null;
    if (input.therapistId && UUID_REGEX.test(input.therapistId)) {
      const { data: tUser } = await this.supabase
        .from('users')
        .select('email')
        .eq('id', input.therapistId)
        .maybeSingle();
      therapistEmail = tUser?.email ?? null;
    }

    const booking: NotificationBooking = {
      id: bookingId,
      clientName: input.name,
      clientEmail: input.email,
      clientPhone: input.phone,
      therapistName,
      therapistEmail,
      sessionDate: formattedDate,
      sessionTime: formattedTime,
      meetingLink: meetLink || null,
      sessionNumber: input.sessionNumber ?? undefined,
      type: input.type,
    };

    await notifyBookingConfirmed(booking);
  }

  private async sendRescheduleNotifications(
    booking: any,
    newDate: string,
    newTime: string,
    meetLink: string | null
  ) {
    const formattedDate = new Date(`${newDate}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const hr = parseInt(newTime.split(':')[0], 10);
    const min = newTime.split(':')[1];
    const formattedTime = `${hr % 12 || 12}:${min} ${hr >= 12 ? 'PM' : 'AM'}`;

    let therapistEmail: string | null = null;
    if (booking.therapist_user_id) {
      const { data: tUser } = await this.supabase
        .from('users')
        .select('email')
        .eq('id', booking.therapist_user_id)
        .maybeSingle();
      therapistEmail = tUser?.email ?? null;
    }

    const notifBooking: NotificationBooking = {
      id: booking.id,
      clientName: booking.name,
      clientEmail: booking.email,
      clientPhone: booking.phone,
      therapistName: booking.therapist_name,
      therapistEmail,
      sessionDate: formattedDate,
      sessionTime: formattedTime,
      meetingLink: meetLink,
      sessionNumber: booking.session_number,
      type: booking.type,
    };

    await notifyRescheduled(notifBooking);
  }

  private async sendCancelNotifications(booking: any) {
    const formattedDate = new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const hr = parseInt(booking.time.split(':')[0], 10);
    const min = booking.time.split(':')[1];
    const formattedTime = `${hr % 12 || 12}:${min} ${hr >= 12 ? 'PM' : 'AM'}`;

    let therapistEmail: string | null = null;
    if (booking.therapist_user_id) {
      const { data: tUser } = await this.supabase
        .from('users')
        .select('email')
        .eq('id', booking.therapist_user_id)
        .maybeSingle();
      therapistEmail = tUser?.email ?? null;
    }

    const notifBooking: NotificationBooking = {
      id: booking.id,
      clientName: booking.name,
      clientEmail: booking.email,
      clientPhone: booking.phone,
      therapistName: booking.therapist_name,
      therapistEmail,
      sessionDate: formattedDate,
      sessionTime: formattedTime,
      meetingLink: booking.meeting_link,
      sessionNumber: booking.session_number,
      type: booking.type,
    };

    await notifyCancelled(notifBooking);
  }

  private async sendSessionCompletedNotifications(booking: any) {
    const formattedDate = new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const hr = parseInt(booking.time.split(':')[0], 10);
    const min = booking.time.split(':')[1];
    const formattedTime = `${hr % 12 || 12}:${min} ${hr >= 12 ? 'PM' : 'AM'}`;

    let therapistEmail: string | null = null;
    if (booking.therapist_user_id) {
      const { data: tUser } = await this.supabase
        .from('users')
        .select('email')
        .eq('id', booking.therapist_user_id)
        .maybeSingle();
      therapistEmail = tUser?.email ?? null;
    }

    const notifBooking: NotificationBooking = {
      id: booking.id,
      clientName: booking.name,
      clientEmail: booking.email,
      clientPhone: booking.phone,
      therapistName: booking.therapist_name || 'Your Therapist',
      therapistEmail,
      sessionDate: formattedDate,
      sessionTime: formattedTime,
      meetingLink: booking.meeting_link,
      sessionNumber: booking.session_number,
      type: booking.type,
    };

    await notifySessionCompleted(notifBooking);
  }
}

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}
