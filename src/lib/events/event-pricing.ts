/**
 * Fixed pricing for paid live events. Server-side source of truth —
 * never trust an amount sent from the client.
 */

export interface EventPrice {
  amountAed: number;
  displayLabel: { en: string; ar: string };
}

export const EVENT_PRICES: Record<string, EventPrice> = {
  "neuroholistic-consciousness-quantum-leap": {
    amountAed: 1000,
    displayLabel: {
      en: "AED 1,000 / $274",
      ar: "1,000 درهم إماراتي - 274 دولار أمريكي",
    },
  },
  "neuroholistic-consciousness-quantum-leap-monthly": {
    amountAed: 1000,
    displayLabel: {
      en: "AED 1,000 / $274",
      ar: "1,000 درهم إماراتي - 274 دولار أمريكي",
    },
  },
};

export function getEventPrice(eventId: string): EventPrice | null {
  return EVENT_PRICES[eventId] ?? null;
}
