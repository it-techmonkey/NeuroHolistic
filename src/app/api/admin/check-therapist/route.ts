import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const DEMO_PASSWORD = 'NeuroHolistic2024!';

// Add simple email alias for demo therapist
const THERAPIST_ALIAS = {
  originalEmail: 'mariam-al-kaisi@neuroholistic.com',
  aliasEmail: 'mariam@neuroholistic.com',
  fullName: 'Mariam Al Kaisi',
};

export async function POST() {
  const supabase = getServiceSupabase();

  try {
    // Get existing therapist
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('email', THERAPIST_ALIAS.originalEmail)
      .limit(1);

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Original therapist not found' }, { status: 404 });
    }

    const therapist = users[0];

    // Check if alias already exists
    const { data: existingAlias } = await supabase
      .from('users')
      .select('id')
      .eq('email', THERAPIST_ALIAS.aliasEmail)
      .limit(1);

    if (existingAlias && existingAlias.length > 0) {
      return NextResponse.json({ 
        message: 'Alias already exists',
        email: THERAPIST_ALIAS.aliasEmail,
        password: DEMO_PASSWORD 
      });
    }

    // Create alias in users table (pointing to same ID would require re-creating)
    // Instead, let's just show the correct credentials

    return NextResponse.json({
      message: 'Use the original email for Mariam',
      therapist: {
        email: THERAPIST_ALIAS.originalEmail,
        aliasEmail: THERAPIST_ALIAS.aliasEmail,
        password: DEMO_PASSWORD,
        role: therapist.role,
      },
      note: 'The alias email mariam@neuroholistic.com does not exist. Use mariam-al-kaisi@neuroholistic.com',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
