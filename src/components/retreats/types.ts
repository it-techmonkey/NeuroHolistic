export type ContentLocale = "en" | "ar";

export interface RetreatLocaleFields {
  title: string;
  description: string;
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
  locales: {
    en: RetreatLocaleFields;
    ar: RetreatLocaleFields;
  };
}

export type FeaturedRetreatData = RetreatItem;
