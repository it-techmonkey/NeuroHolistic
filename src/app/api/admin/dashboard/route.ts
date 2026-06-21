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
      tcResult,
      sessionsResult,
      paymentsResult,
    ] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('programs').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('therapist_clients').select('*'),
      supabase.from('sessions').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
    ]);

    const users = usersResult.data ?? [];
    const programs = programsResult.data ?? [];
    const bookings = bookingsResult.data ?? [];
    const therapistClients = tcResult.data ?? [];
    const sessions = sessionsResult.data ?? [];
    const payments = paymentsResult.data ?? [];

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

    // Upcoming bookings
    const upcomingBookings = bookings.filter(b =>
      (b.status === 'confirmed' || b.status === 'scheduled') && new Date(`${b.date}T${b.time}`) >= now
    );

    // Today's sessions
    const todayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date + 'T00:00:00');
      return bookingDate >= todayStart && bookingDate < new Date(todayStart.getTime() + 86400000);
    });

    // Therapist-client mapping
    const therapistClientMap = therapists.map(t => {
      const assignedClients = therapistClients
        .filter(tc => tc.therapist_id === t.id)
        .map(tc => {
          const clientUser = userMap.get(tc.client_id);
          const clientProgram = programs.find(p => p.user_id === tc.client_id && p.therapist_user_id === t.id);
          const clientBookings = bookings.filter(b =>
            b.user_id === tc.client_id && (b.therapist_id === t.id || b.therapist_user_id === t.id)
          );
          const clientSessions = sessions.filter(s => s.client_id === tc.client_id && s.therapist_id === t.id);

          return {
            id: tc.client_id,
            name: clientUser?.full_name || clientBookings[0]?.name || 'Unknown',
            email: clientUser?.email || clientBookings[0]?.email || '',
            phone: clientUser?.phone || clientBookings[0]?.phone || '',
            program: clientProgram ? {
              status: clientProgram.status,
              totalSessions: clientProgram.total_sessions,
              completedSessions: clientProgram.sessions_completed || 0,
            } : null,
            bookingsCount: clientBookings.length,
            sessionsCount: clientSessions.length,
            completedSessions: clientSessions.filter(s => s.status === 'completed').length,
          };
        });

      const tBookings = bookings.filter(b => b.therapist_id === t.id || b.therapist_user_id === t.id);
      const tPrograms = programs.filter(p => p.therapist_user_id === t.id);
      const tSessions = sessions.filter(s => s.therapist_id === t.id);

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
          totalBookings: tBookings.length,
          completedBookings: tBookings.filter(b => b.status === 'completed').length,
          upcomingBookings: tBookings.filter(b =>
            (b.status === 'confirmed' || b.status === 'scheduled') && new Date(`${b.date}T${b.time}`) >= now
          ).length,
          totalSessions: tSessions.length,
          completedSessions: tSessions.filter(s => s.status === 'completed').length,
          revenue: tPrograms.reduce((sum, p) => {
            if (p.payment_status !== 'verified') return sum;
            return sum + (p.price_paid ?? 0);
          }, 0),
        },
      };
    });

    // Academy-specific stats
    const academyPrograms = programs.filter(p => p.program_type === 'academy');
    const academyActive = academyPrograms.filter(p => p.status === 'active');
    const academyCompleted = academyPrograms.filter(p => p.status === 'completed');
    const academyRevenue = academyPrograms.reduce((sum, p) => {
      if (p.payment_status !== 'verified') return sum;
      return sum + (p.price_paid ?? 0);
    }, 0);

    // Active programs detail — only include programs that have actual sessions booked
    const activeProgramsDetail = programs
      .filter(p => {
        if (p.status !== 'active') return false;
        // Exclude programs with no sessions and no bookings
        const hasSessions = sessions.some(s => s.program_id === p.id);
        const hasBookings = bookings.some(b => b.program_id === p.id);
        return hasSessions || hasBookings || p.used_sessions > 0;
      })
      .map(p => {
        const client = userMap.get(p.user_id);
        const therapist = userMap.get(p.therapist_user_id);
        const programSessions = sessions.filter(s => s.program_id === p.id);
        return {
          clientName: client?.full_name || p.client_name || 'Unknown',
          therapistName: therapist?.full_name || p.therapist_name || 'Unknown',
          sessionsCompleted: programSessions.filter(s => s.status === 'completed').length,
          totalSessions: p.total_sessions,
          programType: p.program_type || 'private',
        };
      });

    // Recent activity feed
    const recentActivity = [
      ...bookings.slice(0, 10).map(b => ({
        type: 'booking' as const,
        id: b.id,
        timestamp: b.created_at,
        description: `${b.name || 'Client'} booked ${b.type === 'free_consultation' ? 'free consultation' : 'program session'}`,
        status: b.status,
        therapistName: b.therapist_name,
      })),
      ...payments.slice(0, 10).map(p => ({
        type: 'payment' as const,
        id: p.id,
        timestamp: p.created_at,
        description: `Payment of ${p.currency} ${p.amount} — ${p.status}`,
        status: p.status,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 20);

    return NextResponse.json({
      kpis: {
        totalClients: clients.length,
        totalTherapists: therapists.length,
        activePrograms: programs.filter(p => p.status === 'active').length,
        completedPrograms: programs.filter(p => p.status === 'completed').length,
        totalRevenue,
        upcomingBookings: upcomingBookings.length,
        todayBookings: todayBookings.length,
        totalBookings: bookings.length,
        totalUsers: users.length,
        academyActive: academyActive.length,
        academyCompleted: academyCompleted.length,
        academyRevenue,
        totalAcademyPrograms: academyPrograms.length,
      },
      monthlyRevenue,
      payments: payments.map(p => ({
        id: p.id,
        userId: p.user_id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        type: p.type,
        createdAt: p.created_at,
        clientName: userMap.get(p.user_id)?.full_name || 'Unknown',
        clientEmail: userMap.get(p.user_id)?.email || '',
      })),
      users: users.map(u => {
        const userPrograms = programs.filter(p => p.user_id === u.id);
        const hasAcademy = userPrograms.some(p => p.program_type === 'academy');
        const hasTherapy = userPrograms.some(p => p.program_type !== 'academy');
        return {
          id: u.id,
          email: u.email,
          role: u.role,
          fullName: u.full_name,
          phone: u.phone,
          country: u.country,
          createdAt: u.created_at,
          bookingsCount: bookings.filter(b => b.user_id === u.id).length,
          programsCount: userPrograms.length,
          programTypes: hasAcademy && hasTherapy ? 'both' : hasAcademy ? 'academy' : hasTherapy ? 'therapy' : null,
          assignedTherapist: therapistClients.find(tc => tc.client_id === u.id)
            ? (() => {
                const tc = therapistClients.find(tc2 => tc2.client_id === u.id);
                const t = tc ? userMap.get(tc.therapist_id) : null;
                return t ? { id: t.id, name: t.full_name || t.email } : null;
              })()
            : null,
        };
      }),
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
      programs: programs.map(p => ({
        id: p.id,
        user_id: p.user_id,
        therapist_user_id: p.therapist_user_id,
        therapist_name: p.therapist_name,
        total_sessions: p.total_sessions,
        used_sessions: p.used_sessions || 0,
        sessions_completed: p.sessions_completed || 0,
        status: p.status,
        program_type: p.program_type || 'private',
        price_paid: p.price_paid ?? null,
        payment_status: p.payment_status || 'pending',
        client_name: p.client_name,
        client_email: p.client_email,
        created_at: p.created_at,
      })),
    });
  } catch (error) {
    console.error('[Admin Dashboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
