import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getConnectionStatus } from '@/lib/google/token-service';

/**
 * GET /api/google/status
 * 
 * Returns the Google Calendar connection status for the authenticated user.
 */
export async function GET() {
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

    // Get connection status
    const status = await getConnectionStatus(user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error('[Google Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get connection status' },
      { status: 500 }
    );
  }
}
