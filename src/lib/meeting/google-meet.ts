/**
 * Google Meet link generation using hybrid approach.
 * 
 * Strategy:
 * 1. Try Direct Meet API (faster, no calendar event, Workspace only)
 * 2. Fall back to Calendar API (works for both Workspace and personal Gmail)
 * 
 * Note: Service account fallback is removed as it's blocked by org policy.
 */

import { google } from 'googleapis';
import { getValidAccessToken, isGoogleCalendarConnected } from '@/lib/google/token-service';
import { createDirectMeetSpace } from './direct-meet';

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
  calendarEventId: string | null;
  usedTherapistCalendar: boolean;
  usedDirectMeet: boolean;
}

/**
 * Create a Google Meet link using hybrid approach.
 * 
 * For therapists with Google Workspace:
 * - Tries Direct Meet API first (faster, no calendar clutter)
 * - Falls back to Calendar API if Direct Meet fails
 * 
 * For therapists with personal Gmail:
 * - Uses Calendar API directly (Direct Meet only works with Workspace)
 */
export async function createMeetEvent(input: MeetEventInput): Promise<MeetEventResult> {
  // If no therapist ID, we can't use OAuth - this should not happen in production
  if (!input.therapistId) {
    throw new Error('therapistId is required for creating Meet events');
  }

  try {
    const isConnected = await isGoogleCalendarConnected(input.therapistId);
    
    if (!isConnected) {
      throw new Error('Therapist has not connected their Google account');
    }

    // Step 1: Try Direct Meet API (Workspace accounts)
    console.log('[CreateMeetEvent] Attempting Direct Meet API...');
    const directMeetResult = await createDirectMeetSpace({
      therapistId: input.therapistId,
      startTime: input.startDateTime,
      endTime: input.endDateTime,
      title: input.summary,
    });

    if (directMeetResult) {
      // Direct Meet API succeeded (Workspace account)
      console.log('[CreateMeetEvent] Direct Meet API succeeded:', directMeetResult.meetLink);
      
      // Create calendar event for the booking record (optional, for visibility)
      // This ensures the therapist can see the booking in their calendar
      try {
        const accessToken = await getValidAccessToken(input.therapistId);
        const calendar = getOAuthCalendarClient(accessToken);
        
        await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: input.summary,
            description: `${input.description ?? ''}\n\nJoin: ${directMeetResult.meetLink}`,
            start: { dateTime: input.startDateTime, timeZone: 'Asia/Dubai' },
            end: { dateTime: input.endDateTime, timeZone: 'Asia/Dubai' },
            attendees: (input.attendeeEmails ?? []).map((email) => ({ email })),
            location: directMeetResult.meetLink,
            guestsCanSeeOtherGuests: false,
          },
        });
      } catch (calError) {
        // Non-fatal: calendar event creation failed but Meet link is valid
        console.warn('[CreateMeetEvent] Failed to create calendar event for visibility:', calError);
      }

      return {
        meetLink: directMeetResult.meetLink,
        calendarEventId: null, // Direct Meet doesn't create a calendar event with ID
        usedTherapistCalendar: true,
        usedDirectMeet: true,
      };
    }

    // Step 2: Fall back to Calendar API (works for both Workspace and Gmail)
    console.log('[CreateMeetEvent] Direct Meet API not available, using Calendar API...');
    return await createMeetEventViaCalendar(input);

  } catch (error) {
    console.error('[CreateMeetEvent] Failed to create Meet event:', error);
    throw error;
  }
}

/**
 * Create a Meet link via Google Calendar API.
 * This approach works for both Google Workspace and personal Gmail accounts.
 */
async function createMeetEventViaCalendar(input: MeetEventInput): Promise<MeetEventResult> {
  if (!input.therapistId) {
    throw new Error('therapistId is required');
  }

  const accessToken = await getValidAccessToken(input.therapistId);
  const calendar = getOAuthCalendarClient(accessToken);

  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    sendUpdates: 'all',
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

  console.log('[CreateMeetEvent] Created Meet event via Calendar API:', meetLink);
  
  return {
    meetLink,
    calendarEventId: event.data.id ?? '',
    usedTherapistCalendar: true,
    usedDirectMeet: false,
  };
}

/**
 * Update an existing Google Calendar event (e.g. for rescheduling).
 * Uses therapist's connected Google account.
 */
export async function updateMeetEvent(
  calendarEventId: string,
  input: Partial<MeetEventInput>
): Promise<MeetEventResult> {
  if (!input.therapistId) {
    throw new Error('therapistId is required for updating Meet events');
  }

  try {
    const isConnected = await isGoogleCalendarConnected(input.therapistId);
    if (!isConnected) {
      throw new Error('Therapist has not connected their Google account');
    }

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
      usedDirectMeet: false,
    };
  } catch (error) {
    console.error('[UpdateMeetEvent] Failed to update Meet event:', error);
    throw error;
  }
}
