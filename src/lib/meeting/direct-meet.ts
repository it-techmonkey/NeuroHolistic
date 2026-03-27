/**
 * Direct Google Meet API client.
 * Creates Meet spaces directly without a calendar event.
 * Only works with Google Workspace accounts (not personal Gmail).
 */

import { GOOGLE_OAUTH_CONFIG } from '@/lib/google/oauth';
import { getValidAccessToken } from '@/lib/google/token-service';

interface DirectMeetInput {
  therapistId: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  title?: string;
}

interface DirectMeetResult {
  meetLink: string;
  spaceName: string;
}

/**
 * Create a Google Meet space directly using the Meet API.
 * Only works for Google Workspace accounts.
 * Returns null if the API call fails (e.g., personal Gmail account).
 */
export async function createDirectMeetSpace(
  input: DirectMeetInput
): Promise<DirectMeetResult | null> {
  try {
    const accessToken = await getValidAccessToken(input.therapistId);
    const meetEndpoint = GOOGLE_OAUTH_CONFIG.meetEndpoint;

    // Create a Meet space with conferencing record
    const createResponse = await fetch(`${meetEndpoint}/spaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          accessType: 'OPEN',
          entryPointAccess: 'ALL',
          moderation: {
            moderationType: 'NONE',
          },
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.warn(`[DirectMeetAPI] Failed to create space: ${createResponse.status} - ${errorText}`);
      return null;
    }

    const space = await createResponse.json();
    const spaceName = space.name;
    
    // Extract meeting code from space name (format: spaces/{meetingCode})
    const meetingCode = spaceName.split('/').pop();
    const meetLink = `https://meet.google.com/${meetingCode}`;

    // Update space with conference record and time constraints
    const conferenceRecordResponse = await fetch(
      `${meetEndpoint}/${spaceName}/conferenceRecord`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: input.startTime,
          endTime: input.endTime,
        }),
      }
    );

    if (!conferenceRecordResponse.ok) {
      // Non-fatal: we still have a working Meet link
      console.warn('[DirectMeetAPI] Failed to update conference record, but Meet link is valid');
    }

    console.log('[DirectMeetAPI] Created Meet space:', meetLink);
    return {
      meetLink,
      spaceName,
    };
  } catch (error) {
    console.warn('[DirectMeetAPI] Error creating Meet space:', error);
    return null;
  }
}

/**
 * Check if the Direct Meet API is available for the therapist's account.
 * Tests by attempting to get an access token with the meetings.space.created scope.
 */
export async function isDirectMeetAvailable(therapistId: string): Promise<boolean> {
  try {
    const accessToken = await getValidAccessToken(therapistId);
    
    // Make a lightweight API call to check if Meet API is accessible
    const response = await fetch(`${GOOGLE_OAUTH_CONFIG.meetEndpoint}/spaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config: {} }),
    });

    // If successful or returns a specific error, Meet API is available
    // 400 with specific error means Workspace but bad request (still available)
    // 403 means personal Gmail (not available)
    if (response.ok || response.status === 400) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}
