import { google } from 'googleapis';

interface CreateMeetEventParams {
  summary: string;
  description?: string;
  date: string;
  time: string;
  durationMinutes?: number;
  attendeeEmails?: string[];
}

interface MeetEventResult {
  eventId: string | null;
  meetLink: string;
  provider: 'google-calendar' | 'fallback';
}

const GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

function getFallbackMeetLink(): string {
  return process.env.GOOGLE_MEET_STATIC_LINK || 'https://meet.google.com/new';
}

function getGoogleCalendarConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!clientEmail || !privateKey || !calendarId) {
    return null;
  }

  return { clientEmail, privateKey, calendarId };
}

function toDateRange(date: string, time: string, durationMinutes: number) {
  const [hourPart, minutePart] = time.split(':');
  const year = Number.parseInt(date.slice(0, 4), 10);
  const month = Number.parseInt(date.slice(5, 7), 10) - 1;
  const day = Number.parseInt(date.slice(8, 10), 10);
  const hour = Number.parseInt(hourPart, 10);
  const minute = Number.parseInt(minutePart, 10);

  const start = new Date(Date.UTC(year, month, day, hour - 4, minute));
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return { start, end };
}

export async function createGoogleMeetEvent(params: CreateMeetEventParams): Promise<MeetEventResult> {
  const config = getGoogleCalendarConfig();
  const fallbackMeetLink = getFallbackMeetLink();

  if (!config) {
    return {
      eventId: null,
      meetLink: fallbackMeetLink,
      provider: 'fallback',
    };
  }

  try {
    const auth = new google.auth.JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes: GOOGLE_CALENDAR_SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const durationMinutes = params.durationMinutes ?? 60;
    const { start, end } = toDateRange(params.date, params.time, durationMinutes);

    const response = await calendar.events.insert({
      calendarId: config.calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: {
          dateTime: start.toISOString(),
          timeZone: 'Asia/Dubai',
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: 'Asia/Dubai',
        },
        attendees: (params.attendeeEmails ?? []).map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const eventId = response.data.id ?? null;
    const meetLink =
      response.data.hangoutLink ||
      response.data.conferenceData?.entryPoints?.find((entryPoint) => entryPoint.entryPointType === 'video')?.uri ||
      fallbackMeetLink;

    return {
      eventId,
      meetLink,
      provider: 'google-calendar',
    };
  } catch (error) {
    console.error('[GoogleMeet] Failed to create calendar event:', error);
    return {
      eventId: null,
      meetLink: fallbackMeetLink,
      provider: 'fallback',
    };
  }
}

export async function updateGoogleMeetEvent(
  eventId: string,
  params: Pick<CreateMeetEventParams, 'date' | 'time' | 'durationMinutes'>
): Promise<boolean> {
  const config = getGoogleCalendarConfig();
  if (!config) return false;

  try {
    const auth = new google.auth.JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes: GOOGLE_CALENDAR_SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const durationMinutes = params.durationMinutes ?? 60;
    const { start, end } = toDateRange(params.date, params.time, durationMinutes);

    await calendar.events.patch({
      calendarId: config.calendarId,
      eventId,
      requestBody: {
        start: { dateTime: start.toISOString(), timeZone: 'Asia/Dubai' },
        end: { dateTime: end.toISOString(), timeZone: 'Asia/Dubai' },
      },
    });

    return true;
  } catch (error) {
    console.error('[GoogleMeet] Failed to update calendar event:', error);
    return false;
  }
}