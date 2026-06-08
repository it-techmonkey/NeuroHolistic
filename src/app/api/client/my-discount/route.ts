import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getActiveDiscount } from '@/lib/payments/discount';

// GET /api/client/my-discount — returns the authenticated user's active discount (or null)
export async function GET() {
  try {
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const discount = await getActiveDiscount(user.id);

    return NextResponse.json({ discount });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
