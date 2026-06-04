/**
 * Centralized payment configuration for NeuroHolistic.
 */

// Dr. Fawzia Yassmina's slug/identifier
export const DR_FAWZIA_SLUG = 'fawzia-yassmina';
export const DR_FAWZIA_NAME = 'Fawzia Yassmina';

export type ProgramType = 'private' | 'group';
export type PaymentOption = 'full' | 'per_session';

export interface PaymentConfig {
  fullProgram: number;
  perSession: number;
}

// Standard pricing (for all therapists except Dr. Fawzia)
export const STANDARD_PRICING: PaymentConfig = {
  fullProgram: 7700,
  perSession: 800,
};

// Dr. Fawzia Yassmina's pricing
export const DR_FAWZIA_PRICING: PaymentConfig = {
  fullProgram: 9000,
  perSession: 1000,
};

// Group program pricing (same for all therapists)
export const GROUP_PRICING: PaymentConfig = {
  fullProgram: 4500,
  perSession: 500,
};

// Academy pricing
export const ACADEMY_PRICING = {
  fullProgram: 25000,
  installment: 5000,
  installmentCount: 5,
};

/**
 * Check if a therapist is Dr. Fawzia Yassmina.
 */
export function isDrFawzia(therapistName?: string | null, therapistSlug?: string | null): boolean {
  if (!therapistName && !therapistSlug) return false;

  const nameLower = (therapistName || '').toLowerCase().trim();
  const slugLower = (therapistSlug || '').toLowerCase().trim();

  if (
    slugLower === DR_FAWZIA_SLUG ||
    slugLower === 'dr-fawzia-yassmina' ||
    slugLower === 'dr-fawzia-yasmina' ||
    slugLower === 'fawzia-yasmina'
  ) {
    return true;
  }

  // Name: Fawzia + Yassmina or common "Yasmina" spelling
  if (!nameLower.includes('fawzia')) return false;
  return nameLower.includes('yassmina') || nameLower.includes('yasmina');
}

/**
 * Get pricing configuration based on program type and therapist.
 */
export function getPricingConfig(
  programType: ProgramType,
  therapistName?: string | null,
  therapistSlug?: string | null
): PaymentConfig {
  if (programType === 'group') {
    return GROUP_PRICING;
  }

  // For private programs, check if it's Dr. Fawzia
  if (isDrFawzia(therapistName, therapistSlug)) {
    return DR_FAWZIA_PRICING;
  }

  return STANDARD_PRICING;
}

/**
 * Get price for a specific program type, payment option, and therapist.
 */
export function getPrice(
  programType: ProgramType,
  option: PaymentOption,
  therapistName?: string | null,
  therapistSlug?: string | null
): number {
  const config = getPricingConfig(programType, therapistName, therapistSlug);
  return option === 'full' ? config.fullProgram : config.perSession;
}

/**
 * Format price with AED currency.
 */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString()} AED`;
}

/**
 * Calculate per-session price for full program display.
 */
export function getPerSessionFromFull(fullPrice: number): number {
  return Math.round(fullPrice / 10);
}
