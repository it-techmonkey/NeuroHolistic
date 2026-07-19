export type ContentLocale = "en" | "ar";

export interface RetreatLocaleFields {
  title: string;
  subtitle?: string;
  hook?: string;
  /** Short blurb for the grid card; falls back to `description` when omitted. */
  cardDescription?: string;
  description: string;
  closingLine?: string;
  ctaLabel?: string;
  date: string;
  location: string;
  duration?: string;
  time?: string;
}

export interface RetreatItem {
  id: string;
  image: string;
  slug?: string;
  capacity?: number;
  tags?: string[];
  /** True when there's no fixed date/booking yet — CTA collects waitlist signups instead. */
  isWaitlistOnly?: boolean;
  locales: {
    en: RetreatLocaleFields;
    ar: RetreatLocaleFields;
  };
}

export type FeaturedRetreatData = RetreatItem;
