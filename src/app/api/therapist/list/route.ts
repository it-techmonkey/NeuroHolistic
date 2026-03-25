import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    // First try to get therapists from database
    const { data: dbTherapists, error } = await supabase
      .from('users')
      .select('id,full_name,email,role')
      .in('role', ['therapist', 'admin'])
      .order('full_name', { ascending: true });

    let therapists: any[] = [];

    if (!error && dbTherapists && dbTherapists.length > 0) {
      therapists = dbTherapists.map((user) => ({
        id: user.id,
        slug: (user.full_name || user.email || user.id)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        name: user.full_name || user.email,
        role: user.role === 'admin' ? 'Lead Practitioner' : 'Certified Practitioner',
      }));
    } else {
      // Fallback to team profiles from code
      const seen = new Set<string>();
      therapists = TEAM_PROFILES
        .filter(profile => {
          const key = profile.name.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map(profile => ({
          id: profile.slug,
          slug: profile.slug,
          name: profile.name,
          role: profile.slug === 'dr-fawzia-yassmina' ? 'Founder & Lead Practitioner' : 'Certified Practitioner',
        }));
    }

    return NextResponse.json({ therapists });
  } catch (error) {
    // Final fallback - return team profiles
    const therapists = TEAM_PROFILES.map(profile => ({
      id: profile.slug,
      slug: profile.slug,
      name: profile.name,
      role: profile.slug === 'dr-fawzia-yassmina' ? 'Founder & Lead Practitioner' : 'Certified Practitioner',
    }));
    
    return NextResponse.json({ therapists });
  }
}