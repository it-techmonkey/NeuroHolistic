import { getServiceSupabase } from '@/lib/supabase/service';
import { GoogleTokens, StoredGoogleTokens, refreshAccessToken, revokeToken } from './oauth';

/**
 * Store Google tokens for a therapist
 */
export async function storeGoogleTokens(
  userId: string,
  tokens: GoogleTokens
): Promise<StoredGoogleTokens> {
  const supabase = getServiceSupabase();

  const tokenData = {
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: new Date(tokens.expiry_date).toISOString(),
    scope: tokens.scope || null,
    token_type: tokens.token_type || 'Bearer',
  };

  // Upsert - update if exists, insert if not
  const { data, error } = await supabase
    .from('therapist_google_tokens')
    .upsert(tokenData, {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[Token Service] Error storing tokens:', error);
    throw new Error(`Failed to store Google tokens: ${error.message}`);
  }

  return data as StoredGoogleTokens;
}

/**
 * Get stored Google tokens for a user
 */
export async function getStoredTokens(
  userId: string
): Promise<StoredGoogleTokens | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('therapist_google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('[Token Service] Error fetching tokens:', error);
    throw new Error(`Failed to fetch Google tokens: ${error.message}`);
  }

  return data as StoredGoogleTokens;
}

/**
 * Get valid access token, refreshing if necessary
 * This is the main function to use when making API calls
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const storedTokens = await getStoredTokens(userId);

  if (!storedTokens) {
    throw new Error('Google Calendar not connected. Please connect your Google Calendar first.');
  }

  if (!storedTokens.refresh_token) {
    throw new Error('No refresh token available. Please reconnect your Google Calendar.');
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const expiryDate = new Date(storedTokens.expiry_date).getTime();
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

  if (expiryDate > fiveMinutesFromNow) {
    // Token is still valid
    return storedTokens.access_token;
  }

  // Token is expired or about to expire, refresh it
  console.log('[Token Service] Token expired, refreshing for user:', userId);

  try {
    const newTokens = await refreshAccessToken(storedTokens.refresh_token);
    
    // Store the refreshed tokens
    await storeGoogleTokens(userId, newTokens);
    
    return newTokens.access_token;
  } catch (error) {
    console.error('[Token Service] Failed to refresh token:', error);
    
    // Clean up invalid tokens
    await deleteGoogleTokens(userId);
    
    throw new Error('Google Calendar access has expired. Please reconnect your Google Calendar.');
  }
}

/**
 * Delete Google tokens for a user (disconnect)
 */
export async function deleteGoogleTokens(userId: string): Promise<void> {
  const supabase = getServiceSupabase();

  // Optionally revoke the token with Google first
  const storedTokens = await getStoredTokens(userId);
  if (storedTokens?.access_token) {
    try {
      await revokeToken(storedTokens.access_token);
    } catch (error) {
      // Log but don't fail - token might already be invalid
      console.warn('[Token Service] Failed to revoke token:', error);
    }
  }

  const { error } = await supabase
    .from('therapist_google_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('[Token Service] Error deleting tokens:', error);
    throw new Error(`Failed to delete Google tokens: ${error.message}`);
  }
}

/**
 * Check if user has connected Google Calendar
 */
export async function isGoogleCalendarConnected(userId: string): Promise<boolean> {
  const tokens = await getStoredTokens(userId);
  return tokens !== null;
}

/**
 * Get connection status with metadata
 */
export async function getConnectionStatus(userId: string): Promise<{
  connected: boolean;
  lastUpdated: string | null;
  scope: string | null;
}> {
  const tokens = await getStoredTokens(userId);

  if (!tokens) {
    return {
      connected: false,
      lastUpdated: null,
      scope: null,
    };
  }

  return {
    connected: true,
    lastUpdated: tokens.updated_at,
    scope: tokens.scope,
  };
}
