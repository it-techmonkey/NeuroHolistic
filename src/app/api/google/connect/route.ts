import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getGoogleAuthUrl } from '@/lib/google/oauth';

/**
 * GET /api/google/connect
 * 
 * Initiates Google OAuth flow for therapists.
 * Redirects user to Google consent screen.
 */
export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate a state parameter for CSRF protection
    // Include user_id to identify the user on callback
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2),
    })).toString('base64url');

    // Generate the Google OAuth URL
    const authUrl = getGoogleAuthUrl(state);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('[Google Connect] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
