import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('id,full_name,email,role')
      .in('role', ['therapist', 'founder'])
      .order('full_name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const therapists = (data ?? []).map((user) => ({
      id: user.id,
      slug: (user.full_name || user.email || user.id)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      name: user.full_name || user.email,
      role: user.role === 'founder' ? 'Founder & Method Creator' : 'Certified Practitioner',
    }));

    return NextResponse.json({ therapists });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}