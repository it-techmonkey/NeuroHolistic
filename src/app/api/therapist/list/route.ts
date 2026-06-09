import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

let cachedTherapists: any[] = [];
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000;

const FOUNDER_SLUG = 'fawzia-yassmina';

function normalizeForDedup(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\./g, '')
    .replace(/^(dr|doctor)\s+/i, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => {
      let s = w.replace(/[aeiou]/g, '');
      s = s.replace(/(.)\1+/g, '$1');
      return s;
    })
    .sort()
    .join(' ');
}

export async function GET() {
  try {
    const now = Date.now();
    if (cachedTherapists.length > 0 && now - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json({ therapists: cachedTherapists });
    }

    const supabase = getServiceSupabase();

    const { data: dbTherapists, error } = await supabase
      .from('users')
      .select('id,full_name,email,role')
      .eq('role', 'therapist')
      .order('full_name', { ascending: true });

    const therapists: any[] = [];
    const seen = new Set<string>();

    if (!error && dbTherapists && dbTherapists.length > 0) {
      dbTherapists.forEach((user) => {
        const name = user.full_name || user.email;
        const key = normalizeForDedup(name);

        if (seen.has(key)) return;
        seen.add(key);

        const isFounder = key.includes('fzw') && key.includes('ysmn');

        therapists.push({
          id: user.id,
          slug: isFounder ? FOUNDER_SLUG : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          name: isFounder ? 'Dr. Fawzia Yassmina' : name,
          role: isFounder ? 'Founder & Lead Practitioner' : 'Certified Practitioner',
        });
      });
    }

    TEAM_PROFILES.forEach(profile => {
      const key = normalizeForDedup(profile.name.en);

      if (seen.has(key)) return;
      seen.add(key);

      therapists.push({
        id: profile.slug,
        slug: profile.slug,
        name: profile.name.en,
        role: profile.slug === FOUNDER_SLUG ? 'Founder & Lead Practitioner' : 'Certified Practitioner',
      });
    });

    cachedTherapists = therapists;
    cacheTimestamp = now;

    return NextResponse.json({ therapists });
  } catch (error) {
    const seen = new Set<string>();
    const therapists = TEAM_PROFILES
      .filter(profile => {
        const key = normalizeForDedup(profile.name.en);
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
