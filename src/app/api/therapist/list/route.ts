import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    // First try to get therapists from database (exclude admin)
    const { data: dbTherapists, error } = await supabase
      .from('users')
      .select('id,full_name,email,role')
      .eq('role', 'therapist')
      .order('full_name', { ascending: true });

    let therapists: any[] = [];
    const seenNames = new Set<string>();
    const seenEmails = new Set<string>();

    if (!error && dbTherapists && dbTherapists.length > 0) {
      // Add database therapists first
      dbTherapists.forEach((user) => {
        const name = user.full_name || user.email;
        const nameKey = name.toLowerCase().trim();
        const emailKey = user.email?.toLowerCase().trim();
        
        if (!seenNames.has(nameKey) && !seenEmails.has(emailKey)) {
          seenNames.add(nameKey);
          if (emailKey) seenEmails.add(emailKey);
          
          therapists.push({
            id: user.id,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            name: name,
            role: user.role === 'admin' ? 'Lead Practitioner' : 'Certified Practitioner',
          });
        }
      });
    }
    
    // Add any missing team profiles (avoiding duplicates)
    TEAM_PROFILES.forEach(profile => {
      const nameKey = profile.name.toLowerCase().trim();
      const emailMatch = profile.slug.includes('fawzia') ? 'fawzia@neuroholistic.com' : 
                         profile.slug.includes('mariam') ? 'mariam@neuroholistic.com' :
                         profile.slug.includes('noura') ? 'noura@neuroholistic.com' : null;
      const emailKey = emailMatch?.toLowerCase().trim();
      
      if (!seenNames.has(nameKey) && !(emailKey && seenEmails.has(emailKey))) {
        seenNames.add(nameKey);
        if (emailKey) seenEmails.add(emailKey);
        
        therapists.push({
          id: profile.slug,
          slug: profile.slug,
          name: profile.name,
          role: profile.slug === 'dr-fawzia-yassmina' ? 'Founder & Lead Practitioner' : 'Certified Practitioner',
        });
      }
    });

    return NextResponse.json({ therapists });
  } catch (error) {
    // Final fallback - return team profiles with deduplication
    const seen = new Set<string>();
    const therapists = TEAM_PROFILES
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
    
    return NextResponse.json({ therapists });
  }
}