import { getServiceClient } from '@/lib/services/supabase-admin';

export type EligibilityResult = {
  canBookConsultation: boolean;
  hasActiveProgram: boolean;
  hasCompletedProgram: boolean;
  canBookProgramSessions: boolean;
  programId: string | null;
  remainingSessions: number;
  programPaymentType: 'full_program' | 'single_session' | null;
  assignedTherapist: {
    slug: string;
    name: string;
    userId: string | null;
  } | null;
  consultationStatus: 'none' | 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'confirmed';

  role: 'client' | 'therapist' | 'admin' | null;
};

export async function checkEligibility(email: string): Promise<EligibilityResult> {
  const supabase = getServiceClient();

  const result: EligibilityResult = {
    canBookConsultation: true,
    hasActiveProgram: false,
    hasCompletedProgram: false,
    canBookProgramSessions: false,
    programId: null,
    remainingSessions: 0,
    programPaymentType: null,
    assignedTherapist: null,
    consultationStatus: 'none',
    role: null,
  };

  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('email', email)
    .eq('type', 'free_consultation')
    .in('status', ['confirmed', 'completed', 'scheduled', 'pending'])
    .limit(1)
    .maybeSingle();

  if (existingBooking) {
    result.canBookConsultation = false;
    result.consultationStatus = existingBooking.status as any;
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .maybeSingle();

  // Set role if user found
  if (user?.role) {
    // Normalize legacy 'founder' to 'admin'
    const rawRole = user.role as string;
    result.role = rawRole === 'founder' ? 'admin' : rawRole as 'client' | 'therapist' | 'admin';
  }

  if (user) {
    const { data: program } = await supabase
      .from('programs')
      .select('id, total_sessions, used_sessions, payment_id, therapist_user_id, therapist_name')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (program) {
      result.hasActiveProgram = true;
      result.programId = program.id;
      result.remainingSessions = Math.max(0, program.total_sessions - program.used_sessions);
      result.canBookProgramSessions = result.remainingSessions > 0;

      if (program.payment_id) {
        const { data: payment } = await supabase
          .from('payments')
          .select('type')
          .eq('id', program.payment_id)
          .maybeSingle();

        result.programPaymentType = payment?.type ?? null;
      }

      if (program.therapist_name) {
        result.assignedTherapist = {
          slug: program.therapist_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
          name: program.therapist_name,
          userId: program.therapist_user_id ?? null,
        };
      }
    }

    // Check for completed program (if no active program found)
    if (!result.hasActiveProgram) {
      const { data: completedProgram } = await supabase
        .from('programs')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (completedProgram) {
        result.hasCompletedProgram = true;
      }
    }

    if (!result.assignedTherapist) {
      const { data: firstBooking } = await supabase
        .from('bookings')
        .select('therapist_id, therapist_name, therapist_user_id')
        .eq('user_id', user.id)
        .in('status', ['confirmed', 'completed', 'scheduled'])
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstBooking?.therapist_name) {
        result.assignedTherapist = {
          slug: firstBooking.therapist_id,
          name: firstBooking.therapist_name,
          userId: firstBooking.therapist_user_id ?? null,
        };
      }
    }
  }

  return result;
}
