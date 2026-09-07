export type ContentLocale = "en" | "ar";

export type EventTypeKey = "workshop" | "retreat" | "online";

export interface EventContentSection {
  heading: string;
  intro?: string;
  /** Bulleted list items. Use for genuine lists only. */
  items?: string[];
  /**
   * Flowing body paragraphs, rendered without bullets. Most narrative
   * sections in the source documents are prose, not lists — using `items`
   * for those adds bullets the client never wrote.
   */
  paragraphs?: string[];
  /** Closing prose shown after the list, e.g. a summarising statement. */
  outro?: string;
}

/** One row of the journey/schedule table shown on the detail page. */
export interface EventScheduleRow {
  part: string;
  description: string;
  date: string;
}

export interface EventSchedule {
  heading: string;
  intro?: string;
  columns: { part: string; description: string; date: string };
  rows: EventScheduleRow[];
}

export interface EventLocaleFields {
  title: string;
  subtitle?: string;
  hook?: string;
  /** Short blurb for the list/card row; falls back to `description` when omitted. */
  cardDescription?: string;
  description: string;
  sections?: EventContentSection[];
  /** Optional structured schedule table (e.g. a multi-part journey). */
  schedule?: EventSchedule;
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

/**
 * Per-session wording for the day-before / hour-before reminder emails.
 * The structure of those emails is fixed (client-approved); only these
 * phrases change from session to session, so the first session reads
 * "Tomorrow, we begin" while the last reads "Tomorrow, we complete the
 * journey".
 */
export interface EventSessionEmailCopy {
  /** Opening line of the day-before email, e.g. "Tomorrow, we begin." */
  dayBeforeLead: { en: string; ar: string };
  /** Follow-up sentence of the day-before email. */
  dayBeforeContext: { en: string; ar: string };
  /** Opening line of the hour-before email, e.g. "We begin in one hour." */
  hourBeforeLead: { en: string; ar: string };
  /** Follow-up sentence of the hour-before email. */
  hourBeforeContext: { en: string; ar: string };
  /** Date line in the day-before email, e.g. "October 9, 2026". */
  dateLine: { en: string; ar: string };
  /** Date line in the hour-before email, e.g. "Today, October 9". */
  todayLine: { en: string; ar: string };
}

/** A single live session of an event, used for Meet links and reminders. */
export interface EventLiveSession {
  /** Stable key, e.g. "liberation-1". Never change it once registrations exist. */
  key: string;
  title: { en: string; ar: string };
  /** Local Dubai (Asia/Dubai) wall-clock start/end, ISO without offset. */
  startsAt: string;
  endsAt: string;
  /** Wording used by this session's reminder emails. */
  emailCopy?: EventSessionEmailCopy;
}

/** One row of the "journey overview" table used in onboarding emails. */
export interface EventJourneyRow {
  stage: { en: string; ar: string };
  location: { en: string; ar: string };
  date: { en: string; ar: string };
  time: { en: string; ar: string };
}

/**
 * A specific, date-scheduled onboarding email — distinct from the generic
 * "N hours before every session" reminders. Used for a curated lead-up
 * sequence (e.g. a 1-week-out email, a day-before email) tied to fixed
 * calendar dates rather than computed offsets.
 */
export interface EventScheduledEmail {
  /** Stable key, e.g. "liberation-week-before". Never reuse across templates. */
  key: string;
  /** Local Dubai (Asia/Dubai) wall-clock send time, ISO without offset. */
  sendAt: string;
  /** Which template to render. */
  template: "week_before" | "day_before" | "hour_before";
  /** Which live session (by key) this email is building up to — used to pull the Meet link. */
  targetSessionKey: string;
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
  /**
   * Email of the therapist hosting the event. The Meet link and calendar entry
   * are created on this person's connected Google account.
   */
  hostTherapistEmail?: string;
  /** Live sessions that receive a Meet link and reminder emails. */
  liveSessions?: EventLiveSession[];
  /** When true, this event is also featured on the /academy page. */
  showOnAcademyPage?: boolean;
  /**
   * Reply-to for every automated email about this event. Emails are still
   * sent from the platform's verified address (BOOKING_EMAIL_FROM); replies
   * land in this inbox.
   */
  replyToEmail?: string;
  /** Invite link for the private participant community (e.g. WhatsApp). */
  communityLink?: string | null;
  /** "Journey overview" table rendered in onboarding emails, per locale. */
  journeyTable?: EventJourneyRow[];
  /** Curated, date-scheduled onboarding emails (distinct from the generic per-session reminders). */
  scheduledEmails?: EventScheduledEmail[];
  locales: {
    en: EventLocaleFields;
    ar: EventLocaleFields;
  };
}
