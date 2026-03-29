import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    // Get all users with therapist role to verify current user
    const { data: allUsers } = await supabase.from('users').select('id, email, role').eq('role', 'therapist');
    
    // For now, return clients for ALL therapists (demo mode)
    // In production, you'd filter by the logged-in therapist's ID

    // Get ALL bookings - include therapist_user_id filter
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false });

    // Get all users (clients)
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, email, phone')
      .eq('role', 'client');

    // Get diagnostic assessments
    const { data: assessments } = await supabase
      .from('diagnostic_assessments')
      .select('*')
      .order('assessed_at', { ascending: false });

    // Get session development forms
    const { data: devFormsRaw } = await supabase
      .from('session_development_forms')
      .select('*')
      .order('created_at', { ascending: false });

    // Get sessions to build session_number map
    const { data: allSessions } = await supabase
      .from('sessions')
      .select('id, session_number');

    const sessionNumberMap = new Map<string, number>();
    (allSessions ?? []).forEach((s: any) => {
      if (s.id && s.session_number) {
        sessionNumberMap.set(s.id, s.session_number);
      }
    });

    // Add session_number to each dev form
    const devForms = (devFormsRaw ?? []).map((f: any) => ({
      ...f,
      session_number: sessionNumberMap.get(f.session_id) ?? null,
    }));

    // Get programs
    const { data: programs } = await supabase.from('programs').select('*');

    // Get sessions for accurate program completion counts
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, program_id, client_id, status');

    // Build unique client list from bookings OR users
    const clientMap = new Map<string, any>();
    
    // Helper to find or create client entry by user_id or email
    const getOrCreateClient = (booking: any) => {
      // First try by user_id
      if (booking.user_id && clientMap.has(booking.user_id)) {
        return clientMap.get(booking.user_id);
      }
      
      // Try to find existing user by email
      const userByEmail = (users ?? []).find((u: any) => 
        u.email?.toLowerCase() === booking.email?.toLowerCase()
      );
      
      const effectiveUserId = booking.user_id || userByEmail?.id;
      
      if (effectiveUserId && clientMap.has(effectiveUserId)) {
        return clientMap.get(effectiveUserId);
      }
      
      // Create new client entry
      const clientId = effectiveUserId || `guest_${booking.email}`;
      const client = {
        userId: clientId,
        fullName: booking.name || userByEmail?.full_name || 'Unknown',
        email: booking.email || userByEmail?.email || '',
        phone: booking.phone || userByEmail?.phone || '',
        bookings: [],
        assessments: [],
        devForms: [],
        program: null,
        nextSession: null,
        averageScore: null,
        isGuest: !effectiveUserId,
      };
      
      clientMap.set(clientId, client);
      return client;
    };
    
    // Process all bookings, including those without user_id
    for (const booking of (bookings ?? [])) {
      const client = getOrCreateClient(booking);
      client.bookings.push(booking);
    }

    // Enrich with assessments and dev forms
    for (const [clientId, client] of clientMap) {
      client.assessments = (assessments ?? []).filter((a: any) => a.client_id === clientId);
      client.devForms = (devForms ?? []).filter((f: any) => f.client_id === clientId);
      
      // Calculate average score
      const allScores = [
        ...client.assessments.map((a: any) => a.goal_readiness_score || 0),
        ...client.devForms.map((f: any) => f.goal_readiness_score || 0),
      ].filter(Boolean);
      
      if (allScores.length > 0) {
        client.averageScore = Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length);
      }

      client.assessmentCount = client.assessments.length;
      client.hasFreeConsultation = client.bookings.some((b: any) => b.type === 'free_consultation');

      // Find program (latest one)
      const clientPrograms = (programs ?? []).filter((p: any) => p.user_id === clientId);
      const latestProgram = clientPrograms.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0] || null;

      if (latestProgram) {
        const completedFromSessions = (sessions ?? []).filter(
          (s: any) => s.program_id === latestProgram.id && s.status === 'completed'
        ).length;

        client.program = {
          ...latestProgram,
          totalSessions: latestProgram.total_sessions ?? latestProgram.totalSessions ?? 10,
          completedSessions: completedFromSessions,
        };
      } else {
        client.program = null;
      }

      // Find next session
      const now = new Date();
      client.nextSession = client.bookings
        .filter((b: any) => (b.status === 'confirmed' || b.status === 'scheduled') && new Date(`${b.date}T${b.time}`) >= now)
        .sort((a: any, b: any) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0] || null;
    }

    const clients = Array.from(clientMap.values());

    // Overview stats
    const completedBookings = (bookings ?? []).filter((b: any) => b.status === 'completed');
    const upcomingBookings = (bookings ?? []).filter((b: any) => {
      const now = new Date();
      return (b.status === 'confirmed' || b.status === 'scheduled') && new Date(`${b.date}T${b.time}`) >= now;
    });
    const pendingDocs = (devForms ?? []).filter((f: any) => !f.submitted_at);

    return NextResponse.json({
      clients,
      overview: {
        totalClients: clients.length,
        completedSessions: completedBookings.length,
        upcomingSessions: upcomingBookings.length,
        pendingDocumentation: pendingDocs.length,
      },
    });
  } catch (error) {
    console.error('[Therapist Clients]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const { clientId, notes } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    // Update any therapist-client relationship with notes
    const { error } = await supabase
      .from('therapist_clients')
      .update({ notes })
      .eq('client_id', clientId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/therapist/clients]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
