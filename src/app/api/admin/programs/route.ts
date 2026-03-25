import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    // Fetch all programs with user details (if joinable) or fetch users separately
    // Since FK is not explicit to public.users? Let's check if we can join users on user_id
    // If not, we fetch raw.
    // 'users' table has id matching program.user_id if authenticated successfully.
    
    const { data: programs, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching programs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Server error fetching programs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
