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
