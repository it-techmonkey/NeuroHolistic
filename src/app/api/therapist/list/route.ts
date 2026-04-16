import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

// Simple in-memory cache for therapist list
let cachedTherapists: any[] = [];
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Normalize a name for deduplication comparison
 * Handles variations like "Dr. Fawzia Yassmina" vs "Fawzia Yassmina"
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(dr|doctor)\s+/i, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Founder slug constant
const FOUNDER_SLUG = 'fawzia-yassmina';

export async function GET() {
  try {
    // Return cached data if still valid
    const now = Date.now();
    if (cachedTherapists.length > 0 && now - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json({ therapists: cachedTherapists });
    }

    const supabase = getServiceSupabase();

    // Get therapists from database (exclude admin)
    const { data: dbTherapists, error } = await supabase
      .from('users')
      .select('id,full_name,email,role')
      .eq('role', 'therapist')
      .order('full_name', { ascending: true });

    let therapists: any[] = [];
    const seenNormalizedNames = new Set<string>();
    const seenEmails = new Set<string>();

    if (!error && dbTherapists && dbTherapists.length > 0) {
      // Add database therapists first
      dbTherapists.forEach((user) => {
        const name = user.full_name || user.email;
        const normalizedKey = normalizeName(name);
        const emailKey = user.email?.toLowerCase().trim();

        if (!seenNormalizedNames.has(normalizedKey) && !(emailKey && seenEmails.has(emailKey))) {
          seenNormalizedNames.add(normalizedKey);
          if (emailKey) seenEmails.add(emailKey);

          // Check if this is the founder (Fawzia Yassmina)
          const isFounder = normalizedKey.includes('fawzia') && normalizedKey.includes('yassmina');

          therapists.push({
            id: user.id,
            slug: isFounder ? FOUNDER_SLUG : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            name: isFounder ? 'Dr. Fawzia Yassmina' : name,
            role: isFounder ? 'Founder & Lead Practitioner' : (user.role === 'admin' ? 'Founder & Lead Practitioner' : 'Certified Practitioner'),
          });
        }
      });
    }

    // Add any missing team profiles (avoiding duplicates)
    TEAM_PROFILES.forEach(profile => {
      const normalizedKey = normalizeName(profile.name.en);

      if (!seenNormalizedNames.has(normalizedKey)) {
        seenNormalizedNames.add(normalizedKey);

        therapists.push({
          id: profile.slug,
          slug: profile.slug,
          name: profile.name.en,
          role: profile.slug === FOUNDER_SLUG ? 'Founder & Lead Practitioner' : 'Certified Practitioner',
        });
      }
    });

    // Update cache
    cachedTherapists = therapists;
    cacheTimestamp = now;

    return NextResponse.json({ therapists });
  } catch (error) {
    // Final fallback - return team profiles with deduplication
    const seen = new Set<string>();
    const therapists = TEAM_PROFILES
      .filter(profile => {
        const key = normalizeName(profile.name.en);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(profile => ({
        id: profile.slug,
        slug: profile.slug,
        name: profile.name.en,
        role: profile.slug === FOUNDER_SLUG ? 'Founder & Lead Practitioner' : 'Certified Practitioner',
      }));

    return NextResponse.json({ therapists });
  }
}