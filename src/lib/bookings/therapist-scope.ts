/**
 * PostgREST `.or()` filter for rows assigned to a therapist (matches GET /api/bookings).
 * Bookings may store therapist as UUID, slug, display name, or therapist_user_id.
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function therapistBookingsOrFilter(
  therapistUserId: string,
  fullName: string | null | undefined,
  /** Raw `therapistId` from booking UI (often slug when user picked a profile-only therapist). */
  therapistIdRequestParam?: string | null
): string {
  const filters = [
    `therapist_user_id.eq.${therapistUserId}`,
    `therapist_id.eq.${therapistUserId}`,
  ];
  if (fullName) {
    filters.push(`therapist_name.eq.${fullName}`);
    filters.push(`therapist_id.eq.${generateSlug(fullName)}`);
  }
  if (therapistIdRequestParam && !UUID_REGEX.test(therapistIdRequestParam)) {
    filters.push(`therapist_id.eq.${therapistIdRequestParam}`);
  }
  return filters.join(',');
}

/** One-hour sessions: emit start times t where [t, t+60m) ⊆ [windowStart, windowEnd]. */
export function generateHourlySlotStarts(windowStart: string, windowEnd: string): string[] {
  const parse = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const fmt = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  const startM = parse(windowStart);
  const endM = parse(windowEnd);
  const step = 60;
  const out: string[] = [];
  for (let m = startM; m + step <= endM; m += step) {
    out.push(fmt(m));
  }
  return out;
}

/** Default booking day when therapist has no availability rows (9:00–18:00, hourly). */
export function defaultHourlyBookingSlots(): string[] {
  return generateHourlySlotStarts('09:00', '18:00');
}

/** Client-side / memory filter when query already constrained by client (user_id / email). */
export function bookingMatchesTherapist(
  b: {
    therapist_user_id?: string | null;
    therapist_id?: string | null;
    therapist_name?: string | null;
  },
  therapistUserId: string,
  therapistFullName: string | null | undefined
): boolean {
  if (b.therapist_user_id === therapistUserId) return true;
  if (b.therapist_id === therapistUserId) return true;
  if (therapistFullName && b.therapist_name === therapistFullName) return true;
  if (therapistFullName && b.therapist_id === generateSlug(therapistFullName)) return true;
  return false;
}
