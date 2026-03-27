import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

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

    // Run all queries in parallel - using NEW table names
    const [
      usersResult,
      programsResult,
      bookingsResult,
      leadsResult,
      diagnosticAssessmentsResult,
      tcResult,
      devFormsResult,
    ] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('programs').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('diagnostic_assessments').select('id, client_id, therapist_id, goal_readiness_score, assessed_at, nervous_system_score, emotional_state_score, cognitive_patterns_score, body_symptoms_score, behavioral_patterns_score, life_functioning_score').order('assessed_at', { ascending: false }),
      supabase.from('therapist_clients').select('*'),
      supabase.from('session_development_forms').select('id, therapist_id, client_id, created_at, pre_session_energy, pre_session_mood').order('created_at', { ascending: false }),
    ]);

    const users = usersResult.data ?? [];
    const programs = programsResult.data ?? [];
    const bookings = bookingsResult.data ?? [];
    const leads = leadsResult.data ?? [];
    const diagnosticAssessments = diagnosticAssessmentsResult.data ?? [];
    const therapistClients = tcResult.data ?? [];
    const devForms = devFormsResult.data ?? [];

    // Computed KPIs
    const therapists = users.filter(u => u.role === 'therapist');
    const clients = users.filter(u => u.role === 'client');
    const activePrograms = programs.filter(p => p.status === 'active');
    // Calculate revenue - only 800 (single session) or 7700 (full program) allowed
    const programRevenue = programs.reduce((sum, p) => {
      const price = p.price_paid ?? 0;
      // Only count valid program prices: 7700 for full program
      if (price === 7700) {
        return sum + 7700;
      }
      return sum;
    }, 0);
    
    const singleSessionRevenue = bookings.reduce((sum, b) => {
      // Only count valid single session price: 800
      if (b.type === 'paid_session' && b.price === 800) {
        return sum + 800;
      }
      return sum;
    }, 0);
    
    const totalRevenue = programRevenue + singleSessionRevenue;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const assessmentsThisMonth = diagnosticAssessments.filter(a =>
      a.assessed_at && new Date(a.assessed_at) >= thisMonthStart
    );

    const upcomingBookings = bookings.filter(b =>
      b.status === 'confirmed' && new Date(`${b.date}T${b.time}`) >= now
    );

    // Therapist breakdown
    const therapistStats = therapists.map(t => {
      const assignedClientIds = therapistClients
        .filter(tc => tc.therapist_id === t.id)
        .map(tc => tc.client_id);
      const therapistPrograms = programs.filter(p => p.therapist_user_id === t.id);
      const therapistBookings = bookings.filter(b =>
        b.therapist_id === t.id || b.therapist_user_id === t.id
      );
      const therapistAssessments = diagnosticAssessments.filter(a => a.therapist_id === t.id);

      // Calculate revenue - only 800 (single session) or 7700 (full program) allowed
      const therapistProgramRevenue = therapistPrograms.reduce((sum: number, p: any) => {
        const price = p.price_paid ?? 0;
        // Only count valid program prices: 7700 for full program
        if (price === 7700) {
          return sum + 7700;
        }
        return sum;
      }, 0);
      
      const therapistSingleSessionRevenue = therapistBookings.reduce((sum: number, b: any) => {
        // Only count valid single session price: 800
        if (b.type === 'paid_session' && b.price === 800) {
          return sum + 800;
        }
        return sum;
      }, 0);
      
      const revenue = therapistProgramRevenue + therapistSingleSessionRevenue;

      return {
        id: t.id,
        name: t.full_name || t.email,
        email: t.email,
        clientCount: assignedClientIds.length,
        upcomingCount: therapistBookings.filter(b =>
          b.status === 'confirmed' && new Date(`${b.date}T${b.time}`) >= now
        ).length,
        completedSessions: therapistBookings.filter(b => b.status === 'completed').length,
        assessmentsCount: therapistAssessments.length,
        revenue,
      };
    });

    return NextResponse.json({
      kpis: {
        totalClients: clients.length,
        totalTherapists: therapists.length,
        activePrograms: activePrograms.length,
        totalRevenue,
        upcomingBookings: upcomingBookings.length,
        totalBookings: bookings.length,
        totalLeads: leads.length,
        assessmentsThisMonth: assessmentsThisMonth.length,
      },
      therapistStats,
      recentBookings: bookings.slice(0, 10),
      recentLeads: leads.slice(0, 10),
    });
  } catch (error) {
    console.error('[Admin Overview]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
