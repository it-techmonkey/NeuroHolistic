import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    // Auth check — admin only
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    // Get all therapists
    const { data: therapists } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'therapist')
      .order('created_at', { ascending: false });

    if (!therapists || therapists.length === 0) {
      return NextResponse.json({ therapists: [] });
    }

    // Get all related data in parallel
    const [
      therapistClientsResult,
      programsResult,
      bookingsResult,
      diagnosticAssessmentsResult,
      devFormsResult,
      sessionsResult,
    ] = await Promise.all([
      supabase.from('therapist_clients').select('*'),
      supabase.from('programs').select('*'),
      supabase.from('bookings').select('*'),
      supabase.from('diagnostic_assessments').select('id, client_id, therapist_id, goal_readiness_score, assessed_at, created_at'),
      supabase.from('session_development_forms').select('id, therapist_id, client_id, created_at, goal_readiness_score'),
      supabase.from('sessions').select('*'),
    ]);

    const therapistClients = therapistClientsResult.data ?? [];
    const programs = programsResult.data ?? [];
    const bookings = bookingsResult.data ?? [];
    const diagnosticAssessments = diagnosticAssessmentsResult.data ?? [];
    const devForms = devFormsResult.data ?? [];
    const sessions = sessionsResult.data ?? [];

    // Build detailed data for each therapist
    const therapistsWithDetails = therapists.map(therapist => {
      // Get therapist's clients
      const assignedClientIds = therapistClients
        .filter(tc => tc.therapist_id === therapist.id)
        .map(tc => tc.client_id);

      // Get therapist's programs
      const therapistPrograms = programs.filter(p => p.therapist_user_id === therapist.id);
      const activePrograms = therapistPrograms.filter(p => p.status === 'active');
      const completedPrograms = therapistPrograms.filter(p => p.status === 'completed');
      const cancelledPrograms = therapistPrograms.filter(p => p.status === 'cancelled');

      // Get therapist's bookings
      const therapistBookings = bookings.filter(b => 
        b.therapist_id === therapist.id || b.therapist_user_id === therapist.id
      );
      const completedBookings = therapistBookings.filter(b => b.status === 'completed');
      const upcomingBookings = therapistBookings.filter(b => 
        b.status === 'confirmed' && new Date(`${b.date}T${b.time}`) >= new Date()
      );
      const freeConsultations = therapistBookings.filter(b => b.type === 'free_consultation');
      const paidPrograms = therapistBookings.filter(b => b.type === 'paid_program');
      const paidSessions = therapistBookings.filter(b => b.type === 'paid_session');

      // Get therapist's assessments
      const therapistAssessments = diagnosticAssessments.filter(a => a.therapist_id === therapist.id);

      // Get therapist's development forms
      const therapistDevForms = devForms.filter(df => df.therapist_id === therapist.id);

      // Get therapist's sessions
      const therapistSessions = sessions.filter(s => s.therapist_id === therapist.id);
      const completedSessions = therapistSessions.filter(s => s.status === 'completed');
      const scheduledSessions = therapistSessions.filter(s => s.status === 'scheduled');

      // Calculate revenue - only 800 (single session) or 7700 (full program) allowed
      const programRevenue = therapistPrograms.reduce((sum: number, p: any) => {
        const price = p.price_paid ?? 0;
        // Only count valid program prices: 7700 for full program
        if (price === 7700) {
          return sum + 7700;
        }
        return sum;
      }, 0);
      
      const singleSessionRevenue = therapistBookings.reduce((sum: number, b: any) => {
        // Only count valid single session price: 800
        if (b.type === 'paid_session' && b.price === 800) {
          return sum + 800;
        }
        return sum;
      }, 0);
      
      const totalRevenue = programRevenue + singleSessionRevenue;

      // Calculate average goal readiness score improvement
      const assessmentsWithScores = therapistAssessments.filter(a => a.goal_readiness_score !== null);
      const avgScore = assessmentsWithScores.length > 0
        ? assessmentsWithScores.reduce((sum: number, a: any) => sum + a.goal_readiness_score, 0) / assessmentsWithScores.length
        : 0;

      // Get unique client list with basic info
      const clientIds = [...new Set(assignedClientIds)];
      const clientPrograms = clientIds.map(clientId => {
        const clientProgram = therapistPrograms.find(p => p.user_id === clientId);
        const clientBookings = bookings.filter(b => 
          b.user_id === clientId && 
          (b.therapist_id === therapist.id || b.therapist_user_id === therapist.id)
        );
        const clientAssessments = diagnosticAssessments.filter(a => 
          a.client_id === clientId && a.therapist_id === therapist.id
        );

        return {
          clientId,
          programStatus: clientProgram?.status || 'none',
          totalSessions: clientProgram?.total_sessions || 0,
          completedSessions: clientProgram?.sessions_completed || 0,
          bookingsCount: clientBookings.length,
          assessmentsCount: clientAssessments.length,
          hasActiveProgram: clientProgram?.status === 'active',
          hasCompletedProgram: clientProgram?.status === 'completed',
          revenue: clientProgram?.price_paid || 0,
        };
      });

      return {
        id: therapist.id,
        full_name: therapist.full_name,
        email: therapist.email,
        phone: therapist.phone,
        country: therapist.country,
        created_at: therapist.created_at,
        // Summary stats
        stats: {
          totalClients: clientIds.length,
          activePrograms: activePrograms.length,
          completedPrograms: completedPrograms.length,
          totalRevenue,
          upcomingBookings: upcomingBookings.length,
          completedBookings: completedBookings.length,
          freeConsultations: freeConsultations.length,
          paidPrograms: paidPrograms.length,
          paidSessions: paidSessions.length,
          totalSessions: therapistSessions.length,
          completedSessions: completedSessions.length,
          scheduledSessions: scheduledSessions.length,
          assessments: therapistAssessments.length,
          devForms: therapistDevForms.length,
          avgGoalReadiness: Math.round(avgScore),
        },
        // Detailed data
        clients: clientPrograms,
        programs: therapistPrograms,
        bookings: therapistBookings,
        assessments: therapistAssessments,
        sessions: therapistSessions,
      };
    });

    return NextResponse.json({ therapists: therapistsWithDetails });
  } catch (error) {
    console.error('[Admin Therapists]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
