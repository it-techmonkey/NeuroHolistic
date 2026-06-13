export type AdminData = {
  kpis: {
    totalClients: number;
    totalTherapists: number;
    activePrograms: number;
    completedPrograms: number;
    totalRevenue: number;
    upcomingBookings: number;
    todayBookings: number;
    totalBookings: number;
    totalUsers: number;
    academyActive: number;
    academyCompleted: number;
    academyRevenue: number;
    totalAcademyPrograms: number;
  };
  monthlyRevenue: { month: string; revenue: number; programs: number }[];
  users: any[];
  therapists: any[];
  bookings: any[];
  activeProgramsDetail: any[];
  recentActivity: any[];
  payments: any[];
};
