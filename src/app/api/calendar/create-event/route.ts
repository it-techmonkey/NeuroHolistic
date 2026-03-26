import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { getValidAccessToken } from '@/lib/google/token-service';
import { createCalendarEvent } from '@/lib/google/calendar';

/**
 * POST /api/calendar/create-event
 * 
 * Creates a Google Calendar event with Meet link.
 * 
 * Request body:
 * {
 *   therapist_id: string;    // Therapist's user ID
 *   client_email: string;    // Client's email for attendee
 *   client_name?: string;    // Client's display name
 *   start_time: string;      // ISO 8601 format
 *   end_time: string;        // ISO 8601 format
 *   title?: string;          // Event title (optional)
 *   description?: string;    // Event description (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   meet_link: string;
 *   event_id: string;
 *   html_link: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      therapist_id,
      client_email,
      client_name,
      start_time,
      end_time,
      title,
      description,
    } = body;

    // Validate required fields
    if (!therapist_id || !client_email || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: therapist_id, client_email, start_time, end_time' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'end_time must be after start_time' },
        { status: 400 }
      );
    }

    // Verify the requesting user is the therapist or an admin
    const serviceSupabase = getServiceSupabase();
    const { data: userProfile } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userProfile?.role === 'admin';
    const isTherapist = user.id === therapist_id;

    if (!isAdmin && !isTherapist) {
      return NextResponse.json(
        { error: 'Only the therapist or admin can create events' },
        { status: 403 }
      );
    }

    // Get valid access token (refreshes if expired)
    const accessToken = await getValidAccessToken(therapist_id);

    // Get therapist info for event
    const { data: therapist } = await serviceSupabase
      .from('users')
      .select('full_name, email')
      .eq('id', therapist_id)
      .single();

    // Create calendar event
    const eventResult = await createCalendarEvent(accessToken, {
      summary: title || 'Therapy Session - NeuroHolistic Institute',
      description: description || `Therapy session with ${therapist?.full_name || 'NeuroHolistic Institute'}`,
      startTime: start_time,
      endTime: end_time,
      attendees: [
        { email: client_email, displayName: client_name || client_email },
        ...(therapist?.email ? [{ email: therapist.email, displayName: therapist.full_name || therapist.email }] : []),
      ],
    });

    // Optionally store the event ID in bookings table for reference
    // This allows future updates/cancellations
    const bookingId = body.booking_id;
    if (bookingId) {
      await serviceSupabase
        .from('bookings')
        .update({
          google_event_id: eventResult.eventId,
          meet_link: eventResult.meetLink,
        })
        .eq('id', bookingId);
    }

    return NextResponse.json({
      success: true,
      meet_link: eventResult.meetLink,
      event_id: eventResult.eventId,
      html_link: eventResult.htmlLink,
    });

  } catch (error: any) {
    console.error('[Create Calendar Event] Error:', error);

    // Handle specific errors
    if (error.message?.includes('Google Calendar not connected')) {
      return NextResponse.json(
        { error: 'Google Calendar not connected. Please connect your Google Calendar first.' },
        { status: 400 }
      );
    }

    if (error.message?.includes('expired') || error.message?.includes('reconnect')) {
      return NextResponse.json(
        { error: 'Google Calendar access expired. Please reconnect your Google Calendar.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
