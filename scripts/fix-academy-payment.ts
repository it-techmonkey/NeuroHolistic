/**
 * Revert academy payment that was incorrectly fixed (25000 was correct).
 * Run: npx tsx scripts/fix-academy-payment.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { error } = await supabase
    .from('payments')
    .update({ amount: 25000 })
    .eq('id', 'ba927fc4-e2ad-456f-a327-7e647f1b901f');

  if (error) {
    console.error('Failed:', error.message);
  } else {
    console.log('Reverted payment ba927fc4 to 25000 AED (academy price)');
  }
}

main();
