type SessionLike = {
  date: string;
  time: string;
  status?: string | null;
};

function getDubaiNowParts(reference = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(reference);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
}

function compareSessionDateTime(a: Pick<SessionLike, 'date' | 'time'>, b: Pick<SessionLike, 'date' | 'time'>) {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date);
  }

  return a.time.localeCompare(b.time);
}

export function isUpcomingSession(session: Pick<SessionLike, 'date' | 'time'>, reference = new Date()) {
  const now = getDubaiNowParts(reference);

  return compareSessionDateTime(session, now) >= 0;
}

export function isPastSession(session: Pick<SessionLike, 'date' | 'time'>, reference = new Date()) {
  const now = getDubaiNowParts(reference);

  return compareSessionDateTime(session, now) < 0;
}

export function sortSessionsAsc<T extends Pick<SessionLike, 'date' | 'time'>>(sessions: T[]) {
  return [...sessions].sort(compareSessionDateTime);
}

export function sortSessionsDesc<T extends Pick<SessionLike, 'date' | 'time'>>(sessions: T[]) {
  return [...sessions].sort((a, b) => compareSessionDateTime(b, a));
}

export function getNextConfirmedSession<T extends SessionLike>(sessions: T[]) {
  return sortSessionsAsc(
    sessions.filter((session) => session.status === 'confirmed' && isUpcomingSession(session))
  )[0] ?? null;
}

export function toDubaiDateTime(date: string, time: string) {
  return `${date}T${time}:00+04:00`;
}

export function getDubaiToday(reference = new Date()) {
  return getDubaiNowParts(reference).date;
}

export function getDubaiDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dubai',
    weekday: 'short',
  });
  const weekday = formatter.format(date);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? date.getDay();
}
