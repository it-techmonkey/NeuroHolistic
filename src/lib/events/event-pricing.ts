/**
 * Fixed pricing for paid live events. Server-side source of truth —
 * never trust an amount sent from the client.
 */

/** UAE VAT, applied on top of the advertised base price. */
export const VAT_RATE = 0.05;

export interface EventPrice {
  /** Price before VAT. */
  baseAed: number;
  /** VAT charged on top of the base. */
  vatAed: number;
  /** What the customer is actually charged — base + VAT. */
  amountAed: number;
  displayLabel: { en: string; ar: string };
}

function withVat(baseAed: number, displayLabel: EventPrice['displayLabel']): EventPrice {
  const vatAed = Math.round(baseAed * VAT_RATE * 100) / 100;
  return {
    baseAed,
    vatAed,
    amountAed: Math.round((baseAed + vatAed) * 100) / 100,
    displayLabel,
  };
}

export const EVENT_PRICES: Record<string, EventPrice> = {
  "neuroholistic-consciousness-quantum-leap": withVat(1000, {
    en: "AED 1,000 + 5% VAT (AED 1,050 total)",
    ar: "1,000 درهم إماراتي + 5% ضريبة القيمة المضافة (الإجمالي 1,050 درهم)",
  }),
};

export function getEventPrice(eventId: string): EventPrice | null {
  return EVENT_PRICES[eventId] ?? null;
}
