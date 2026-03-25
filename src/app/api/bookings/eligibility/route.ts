import { NextRequest, NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/services/eligibility.service';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'email query parameter is required' }, { status: 400 });
    }

    const eligibility = await checkEligibility(email);

    return NextResponse.json(eligibility);
  } catch (error) {
    console.error('[GET /api/bookings/eligibility]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
