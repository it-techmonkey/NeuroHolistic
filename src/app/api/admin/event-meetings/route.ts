import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { ensureEventMeetings, findEvent, getEventMeetings, resolveHostTherapistId } from '@/lib/events/event-meetings';
import { isGoogleCalendarConnected } from '@/lib/google/token-service';

async function requireAdmin() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const { data: userData } = await authClient.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}

/** List the Meet links for one event, with host-connection diagnostics. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const eventId = request.nextUrl.searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
  }

  const event = findEvent(eventId);
  if (!event) return NextResponse.json({ error: 'Unknown event' }, { status: 404 });

  const supabase = getServiceSupabase();
  const meetings = await getEventMeetings(supabase, eventId);
  const hostTherapistId = await resolveHostTherapistId(supabase, event);
  const hostConnected = hostTherapistId ? await isGoogleCalendarConnected(hostTherapistId) : false;

  return NextResponse.json({
    eventId,
    hostTherapistEmail: event.hostTherapistEmail ?? null,
    hostTherapistId,
    hostConnected,
    sessions: event.liveSessions ?? [],
    meetings,
  });
}

/** Create any missing Meet links on the host therapist's Google account. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { eventId } = await request.json().catch(() => ({ eventId: null }));
  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
  }

  if (!findEvent(eventId)) {
    return NextResponse.json({ error: 'Unknown event' }, { status: 404 });
  }

  const supabase = getServiceSupabase();
  const result = await ensureEventMeetings(supabase, eventId);

  return NextResponse.json({
    success: result.failed.length === 0,
    created: result.created,
    failed: result.failed,
    meetings: result.meetings,
  });
}
