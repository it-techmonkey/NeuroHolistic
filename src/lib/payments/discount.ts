import { getServiceSupabase } from '@/lib/supabase/service';
import { getPrice, type ProgramType, type PaymentOption } from './pricing';

export type DiscountPercent = 10 | 15 | 20;

export interface ActiveDiscount {
  id: string;
  clientId: string;
  discountPercent: DiscountPercent;
  assignedBy: string;
  reason: string | null;
  createdAt: string;
}

export interface DiscountedPrice {
  originalPrice: number;
  discountedPrice: number;
  discountPercent: DiscountPercent;
  savings: number;
}

const VALID_DISCOUNTS: readonly DiscountPercent[] = [10, 15, 20];

export function isValidDiscount(value: unknown): value is DiscountPercent {
  return typeof value === 'number' && VALID_DISCOUNTS.includes(value as DiscountPercent);
}

/**
 * Fetch the active discount for a given user. Returns null if none exists.
 */
export async function getActiveDiscount(userId: string): Promise<ActiveDiscount | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('client_discounts')
    .select('id, client_id, discount_percent, assigned_by, reason, created_at')
    .eq('client_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    clientId: data.client_id,
    discountPercent: data.discount_percent as DiscountPercent,
    assignedBy: data.assigned_by,
    reason: data.reason,
    createdAt: data.created_at,
  };
}

/**
 * Apply a discount percentage to an original price.
 */
export function applyDiscount(originalPrice: number, discountPercent: DiscountPercent): DiscountedPrice {
  const factor = discountPercent / 100;
  const discountedPrice = Math.round(originalPrice * (1 - factor));
  return {
    originalPrice,
    discountedPrice,
    discountPercent,
    savings: originalPrice - discountedPrice,
  };
}

/**
 * Get the discounted price for a user, combining discount lookup with pricing.
 * Returns the standard price result if no discount exists.
 */
export async function getDiscountedPrice(
  userId: string,
  programType: ProgramType,
  option: PaymentOption,
  therapistName?: string | null,
  therapistSlug?: string | null
): Promise<DiscountedPrice> {
  const basePrice = getPrice(programType, option, therapistName, therapistSlug);
  const discount = await getActiveDiscount(userId);

  if (!discount) {
    return {
      originalPrice: basePrice,
      discountedPrice: basePrice,
      discountPercent: 0 as DiscountPercent,
      savings: 0,
    };
  }

  return applyDiscount(basePrice, discount.discountPercent);
}
