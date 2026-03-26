import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { deleteGoogleTokens } from '@/lib/google/token-service';

/**
 * POST /api/google/disconnect
 * 
 * Disconnects Google Calendar for the authenticated user.
 * Revokes and deletes stored tokens.
 */
export async function POST() {
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

    // Delete tokens (also revokes with Google)
    await deleteGoogleTokens(user.id);

    return NextResponse.json({
      success: true,
      message: 'Google Calendar disconnected successfully',
    });
  } catch (error) {
    console.error('[Google Disconnect] Error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}
