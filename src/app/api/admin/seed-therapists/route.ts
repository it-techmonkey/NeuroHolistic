import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

function getServiceSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    
    // Check if therapists already exist
    const { data: existingTherapists } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'therapist');

    if (existingTherapists && existingTherapists.length >= TEAM_PROFILES.length) {
      return NextResponse.json({ 
        message: 'Therapists already seeded',
        count: existingTherapists.length 
      });
    }

    const created: string[] = [];
    const errors: string[] = [];

    for (const profile of TEAM_PROFILES) {
      const enName = profile.name.en;
      // Check if therapist already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('full_name', enName)
        .eq('role', 'therapist')
        .maybeSingle();

      if (existing) {
        created.push(`${enName} (already exists)`);
        continue;
      }

      // Generate a temp password
      const tempPassword = `Therapist${Date.now()}!`;
      const slug = profile.slug;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: `${slug}@neuroholistic.com`,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: enName.split(' ')[0],
          last_name: enName.split(' ').slice(1).join(' '),
        },
      });

      if (authError) {
        errors.push(`Failed to create auth for ${enName}: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        errors.push(`No user returned for ${enName}`);
        continue;
      }

      // Create user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: `${slug}@neuroholistic.com`,
        role: 'therapist',
        full_name: enName,
      });

      if (profileError) {
        errors.push(`Failed to create profile for ${enName}: ${profileError.message}`);
      } else {
        created.push(enName);
      }
    }

    return NextResponse.json({
      message: 'Seeding complete',
      created,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
