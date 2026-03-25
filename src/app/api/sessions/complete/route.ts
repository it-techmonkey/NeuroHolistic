import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, sessionIdType = 'session' } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // First, check if this is a session ID or booking ID
    let session: any = null;
    
    // Try to find in sessions table
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('id, development_form_submitted, status, booking_id, client_id, therapist_id, session_number')
      .or(`id.eq.${sessionId},booking_id.eq.${sessionId}`)
      .maybeSingle();

    session = sessionData;

    if (!session) {
      // Try to find booking and update it directly
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, user_id, therapist_id, status')
        .eq('id', sessionId)
        .maybeSingle();

      if (booking) {
        // Update booking status directly
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sessionId);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Booking marked as completed' });
      }

      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'completed') {
      return NextResponse.json({ message: 'Session is already completed', success: true });
    }

    // Update session status - allow completion even without development form
    // The development form requirement is for full progress tracking, not blocking completion
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        status: 'completed',
        is_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Also update the linked booking
    if (session.booking_id) {
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', session.booking_id);
    }

    // Update program session count if applicable
    const { data: sessionInfo } = await supabase
      .from('sessions')
      .select('program_id')
      .eq('id', session.id)
      .single();

    if (sessionInfo?.program_id) {
      // Count completed sessions for this program
      const { data: completedSessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('program_id', sessionInfo.program_id)
        .eq('status', 'completed');

      const sessionsCompleted = (completedSessions ?? []).length;

      // Update program
      await supabase
        .from('programs')
        .update({ 
          sessions_completed: sessionsCompleted,
          used_sessions: sessionsCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionInfo.program_id);
    }

    return NextResponse.json({ success: true, message: 'Session marked as completed' });
  } catch (error) {
    console.error('[Session Complete]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
