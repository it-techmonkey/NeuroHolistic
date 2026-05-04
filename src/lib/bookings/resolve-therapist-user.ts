import type { SupabaseClient } from '@supabase/supabase-js';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ResolvedTherapist = {
  id: string;
  full_name: string | null;
};

/**
 * Map booking-flow therapist id (UUID or team slug) to users row.
 * Matches logic used in /api/bookings/create so availability blocks & conflicts align.
 */
export async function resolveTherapistUserRow(
  supabase: SupabaseClient,
  therapistId: string
): Promise<ResolvedTherapist | null> {
  if (UUID_REGEX.test(therapistId)) {
    const { data } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', therapistId)
      .eq('role', 'therapist')
      .maybeSingle();
    if (data) return { id: data.id, full_name: data.full_name };
  }

  const profile = TEAM_PROFILES.find((p) => p.slug === therapistId);
  if (profile) {
    const { data: byExact } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('full_name', profile.name.en)
      .eq('role', 'therapist')
      .maybeSingle();
    if (byExact) return { id: byExact.id, full_name: byExact.full_name };

    const nameFromSlug = therapistId.replace(/-/g, ' ');
    const { data: byIlike } = await supabase
      .from('users')
      .select('id, full_name')
      .ilike('full_name', `%${nameFromSlug}%`)
      .eq('role', 'therapist')
      .maybeSingle();
    if (byIlike) return { id: byIlike.id, full_name: byIlike.full_name };
  }

  const nameFromSlug = therapistId.replace(/-/g, ' ').trim();
  if (nameFromSlug) {
    const { data: byIlike2 } = await supabase
      .from('users')
      .select('id, full_name')
      .ilike('full_name', `%${nameFromSlug}%`)
      .eq('role', 'therapist')
      .maybeSingle();
    if (byIlike2) return { id: byIlike2.id, full_name: byIlike2.full_name };
  }

  return null;
}
