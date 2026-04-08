import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';

export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await authClient
      .from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    const [
      usersResult,
      programsResult,
      bookingsResult,
      leadsResult,
      assessmentsResult,
      tcResult,
      devFormsResult,
      sessionsResult,
      paymentsResult,
      notificationsResult,
      documentsResult,
    ] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('programs').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('diagnostic_assessments').select('*').order('assessed_at', { ascending: false }),
      supabase.from('therapist_clients').select('*'),
      supabase.from('session_development_forms').select('*').order('created_at', { ascending: false }),
      supabase.from('sessions').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('notifications_log').select('*').order('created_at', { ascending: false }),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
    ]);

    const users = usersResult.data ?? [];
    const programs = programsResult.data ?? [];
    const bookings = bookingsResult.data ?? [];
    const leads = leadsResult.data ?? [];
    const assessments = assessmentsResult.data ?? [];
    const therapistClients = tcResult.data ?? [];
    const devForms = devFormsResult.data ?? [];
    const sessions = sessionsResult.data ?? [];
    const payments = paymentsResult.data ?? [];
    const notifications = notificationsResult.data ?? [];
    const documents = documentsResult.data ?? [];

    const therapists = users.filter(u => u.role === 'therapist');
    const clients = users.filter(u => u.role === 'client');
    const admins = users.filter(u => u.role === 'admin');

    // Build user lookup map
    const userMap = new Map(users.map(u => [u.id, u]));

    // Revenue
    const programRevenue = programs.reduce((sum, p) => {
      if (p.payment_status !== 'verified') return sum;
      return sum + (p.price_paid ?? 0);
    }, 0);
    const totalRevenue = programRevenue;

    // Time buckets
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    // Monthly revenue breakdown (last 6 months)
    const monthlyRevenue: { month: string; revenue: number; programs: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthPrograms = programs.filter(p => {
        const d = new Date(p.created_at);
        return d >= monthDate && d <= monthEnd;
      });
      monthlyRevenue.push({
        month: monthLabel,
        revenue: monthPrograms.reduce((sum, p) => {
          if (p.payment_status !== 'verified') return sum;
          return sum + (p.price_paid ?? 0);
        }, 0),
        programs: monthPrograms.length,
      });
    }

    // Monthly bookings breakdown
    const monthlyBookings: { month: string; total: number; completed: number; cancelled: number; noShow: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthBk = bookings.filter(b => {
        const d = new Date(b.created_at);
        return d >= monthDate && d <= monthEnd;
      });
      monthlyBookings.push({
        month: monthLabel,
        total: monthBk.length,
        completed: monthBk.filter(b => b.status === 'completed').length,
        cancelled: monthBk.filter(b => b.status === 'cancelled').length,
        noShow: monthBk.filter(b => b.status === 'no_show').length,
      });
    }

    // Booking stats
    const bookingStatusCounts = {
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      scheduled: bookings.filter(b => b.status === 'scheduled').length,
      no_show: bookings.filter(b => b.status === 'no_show').length,
      pending: bookings.filter(b => b.status === 'pending').length,
    };

    const bookingTypeCounts = {
      free_consultation: bookings.filter(b => b.type === 'free_consultation').length,
      program: bookings.filter(b => b.type === 'program').length,
    };

    // Upcoming bookings
    const upcomingBookings = bookings.filter(b =>
      (b.status === 'confirmed' || b.status === 'scheduled') && new Date(`${b.date}T${b.time}`) >= now
    );

    // Today's sessions
    const todayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date + 'T00:00:00');
      return bookingDate >= todayStart && bookingDate < new Date(todayStart.getTime() + 86400000);
    });

    // Conversion: free consultation → paid program
    const freeConsultClients = new Set(
      bookings.filter(b => b.type === 'free_consultation' && b.user_id).map(b => b.user_id)
    );
    const paidProgramClients = new Set(
      programs.filter(p => p.user_id).map(p => p.user_id)
    );
    let convertedCount = 0;
    freeConsultClients.forEach(uid => { if (paidProgramClients.has(uid)) convertedCount++; });
    const conversionRate = freeConsultClients.size > 0
      ? Math.round((convertedCount / freeConsultClients.size) * 100)
      : 0;

    // Session completion rate
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const sessionCompletionRate = totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

    // No-show rate
    const totalFinishedBookings = bookings.filter(b =>
      b.status === 'completed' || b.status === 'no_show' || b.status === 'cancelled'
    ).length;
    const noShowRate = totalFinishedBookings > 0
      ? Math.round((bookingStatusCounts.no_show / totalFinishedBookings) * 100)
      : 0;

    // Cancelled rate
    const cancelRate = totalFinishedBookings > 0
      ? Math.round((bookingStatusCounts.cancelled / totalFinishedBookings) * 100)
      : 0;

    // Country distribution
    const countryMap = new Map<string, number>();
    clients.forEach(c => {
      const country = c.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    const countryDistribution = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    // Therapist-client mapping with details
    const therapistClientMap = therapists.map(t => {
      const assignedClients = therapistClients
        .filter(tc => tc.therapist_id === t.id)
        .map(tc => {
          const clientUser = userMap.get(tc.client_id);
          const clientProgram = programs.find(p => p.user_id === tc.client_id && p.therapist_user_id === t.id);
          const clientBookings = bookings.filter(b =>
            b.user_id === tc.client_id && (b.therapist_id === t.id || b.therapist_user_id === t.id)
          );
          const clientAssessments = assessments.filter(a => a.client_id === tc.client_id && a.therapist_id === t.id);
          const clientSessions = sessions.filter(s => s.client_id === tc.client_id && s.therapist_id === t.id);

          return {
            id: tc.client_id,
            name: clientUser?.full_name || clientBookings[0]?.name || 'Unknown',
            email: clientUser?.email || clientBookings[0]?.email || '',
            phone: clientUser?.phone || clientBookings[0]?.phone || '',
            country: clientUser?.country || clientBookings[0]?.country || '',
            assignedAt: tc.assigned_at,
            program: clientProgram ? {
              id: clientProgram.id,
              status: clientProgram.status,
              totalSessions: clientProgram.total_sessions,
              completedSessions: clientProgram.sessions_completed || 0,
              pricePaid: clientProgram.price_paid,
            } : null,
            bookingsCount: clientBookings.length,
            completedBookings: clientBookings.filter(b => b.status === 'completed').length,
            assessmentsCount: clientAssessments.length,
            latestAssessment: clientAssessments[0] ? {
              goalReadinessScore: clientAssessments[0].goal_readiness_score,
              assessedAt: clientAssessments[0].assessed_at,
            } : null,
            sessionsCount: clientSessions.length,
            completedSessions: clientSessions.filter(s => s.status === 'completed').length,
          };
        });

      const tBookings = bookings.filter(b => b.therapist_id === t.id || b.therapist_user_id === t.id);
      const tPrograms = programs.filter(p => p.therapist_user_id === t.id);
      const tAssessments = assessments.filter(a => a.therapist_id === t.id);
      const tSessions = sessions.filter(s => s.therapist_id === t.id);
      const tDevForms = devForms.filter(df => df.therapist_id === t.id);

      return {
        id: t.id,
        name: t.full_name || t.email,
        email: t.email,
        phone: t.phone,
        country: t.country,
        createdAt: t.created_at,
        clients: assignedClients,
        stats: {
          totalClients: assignedClients.length,
          activePrograms: tPrograms.filter(p => p.status === 'active').length,
          completedPrograms: tPrograms.filter(p => p.status === 'completed').length,
          totalBookings: tBookings.length,
          completedBookings: tBookings.filter(b => b.status === 'completed').length,
          upcomingBookings: tBookings.filter(b =>
            (b.status === 'confirmed' || b.status === 'scheduled') && new Date(`${b.date}T${b.time}`) >= now
          ).length,
          freeConsultations: tBookings.filter(b => b.type === 'free_consultation').length,
          totalSessions: tSessions.length,
          completedSessions: tSessions.filter(s => s.status === 'completed').length,
          assessments: tAssessments.length,
          devForms: tDevForms.length,
          revenue: tPrograms.reduce((sum, p) => {
            if (p.payment_status !== 'verified') return sum;
            return sum + (p.price_paid ?? 0);
          }, 0),
          avgGoalReadiness: tAssessments.length > 0
            ? Math.round(tAssessments.reduce((sum, a) => sum + (a.goal_readiness_score ?? 0), 0) / tAssessments.length)
            : 0,
        },
      };
    });

    // Assessment score trends (average across all clients per month)
    const assessmentTrends: { month: string; avgScore: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthAssessments = assessments.filter(a => {
        if (!a.assessed_at) return false;
        const d = new Date(a.assessed_at);
        return d >= monthDate && d <= monthEnd && a.goal_readiness_score != null;
      });
      assessmentTrends.push({
        month: monthLabel,
        avgScore: monthAssessments.length > 0
          ? Math.round(monthAssessments.reduce((sum, a) => sum + a.goal_readiness_score, 0) / monthAssessments.length)
          : 0,
        count: monthAssessments.length,
      });
    }

    // Notification stats
    const notificationStats = {
      total: notifications.length,
      sent: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      pending: notifications.filter(n => n.status === 'pending').length,
      byEmail: notifications.filter(n => n.channel === 'email').length,
      byWhatsApp: notifications.filter(n => n.channel === 'whatsapp').length,
    };

    // Active programs detail
    const activeProgramsDetail = programs
      .filter(p => p.status === 'active')
      .map(p => {
        const client = userMap.get(p.user_id);
        const therapist = userMap.get(p.therapist_user_id);
        const programSessions = sessions.filter(s => s.program_id === p.id);
        return {
          ...p,
          clientName: client?.full_name || p.client_name || 'Unknown',
          clientEmail: client?.email || p.client_email || '',
          therapistName: therapist?.full_name || p.therapist_name || 'Unknown',
          sessionsCompleted: programSessions.filter(s => s.status === 'completed').length,
          totalSessions: p.total_sessions,
          nextSession: programSessions
            .filter(s => s.status === 'scheduled' || s.status === 'pending')
            .sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0] || null,
        };
      });

    // Recent activity feed (combine bookings, assessments, payments, documents)
    const recentActivity = [
      ...bookings.slice(0, 10).map(b => ({
        type: 'booking' as const,
        id: b.id,
        timestamp: b.created_at,
        description: `${b.name || 'Client'} booked ${b.type === 'free_consultation' ? 'free consultation' : 'program session'}`,
        status: b.status,
        therapistName: b.therapist_name,
      })),
      ...assessments.slice(0, 10).map(a => ({
        type: 'assessment' as const,
        id: a.id,
        timestamp: a.created_at || a.assessed_at,
        description: `Assessment for ${a.client_name || 'client'} by ${userMap.get(a.therapist_id)?.full_name || 'therapist'}`,
        status: a.status,
      })),
      ...payments.slice(0, 10).map(p => ({
        type: 'payment' as const,
        id: p.id,
        timestamp: p.created_at,
        description: `Payment of ${p.currency} ${p.amount} — ${p.status}`,
        status: p.status,
      })),
      ...programs.slice(0, 5).map(p => ({
        type: 'program' as const,
        id: p.id,
        timestamp: p.created_at,
        description: `Program ${p.status} — ${userMap.get(p.user_id)?.full_name || 'client'}`,
        status: p.status,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 20);

    return NextResponse.json({
      // KPIs
      kpis: {
        totalClients: clients.length,
        totalTherapists: therapists.length,
        totalAdmins: admins.length,
        totalUsers: users.length,
        activePrograms: programs.filter(p => p.status === 'active').length,
        completedPrograms: programs.filter(p => p.status === 'completed').length,
        totalRevenue,
        upcomingBookings: upcomingBookings.length,
        todayBookings: todayBookings.length,
        totalBookings: bookings.length,
        totalLeads: leads.length,
        totalSessions,
        completedSessions,
        totalAssessments: assessments.length,
        totalDocuments: documents.length,
        totalDevForms: devForms.length,
        conversionRate,
        sessionCompletionRate,
        noShowRate,
        cancelRate,
      },
      // Charts
      monthlyRevenue,
      monthlyBookings,
      assessmentTrends,
      bookingStatusCounts,
      bookingTypeCounts,
      countryDistribution,
      // Data
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        fullName: u.full_name,
        phone: u.phone,
        country: u.country,
        createdAt: u.created_at,
        // Attach related data counts
        bookingsCount: bookings.filter(b => b.user_id === u.id).length,
        programsCount: programs.filter(p => p.user_id === u.id).length,
        assessmentsCount: assessments.filter(a => a.client_id === u.id).length,
        assignedTherapist: therapistClients.find(tc => tc.client_id === u.id)
          ? (() => {
              const tc = therapistClients.find(tc2 => tc2.client_id === u.id);
              const t = tc ? userMap.get(tc.therapist_id) : null;
              return t ? { id: t.id, name: t.full_name || t.email } : null;
            })()
          : null,
      })),
      therapists: therapistClientMap,
      bookings: bookings.map(b => ({
        id: b.id,
        clientName: b.name || userMap.get(b.user_id)?.full_name || 'Unknown',
        clientEmail: b.email || userMap.get(b.user_id)?.email || '',
        therapistName: b.therapist_name || 'Unknown',
        date: b.date,
        time: b.time,
        type: b.type,
        status: b.status,
        meetingLink: b.meeting_link,
        createdAt: b.created_at,
      })),
      activeProgramsDetail,
      recentActivity,
      notificationStats,
      leads: leads.map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        mobile: l.mobile,
        country: l.country,
        source: l.source,
        createdAt: l.created_at,
      })),
    });
  } catch (error) {
    console.error('[Admin Dashboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
