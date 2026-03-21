#!/usr/bin/env node

/**
 * Ziina Payment API Test Script
 * 
 * Tests the create-payment endpoint with proper logging
 * Usage: node scripts/test-ziina-payment.js
 */

const base_url = process.env.API_URL || 'http://localhost:3000';

async function testCreatePayment() {
  console.log('\n='.repeat(80));
  console.log('ZIINA PAYMENT API TEST');
  console.log('='.repeat(80));
  console.log(`[Test] Target API: ${base_url}/api/test/create-payment\n`);

  const testCases = [
    {
      name: 'Basic Program Payment',
      body: {
        amount: 800,
        email: 'test@example.com',
        type: 'program',
      },
    },
    {
      name: 'Consultation Payment',
      body: {
        amount: 150,
        email: 'consultation@test.com',
        type: 'consultation',
      },
    },
    {
      name: 'High Value Payment',
      body: {
        amount: 5000,
        email: 'vip@test.com',
        type: 'program',
      },
    },
    {
      name: 'Invalid Request - Missing Amount',
      body: {
        email: 'test@example.com',
        type: 'program',
      },
      shouldFail: true,
    },
    {
      name: 'Invalid Request - Zero Amount',
      body: {
        amount: 0,
        email: 'test@example.com',
        type: 'program',
      },
      shouldFail: true,
    },
  ];

  for (const testCase of testCases) {
    console.log('\n' + '-'.repeat(80));
    console.log(`[Test Case] ${testCase.name}`);
    console.log('-'.repeat(80));

    console.log('[Test] Sending POST request...');
    console.log('[Test] URL:', `${base_url}/api/test/create-payment`);
    console.log('[Test] Body:', JSON.stringify(testCase.body, null, 2));
    console.log('[Test] Headers:', {
      'Content-Type': 'application/json',
    });

    try {
      const response = await fetch(`${base_url}/api/test/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.body),
      });

      const responseData = await response.json();

      console.log(`\n[Test] Response Status: ${response.status} ${response.statusText}`);
      console.log('[Test] Response Headers:');
      console.log('  Content-Type:', response.headers.get('content-type'));
      console.log('  Content-Length:', response.headers.get('content-length'));

      console.log('\n[Ziina Create Payment Response]', responseData);

      // Extract relevant fields
      if (responseData.success) {
        console.log('\n[Test] ✅ SUCCESS');
        console.log('[Test] - payment_url:', responseData.payment_url);
        console.log('[Test] - payment_id:', responseData.payment_id);
        console.log('[Test] - message:', responseData.message);

        if (testCase.shouldFail) {
          console.log('[Test] ⚠️ WARNING: Expected this to fail but it succeeded');
        }
      } else {
        console.log('\n[Test] ❌ FAILED');
        console.log('[Test] - error:', responseData.error);

        if (!testCase.shouldFail) {
          console.log('[Test] ⚠️ WARNING: Expected this to succeed but it failed');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('\n[Test] ❌ EXCEPTION ERROR');
      console.log('[Test] Error:', errorMessage);
      console.log('[Test] Full error:', error);

      if (!testCase.shouldFail) {
        console.log('[Test] ⚠️ This was not expected to fail');
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
  console.log('\nNote: Check your Next.js dev server console for detailed logs:');
  console.log('  - [Ziina Create Payment] logs from the API endpoint');
  console.log('  - [Ziina API] logs from the payment service');
  console.log('  - [Ziina Create Payment Response] full API response\n');
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${base_url}/api/health`, {
      method: 'GET',
    }).catch(() => null);

    if (!response) {
      console.log(`[Test] ⏳ Waiting for server at ${base_url}...`);
      console.log('[Test] Make sure your Next.js dev server is running:');
      console.log('[Test]   npm run dev\n');
      
      // Wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    // Server might not have health endpoint, try actual API
  }
}

async function main() {
  console.log('[Test] Checking server health...\n');
  await checkServerHealth();
  await testCreatePayment();
}

main().catch(error => {
  console.error('[Test] Fatal error:', error);
  process.exit(1);
});
