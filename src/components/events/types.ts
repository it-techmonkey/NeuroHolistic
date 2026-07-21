export type ContentLocale = "en" | "ar";

export type EventTypeKey = "workshop" | "retreat" | "online";

export interface EventContentSection {
  heading: string;
  intro?: string;
  items: string[];
}

export interface EventLocaleFields {
  title: string;
  subtitle?: string;
  hook?: string;
  /** Short blurb for the list/card row; falls back to `description` when omitted. */
  cardDescription?: string;
  description: string;
  sections?: EventContentSection[];
  closingLine?: string;
  price?: string;
  ctaLabel?: string;
  date: string;
  time?: string;
  location: string;
  typeLabel: string;
}

export interface EventSessionDate {
  /** Stable machine value stored with the registration, e.g. "2026-09-09" */
  value: string;
  label: { en: string; ar: string };
}

export interface EventItem {
  id: string;
  image: string;
  slug?: string;
  capacity?: number;
  typeKey: EventTypeKey;
  /** Stable filter grouping, e.g. "2025-04" */
  filterPeriod: string;
  /** When true, the CTA collects payment via Ziina instead of a free registration form. */
  isPaid?: boolean;
  /** When set (2+ entries), the registration form asks the user to pick one session date. */
  sessionDates?: EventSessionDate[];
  locales: {
    en: EventLocaleFields;
    ar: EventLocaleFields;
  };
}
