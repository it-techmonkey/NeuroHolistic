import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

/**
 * Generate a slug from a name (same logic as therapist list API)
 */
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await authClient.from('users').select('role, full_name').eq('id', user.id).single();
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
      // Match by:
      // 1. therapist_user_id (UUID) - for database therapists
      // 2. therapist_id (UUID) - for database therapists  
      // 3. therapist_name (for slug-based therapists stored as name)
      const filters = [
        `therapist_user_id.eq.${user.id}`,
        `therapist_id.eq.${user.id}`,
      ];
      
      // Also try to match by therapist name if available
      if (userData.full_name) {
        // Try exact name match
        filters.push(`therapist_name.eq.${userData.full_name}`);
        // Also try slug-based match
        const therapistSlug = generateSlug(userData.full_name);
        filters.push(`therapist_id.eq.${therapistSlug}`);
      }
      
      bookingsQuery = bookingsQuery.or(filters.join(','));
    }

    if (status) {
      bookingsQuery = bookingsQuery.eq('status', status);
    }

    const { data: bookings } = await bookingsQuery;

    // Debug logging
    console.log('[Therapist Sessions] User ID:', user.id);
    console.log('[Therapist Sessions] Therapist slug:', userData.full_name ? generateSlug(userData.full_name) : 'none');
    console.log('[Therapist Sessions] Bookings found:', bookings?.length || 0);
    console.log('[Therapist Sessions] Bookings:', JSON.stringify(bookings?.map(b => ({ id: b.id, type: b.type, status: b.status, therapist_id: b.therapist_id, therapist_user_id: b.therapist_user_id, date: b.date, time: b.time })), null, 2));

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

    // Get all assessments for this therapist (both submitted and completed status)
    // Previously only checked 'submitted' — assessments marked complete via PATCH were missed
    const { data: assessments } = await supabase
      .from('diagnostic_assessments')
      .select('client_id, client_name, status')
      .eq('therapist_id', user.id)
      .in('status', ['submitted', 'completed']);

    // Create lookup sets for quick checking
    const assessedClientIds = new Set<string>();
    const assessedClientNames = new Set<string>();
    (assessments ?? []).forEach((a: any) => {
      if (a.client_id) assessedClientIds.add(a.client_id.toLowerCase().trim());
      if (a.client_name) assessedClientNames.add(a.client_name.toLowerCase().trim());
    });

    console.log('[Therapist Sessions] Assessments found:', assessments?.length || 0);
    console.log('[Therapist Sessions] Assessed client IDs:', [...assessedClientIds]);
    console.log('[Therapist Sessions] Assessed client names:', [...assessedClientNames]);

    // Add bookings with assessment status
    (bookings ?? []).forEach(booking => {
      let hasAssessment = false;
      
      // Check by user_id first
      if (booking.user_id) {
        hasAssessment = assessedClientIds.has(booking.user_id.toLowerCase().trim());
      }
      // Then check by booking name
      if (!hasAssessment && booking.name) {
        hasAssessment = assessedClientNames.has(booking.name.toLowerCase().trim());
      }
      // Fallback: check by client's profile full_name from the users table
      // This handles cases where booking.name doesn't match but the user account name does
      if (!hasAssessment && booking.user_id && clientMap[booking.user_id]?.full_name) {
        hasAssessment = assessedClientNames.has(clientMap[booking.user_id].full_name.toLowerCase().trim());
      }

      if (booking.type === 'free_consultation') {
        console.log('[Therapist Sessions] Free consultation booking:', {
          id: booking.id,
          user_id: booking.user_id,
          name: booking.name,
          clientFullName: booking.user_id ? clientMap[booking.user_id]?.full_name : null,
          hasAssessment,
          assessedClientIds: [...assessedClientIds],
          assessedClientNames: [...assessedClientNames],
        });
      }

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
        meet_link: booking.meet_link || booking.meeting_link,
        meeting_link: booking.meeting_link || booking.meet_link,
        program_id: booking.program_id,
        development_form_submitted: false,
        assessment_submitted: hasAssessment,
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
    
    // Ensure client_name is set for all sessions (fallback to 'Client' if missing)
    scheduledSessions.forEach(s => {
      if (!s.client_name && !s.clients?.full_name) {
        s.client_name = 'Client';
      }
    });
    
    console.log('[Therapist Sessions] Combined sessions count:', combinedSessions.length);
    console.log('[Therapist Sessions] Scheduled sessions count:', scheduledSessions.length);
    console.log('[Therapist Sessions] Free consultation sessions:', JSON.stringify(scheduledSessions.filter(s => s.type === 'free_consultation'), null, 2));

    // One free-consultation entry per client (keep latest by date/time)
    // Use a unique key for deduplication: client_id if available, otherwise booking id
    const freeBestByKey = new Map<string, (typeof scheduledSessions)[0]>();
    for (const s of scheduledSessions) {
      if (s.type !== 'free_consultation') continue;
      // Use client_id as key if available, otherwise use booking id (no dedup)
      const key = s.client_id || s.id;
      const prev = freeBestByKey.get(key);
      const t = new Date(`${s.date}T${s.time || '00:00'}`).getTime();
      const pt = prev ? new Date(`${prev.date}T${prev.time || '00:00'}`).getTime() : -1;
      if (!prev || t >= pt) freeBestByKey.set(key, s);
    }
    const keepFreeIds = new Set(
      [...freeBestByKey.values()].map((s) => s.id)
    );
    const dedupedSessions = scheduledSessions.filter((s) => {
      if (s.type !== 'free_consultation') return true;
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
