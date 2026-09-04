import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Revenue policy: only payments actually recorded in the `payments` table
 * count — a row with status 'paid', whether it came through the Ziina
 * gateway or was entered by an admin for a cash/bank-transfer payment
 * (`metadata.bookedBy === 'admin'`, `payment_reference` starting with
 * "admin-"/"CASH-", etc.). Either way it is a real, auditable transaction
 * recorded on the portal.
 *
 * Deliberately excluded: a program or booking merely *marked* verified/paid
 * on its own status field with no corresponding `payments` row. That status
 * can drift from reality (an admin flips it without ever recording the
 * payment), which is exactly the discrepancy this policy closes.
 */

export interface PortalPayment {
  id: string;
  amount: number;
  currency: string | null;
  type: string | null;
  status: string;
  program_id: string | null;
  booking_id: string | null;
  user_id: string | null;
  payment_reference: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

function readMetadata(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

/** True when this payment represents real money recorded on the portal. */
export function isPortalPayment(payment: { status?: string | null }): boolean {
  return payment?.status === 'paid';
}

/** Fetch every portal-captured payment, newest first. */
export async function fetchPortalPayments(supabase: SupabaseClient): Promise<PortalPayment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Revenue] Failed to fetch payments:', error);
    return [];
  }

  return (data ?? [])
    .filter(isPortalPayment)
    .map((p: any) => ({ ...p, amount: Number(p.amount ?? 0), metadata: readMetadata(p.metadata) }));
}

export function sumRevenue(payments: PortalPayment[]): number {
  return payments.reduce((sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0), 0);
}

/**
 * Attribute a payment to a therapist.
 * Programs resolve through `program_id`; events carry an explicit
 * `therapistId` in metadata (set when the event is linked to a therapist).
 */
export function revenueByTherapist(
  payments: PortalPayment[],
  programs: { id: string; therapist_user_id: string | null }[]
): Map<string, number> {
  const programTherapist = new Map(programs.map((p) => [p.id, p.therapist_user_id]));
  const totals = new Map<string, number>();

  for (const payment of payments) {
    const therapistId =
      (payment.program_id ? programTherapist.get(payment.program_id) : null) ??
      (typeof payment.metadata.therapistId === 'string' ? payment.metadata.therapistId : null);

    if (!therapistId) continue;
    totals.set(therapistId, (totals.get(therapistId) ?? 0) + payment.amount);
  }

  return totals;
}

/** Bucket revenue into "YYYY-MM" keys. */
export function revenueByMonth(payments: PortalPayment[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const payment of payments) {
    const date = new Date(payment.created_at);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    totals.set(key, (totals.get(key) ?? 0) + payment.amount);
  }
  return totals;
}
