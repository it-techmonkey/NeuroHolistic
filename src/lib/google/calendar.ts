import { GOOGLE_OAUTH_CONFIG } from './oauth';

/**
 * Google Calendar Event Types
 */
export interface CalendarEventInput {
  summary: string;
  description?: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  attendees: Array<{ email: string; displayName?: string }>;
  timeZone?: string;
}

export interface CalendarEventResult {
  eventId: string;
  meetLink: string;
  htmlLink: string;
  hangoutLink?: string;
}

/**
 * Create a Google Calendar event with Meet link
 */
export async function createCalendarEvent(
  accessToken: string,
  eventInput: CalendarEventInput
): Promise<CalendarEventResult> {
  const { summary, description, startTime, endTime, attendees, timeZone = 'UTC' } = eventInput;

  const event = {
    summary,
    description,
    start: {
      dateTime: startTime,
      timeZone,
    },
    end: {
      dateTime: endTime,
      timeZone,
    },
    attendees: attendees.map(a => ({
      email: a.email,
      displayName: a.displayName || a.email,
    })),
    // Request Google Meet conference
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    // Send invitations to attendees
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    // Visibility
    visibility: 'private',
    // Status
    status: 'confirmed',
  };

  const response = await fetch(
    `${GOOGLE_OAUTH_CONFIG.calendarEndpoint}/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  const createdEvent = await response.json();

  // Extract Meet link from conference data
  const meetLink = createdEvent.conferenceData?.entryPoints?.find(
    (ep: any) => ep.entryPointType === 'video'
  )?.uri || createdEvent.hangoutLink || '';

  return {
    eventId: createdEvent.id,
    meetLink,
    htmlLink: createdEvent.htmlLink,
    hangoutLink: createdEvent.hangoutLink,
  };
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  eventInput: Partial<CalendarEventInput>
): Promise<{ htmlLink: string }> {
  const event: any = {};

  if (eventInput.summary) event.summary = eventInput.summary;
  if (eventInput.description) event.description = eventInput.description;
  if (eventInput.startTime) {
    event.start = {
      dateTime: eventInput.startTime,
      timeZone: eventInput.timeZone || 'UTC',
    };
  }
  if (eventInput.endTime) {
    event.end = {
      dateTime: eventInput.endTime,
      timeZone: eventInput.timeZone || 'UTC',
    };
  }

  const response = await fetch(
    `${GOOGLE_OAUTH_CONFIG.calendarEndpoint}/calendars/primary/events/${eventId}?sendUpdates=all`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update calendar event: ${error}`);
  }

  const updatedEvent = await response.json();

  return {
    htmlLink: updatedEvent.htmlLink,
  };
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const response = await fetch(
    `${GOOGLE_OAUTH_CONFIG.calendarEndpoint}/calendars/primary/events/${eventId}?sendUpdates=all`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 410) { // 410 = already deleted
    const error = await response.text();
    throw new Error(`Failed to delete calendar event: ${error}`);
  }
}

/**
 * Get busy times from calendar (for availability checking)
 */
export async function getFreeBusy(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<Array<{ start: string; end: string }>> {
  const response = await fetch(
    `${GOOGLE_OAUTH_CONFIG.calendarEndpoint}/freeBusy`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: 'primary' }],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get free/busy times: ${error}`);
  }

  const data = await response.json();
  const busyTimes = data.calendars?.primary?.busy || [];

  return busyTimes.map((busy: { start: string; end: string }) => ({
    start: busy.start,
    end: busy.end,
  }));
}
