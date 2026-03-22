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
    // Auth check — founder only
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    // Run all queries in parallel
    const [
      usersResult,
      programsResult,
      paymentsResult,
      bookingsResult,
      leadsResult,
      assessmentsResult,
      tcResult,
      sessionAssessmentsResult,
    ] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('programs').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('assessments').select('id,user_id,email,full_name,overall_dysregulation_score,overall_severity_band,nervous_system_type,primary_core_wound,submitted_at,nervous_system_score,emotional_pattern_score,family_imprint_score,incident_load_score,body_symptom_score,current_stress_score,recommended_phase_primary').order('submitted_at', { ascending: false }),
      supabase.from('therapist_clients').select('*'),
      supabase.from('therapist_session_assessments').select('*').order('created_at', { ascending: false }),
    ]);

    const users = usersResult.data ?? [];
    const programs = programsResult.data ?? [];
    const payments = paymentsResult.data ?? [];
    const bookings = bookingsResult.data ?? [];
    const leads = leadsResult.data ?? [];
    const assessments = assessmentsResult.data ?? [];
    const therapistClients = tcResult.data ?? [];
    const sessionAssessments = sessionAssessmentsResult.data ?? [];

    // Computed KPIs
    const therapists = users.filter(u => u.role === 'therapist');
    const clients = users.filter(u => u.role === 'client');
    const activePrograms = programs.filter(p => p.status === 'active');
    const paidPayments = payments.filter(p => p.status === 'paid');
    const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const assessmentsThisMonth = assessments.filter(a =>
      a.submitted_at && new Date(a.submitted_at) >= thisMonthStart
    );

    // Therapist breakdown: clients assigned, revenue, sessions
    const therapistStats = therapists.map(t => {
      const assignedClientIds = therapistClients
        .filter(tc => tc.therapist_id === t.id)
        .map(tc => tc.client_id);
      const therapistPrograms = programs.filter(p => p.therapist_user_id === t.id);
      const therapistPayments = payments.filter(p =>
        therapistPrograms.some(tp => tp.id === p.program_id) && p.status === 'paid'
      );
      const therapistBookings = bookings.filter(b => b.therapist_user_id === t.id);
      const therapistSessionAssessments = sessionAssessments.filter((a) => a.therapist_id === t.id);
      const completedSessions = therapistBookings.filter(b => b.status === 'completed').length;
      const upcomingBookings = therapistBookings.filter(b => {
        if (b.status !== 'confirmed') return false;
        return new Date(b.date) >= now;
      });

      return {
        id: t.id,
        name: t.full_name ?? t.email,
        email: t.email,
        clientCount: assignedClientIds.length,
        activePrograms: therapistPrograms.filter(p => p.status === 'active').length,
        completedSessions,
        upcomingCount: upcomingBookings.length,
        revenue: therapistPayments.reduce((s, p) => s + (p.amount ?? 0), 0),
        averageScore: therapistSessionAssessments.length
          ? Number(
              (
                therapistSessionAssessments.reduce(
                  (sum, row) => sum + Number((row.overall_dysregulation_score as number | null) ?? 0),
                  0
                ) / therapistSessionAssessments.length
              ).toFixed(2)
            )
          : null,
      };
    });

    // Client breakdown
    const clientStats = clients.map(c => {
      const program = programs.find(p => p.user_id === c.id);
      const assessment = assessments.find(a => a.user_id === c.id);
      const therapistAssignment = therapistClients.find(tc => tc.client_id === c.id);
      const therapist = therapistAssignment
        ? users.find(u => u.id === therapistAssignment.therapist_id)
        : null;
      const clientPayments = payments.filter(p => p.user_id === c.id && p.status === 'paid');
      const clientSessionAssessments = sessionAssessments.filter((a) => a.client_id === c.id);
      const latestSessionAssessment = clientSessionAssessments[0];

      return {
        id: c.id,
        name: c.full_name ?? c.email,
        email: c.email,
        phone: c.phone,
        therapistName: therapist?.full_name ?? therapist?.email ?? null,
        programStatus: program?.status ?? null,
        sessionsUsed: program?.used_sessions ?? 0,
        totalSessions: program?.total_sessions ?? 0,
        assessmentScore: latestSessionAssessment?.overall_dysregulation_score ?? assessment?.overall_dysregulation_score ?? null,
        averageSessionScore: clientSessionAssessments.length
          ? Number(
              (
                clientSessionAssessments.reduce(
                  (sum, row) => sum + Number((row.overall_dysregulation_score as number | null) ?? 0),
                  0
                ) / clientSessionAssessments.length
              ).toFixed(2)
            )
          : null,
        severityBand: assessment?.overall_severity_band ?? null,
        totalPaid: clientPayments.reduce((s, p) => s + (p.amount ?? 0), 0),
        joinedAt: c.created_at,
      };
    });

    return NextResponse.json({
      kpis: {
        totalClients: clients.length,
        totalTherapists: therapists.length,
        activePrograms: activePrograms.length,
        totalRevenue,                        // in fils (AED × 100)
        assessmentsThisMonth: assessmentsThisMonth.length,
        totalLeads: leads.length,
        upcomingBookings: bookings.filter(b => b.status === 'confirmed' && new Date(b.date) >= now).length,
      },
      therapistStats,
      clientStats,
      payments: payments.map(p => ({
        id: p.id,
        clientName: clients.find(c => c.id === p.user_id)?.full_name ?? p.user_id,
        amount: p.amount,
        currency: p.currency,
        type: p.type,
        status: p.status,
        reference: p.payment_reference,
        createdAt: p.created_at,
      })),
      leads,
      assessments: assessments.map(a => ({
        ...a,
        clientName: clients.find(c => c.id === a.user_id)?.full_name ?? a.full_name ?? a.email,
      })),
      sessionAssessments,
    });
  } catch (err) {
    console.error('[Admin Overview]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
