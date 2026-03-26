import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google/oauth';
import { storeGoogleTokens } from '@/lib/google/token-service';

/**
 * GET /api/google/callback
 * 
 * Handles Google OAuth callback.
 * Exchanges authorization code for tokens and stores them.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  // Handle OAuth errors (user denied access, etc.)
  if (error) {
    console.error('[Google Callback] OAuth error:', error);
    const errorUrl = new URL('/dashboard/therapist', request.url);
    errorUrl.searchParams.set('google_error', error);
    return NextResponse.redirect(errorUrl);
  }

  // Validate required parameters
  if (!code || !state) {
    const errorUrl = new URL('/dashboard/therapist', request.url);
    errorUrl.searchParams.set('google_error', 'missing_parameters');
    return NextResponse.redirect(errorUrl);
  }

  try {
    // Parse and validate state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      throw new Error('Invalid state parameter');
    }

    // Verify state is not too old (10 minutes max)
    const stateAge = Date.now() - stateData.timestamp;
    if (stateAge > 10 * 60 * 1000) {
      throw new Error('OAuth state expired');
    }

    const userId = stateData.userId;
    if (!userId) {
      throw new Error('No user ID in state');
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Store tokens in database
    await storeGoogleTokens(userId, tokens);

    // Redirect to therapist dashboard with success
    const successUrl = new URL('/dashboard/therapist', request.url);
    successUrl.searchParams.set('google_connected', 'true');
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('[Google Callback] Error:', error);
    const errorUrl = new URL('/dashboard/therapist', request.url);
    errorUrl.searchParams.set('google_error', 'token_exchange_failed');
    return NextResponse.redirect(errorUrl);
  }
}
