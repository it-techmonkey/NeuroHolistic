import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  try {
    const { clientIds } = await request.json();

    if (!clientIds || !Array.isArray(clientIds)) {
      return NextResponse.json({ error: 'clientIds array is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Fetch all clients who have SUBMITTED diagnostic assessments
    const { data: assessments, error } = await supabase
      .from('diagnostic_assessments')
      .select('client_id')
      .in('client_id', clientIds)
      .eq('status', 'submitted');

    if (error) {
      console.error('[Assessments Check] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }

    // Get unique client IDs that have assessments
    const clientsWithAssessments = [...new Set((assessments ?? []).map(a => a.client_id))];

    return NextResponse.json({ clientsWithAssessments });
  } catch (error) {
    console.error('[Assessments Check] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
