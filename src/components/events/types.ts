export type ContentLocale = "en" | "ar";

export type EventTypeKey = "workshop" | "retreat" | "online";

export interface EventLocaleFields {
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  typeLabel: string;
}

export interface EventItem {
  id: string;
  image: string;
  slug?: string;
  capacity?: number;
  typeKey: EventTypeKey;
  /** Stable filter grouping, e.g. "2025-04" */
  filterPeriod: string;
  locales: {
    en: EventLocaleFields;
    ar: EventLocaleFields;
  };
}
