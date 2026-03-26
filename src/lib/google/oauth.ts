/**
 * Google OAuth Configuration
 * 
 * Setup Instructions:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project or select existing
 * 3. Enable Google Calendar API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized redirect URI: ${NEXT_PUBLIC_APP_URL}/api/google/callback
 */

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`,
  
  // Scopes for Google Calendar
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],
  
  // Google OAuth endpoints
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
  calendarEndpoint: 'https://www.googleapis.com/calendar/v3',
};

/**
 * Generate the Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    access_type: 'offline', // Required to get refresh_token
    prompt: 'consent', // Force consent screen to ensure refresh_token
    state: state, // CSRF protection
  });

  return `${GOOGLE_OAUTH_CONFIG.authEndpoint}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
      redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + data.expires_in * 1000,
    scope: data.scope,
    token_type: data.token_type,
  };
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // Some providers don't return new refresh_token
    expiry_date: Date.now() + data.expires_in * 1000,
    scope: data.scope,
    token_type: data.token_type,
  };
}

/**
 * Revoke a Google token (used for disconnect)
 */
export async function revokeToken(token: string): Promise<void> {
  const response = await fetch(`${GOOGLE_OAUTH_CONFIG.revokeEndpoint}?token=${token}`, {
    method: 'POST',
  });

  // Google returns 200 even if token is already invalid
  if (!response.ok) {
    console.warn('Token revocation returned non-OK status:', response.status);
  }
}

/**
 * Types
 */
export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope?: string;
  token_type?: string;
}

export interface StoredGoogleTokens {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  expiry_date: string;
  scope: string | null;
  token_type: string | null;
  created_at: string;
  updated_at: string;
}
