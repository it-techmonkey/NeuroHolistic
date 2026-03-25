import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

function getServiceSupabase() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Demo password for all users - FOR DEMO PURPOSES ONLY
const DEMO_PASSWORD = 'NeuroHolistic2024!';

export async function POST() {
  const supabase = getServiceSupabase();
  const results: any[] = [];

  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, full_name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const user of users || []) {
      try {
        // Update password using admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: DEMO_PASSWORD }
        );

        if (updateError) {
          results.push({ email: user.email, status: 'error', error: updateError.message });
        } else {
          results.push({ email: user.email, role: user.role, name: user.full_name, status: 'updated' });
        }
      } catch (e: any) {
        results.push({ email: user.email, status: 'error', error: e.message });
      }
    }

    return NextResponse.json({
      success: true,
      password: DEMO_PASSWORD,
      note: 'All demo users now have this password. Change in production!',
      users: results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
