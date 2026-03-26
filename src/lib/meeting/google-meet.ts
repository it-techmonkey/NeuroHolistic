/**
 * Google Meet link generation via Google Calendar API.
 * 
 * Supports two modes:
 * 1. Therapist's connected Google OAuth account (if available)
 * 2. Service account fallback (existing behavior)
 */

import { google } from 'googleapis';
import { getValidAccessToken, isGoogleCalendarConnected } from '@/lib/google/token-service';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/**
 * Get calendar client using service account (fallback)
 */
function getServiceAccountCalendarClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  return google.calendar({ version: 'v3', auth });
}

/**
 * Get calendar client using therapist's OAuth token
 */
function getOAuthCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth });
}

interface MeetEventInput {
  summary: string;
  description?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  attendeeEmails?: string[];
  therapistId?: string;  // Optional: therapist's user ID for OAuth
}

interface MeetEventResult {
  meetLink: string;
  calendarEventId: string;
  usedTherapistCalendar: boolean;
}

/**
 * Create a Google Calendar event with an auto-generated Google Meet link.
 * Uses therapist's connected Google account if available, otherwise falls back to service account.
 */
export async function createMeetEvent(input: MeetEventInput): Promise<MeetEventResult> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';
  
  // Try to use therapist's connected Google account first
  if (input.therapistId) {
    try {
      const isConnected = await isGoogleCalendarConnected(input.therapistId);
      if (isConnected) {
        const accessToken = await getValidAccessToken(input.therapistId);
        const calendar = getOAuthCalendarClient(accessToken);

        const event = await calendar.events.insert({
          calendarId: 'primary', // Use therapist's primary calendar
          conferenceDataVersion: 1,
          sendUpdates: 'all', // Send invites to attendees
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

        console.log('[CreateMeetEvent] Using therapist\'s Google Calendar');
        return {
          meetLink,
          calendarEventId: event.data.id ?? '',
          usedTherapistCalendar: true,
        };
      }
    } catch (error) {
      console.warn('[CreateMeetEvent] Failed to use therapist calendar, falling back to service account:', error);
    }
  }

  // Fallback to service account
  console.log('[CreateMeetEvent] Using service account');
  const calendar = getServiceAccountCalendarClient();

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
    usedTherapistCalendar: false,
  };
}

/**
 * Update an existing Google Calendar event (e.g. for rescheduling).
 * Uses therapist's connected Google account if available.
 */
export async function updateMeetEvent(
  calendarEventId: string,
  input: Partial<MeetEventInput>
): Promise<MeetEventResult> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';

  // Try to use therapist's connected Google account first
  if (input.therapistId) {
    try {
      const isConnected = await isGoogleCalendarConnected(input.therapistId);
      if (isConnected) {
        const accessToken = await getValidAccessToken(input.therapistId);
        const calendar = getOAuthCalendarClient(accessToken);

        const updateData: Record<string, unknown> = {};
        if (input.startDateTime) updateData.start = { dateTime: input.startDateTime, timeZone: 'Asia/Dubai' };
        if (input.endDateTime) updateData.end = { dateTime: input.endDateTime, timeZone: 'Asia/Dubai' };
        if (input.summary) updateData.summary = input.summary;
        if (input.description) updateData.description = input.description;

        const event = await calendar.events.patch({
          calendarId: 'primary',
          eventId: calendarEventId,
          sendUpdates: 'all',
          requestBody: updateData,
        });

        const meetLink =
          event.data.hangoutLink ??
          event.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri ??
          '';

        return {
          meetLink,
          calendarEventId: event.data.id ?? '',
          usedTherapistCalendar: true,
        };
      }
    } catch (error) {
      console.warn('[UpdateMeetEvent] Failed to use therapist calendar, falling back to service account:', error);
    }
  }

  // Fallback to service account
  const calendar = getServiceAccountCalendarClient();

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
    usedTherapistCalendar: false,
  };
}
