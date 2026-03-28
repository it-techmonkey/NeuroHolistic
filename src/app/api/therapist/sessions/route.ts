import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'therapist' && userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabase();
    const status = request.nextUrl.searchParams.get('status');

    // Get all bookings for this therapist
    let bookingsQuery = supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true });

    if (userData?.role === 'therapist') {
      bookingsQuery = bookingsQuery.or(`therapist_user_id.eq.${user.id},therapist_id.eq.${user.id}`);
    }

    if (status) {
      bookingsQuery = bookingsQuery.eq('status', status);
    }

    const { data: bookings } = await bookingsQuery;

    // Also get sessions from sessions table
    let sessionsQuery = supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: true });

    if (userData?.role === 'therapist') {
      sessionsQuery = sessionsQuery.eq('therapist_id', user.id);
    }

    const { data: sessions } = await sessionsQuery;

    // Get all client IDs to fetch client details
    const allClientIds = new Set<string>();
    (bookings ?? []).forEach(b => { if (b.user_id) allClientIds.add(b.user_id); });
    (sessions ?? []).forEach(s => { if (s.client_id) allClientIds.add(s.client_id); });

    let clientMap: Record<string, any> = {};
    if (allClientIds.size > 0) {
      const { data: clients } = await supabase
        .from('users')
        .select('id, full_name, email, phone, country')
        .in('id', Array.from(allClientIds));
      
      clientMap = Object.fromEntries((clients ?? []).map(c => [c.id, c]));
    }

    // Combine bookings and sessions, avoiding duplicates
    const combinedSessions: any[] = [];

    // Add bookings
    (bookings ?? []).forEach(booking => {
      combinedSessions.push({
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
        meet_link: booking.meeting_link || booking.meeting_link,
        meeting_link: booking.meeting_link,
        program_id: booking.program_id,
        development_form_submitted: false,
        is_complete: booking.status === 'completed',
        reschedule_count: booking.reschedule_count ?? 0,
        created_at: booking.created_at,
      });
    });

    // Add sessions (and merge with bookings if booking_id exists)
    // Only include sessions that are scheduled (not pending) or have a booking_id
    (sessions ?? []).forEach(session => {
      const existingIndex = combinedSessions.findIndex(s => s.id === session.booking_id);
      if (existingIndex >= 0) {
        // Merge session data with booking
        combinedSessions[existingIndex] = {
          ...combinedSessions[existingIndex],
          development_form_submitted: session.development_form_submitted ?? false,
          is_complete: session.is_complete ?? false,
          session_status: session.status,
        };
      } else if (session.status !== 'pending') {
        // Standalone session entry - only if not pending
        // Pending sessions are not yet scheduled and should not be shown
        combinedSessions.push({
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

    // Filter out sessions that are not yet scheduled (no date or time)
    const scheduledSessions = combinedSessions.filter(s => s.date && s.time);

    // One free-consultation entry per client (keep latest by date/time)
    const freeBestByClient = new Map<string, (typeof scheduledSessions)[0]>();
    for (const s of scheduledSessions) {
      if (s.type !== 'free_consultation' || !s.client_id) continue;
      const prev = freeBestByClient.get(s.client_id);
      const t = new Date(`${s.date}T${s.time || '00:00'}`).getTime();
      const pt = prev ? new Date(`${prev.date}T${prev.time || '00:00'}`).getTime() : -1;
      if (!prev || t >= pt) freeBestByClient.set(s.client_id, s);
    }
    const keepFreeIds = new Set(
      [...freeBestByClient.values()].map((s) => s.id)
    );
    const dedupedSessions = scheduledSessions.filter((s) => {
      if (s.type !== 'free_consultation' || !s.client_id) return true;
      return keepFreeIds.has(s.id);
    });
    
    // Sort by date
    dedupedSessions.sort((a, b) => new Date(a.date || '9999-12-31').getTime() - new Date(b.date || '9999-12-31').getTime());

    return NextResponse.json({ sessions: dedupedSessions });
  } catch (error) {
    console.error('[Therapist Sessions]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
