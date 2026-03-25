/**
 * Google Meet link generation via Google Calendar API.
 * Uses a Google service account to create calendar events with Meet links.
 */

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  return google.calendar({ version: 'v3', auth });
}

interface MeetEventInput {
  summary: string;
  description?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  attendeeEmails?: string[];
}

interface MeetEventResult {
  meetLink: string;
  calendarEventId: string;
}

/**
 * Create a Google Calendar event with an auto-generated Google Meet link.
 */
export async function createMeetEvent(input: MeetEventInput): Promise<MeetEventResult> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';

  const event = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.summary,
      description: input.description ?? '',
      start: { dateTime: input.startDateTime, timeZone: 'Asia/Dubai' },
      end: { dateTime: input.endDateTime, timeZone: 'Asia/Dubai' },
      attendees: (input.attendeeEmails ?? []).map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `nh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const meetLink =
    event.data.hangoutLink ??
    event.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri ??
    '';

  return {
    meetLink,
    calendarEventId: event.data.id ?? '',
  };
}

/**
 * Update an existing Google Calendar event (e.g. for rescheduling).
 */
export async function updateMeetEvent(
  calendarEventId: string,
  input: Partial<MeetEventInput>
): Promise<MeetEventResult> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';

  const updateData: Record<string, unknown> = {};
  if (input.startDateTime) updateData.start = { dateTime: input.startDateTime, timeZone: 'Asia/Dubai' };
  if (input.endDateTime) updateData.end = { dateTime: input.endDateTime, timeZone: 'Asia/Dubai' };
  if (input.summary) updateData.summary = input.summary;
  if (input.description) updateData.description = input.description;

  const event = await calendar.events.patch({
    calendarId,
    eventId: calendarEventId,
    requestBody: updateData,
  });

  const meetLink =
    event.data.hangoutLink ??
    event.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri ??
    '';

  return {
    meetLink,
    calendarEventId: event.data.id ?? '',
  };
}