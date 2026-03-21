#!/bin/bash

# Ziina Payment API Test - curl commands
# Usage: bash scripts/test-ziina-payment.sh

API_URL="${API_URL:-http://localhost:3000}"
TEST_ENDPOINT="/api/test/create-payment"

echo "================================================================================"
echo "ZIINA PAYMENT API TEST - CURL"
echo "================================================================================"
echo ""
echo "Target: ${API_URL}${TEST_ENDPOINT}"
echo "Note: Make sure your Next.js dev server is running (npm run dev)"
echo ""
echo "================================================================================"
echo ""

# Test 1: Basic Program Payment
echo "TEST 1: Basic Program Payment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Request:"
echo "  POST ${API_URL}${TEST_ENDPOINT}"
echo "  Body: {"
echo '    "amount": 800,'
echo '    "email": "test@example.com",'
echo '    "type": "program"'
echo "  }"
echo ""
echo "Response:"
curl -X POST "${API_URL}${TEST_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 800,
    "email": "test@example.com",
    "type": "program"
  }' \
  -w "\n"

echo ""
echo ""

# Test 2: Consultation Payment
echo "TEST 2: Consultation Payment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Request:"
echo "  POST ${API_URL}${TEST_ENDPOINT}"
echo "  Body: {"
echo '    "amount": 150,'
echo '    "email": "consultation@test.com",'
echo '    "type": "consultation"'
echo "  }"
echo ""
echo "Response:"
curl -X POST "${API_URL}${TEST_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150,
    "email": "consultation@test.com",
    "type": "consultation"
  }' \
  -w "\n"

echo ""
echo ""

# Test 3: Error Case - Missing Amount
echo "TEST 3: Error Case - Missing Amount"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Request:"
echo "  POST ${API_URL}${TEST_ENDPOINT}"
echo "  Body: {"
echo '    "email": "test@example.com",'
echo '    "type": "program"'
echo "  }"
echo ""
echo "Response (should be error):"
curl -X POST "${API_URL}${TEST_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "type": "program"
  }' \
  -w "\n"

echo ""
echo ""

# Test 4: Error Case - Zero Amount
echo "TEST 4: Error Case - Zero Amount"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Request:"
echo "  POST ${API_URL}${TEST_ENDPOINT}"
echo "  Body: {"
echo '    "amount": 0,'
echo '    "email": "test@example.com",'
echo '    "type": "program"'
echo "  }"
echo ""
echo "Response (should be error):"
curl -X POST "${API_URL}${TEST_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0,
    "email": "test@example.com",
    "type": "program"
  }' \
  -w "\n"

echo ""
echo ""

# Test 5: High Value Payment
echo "TEST 5: High Value Payment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Request:"
echo "  POST ${API_URL}${TEST_ENDPOINT}"
echo "  Body: {"
echo '    "amount": 5000,'
echo '    "email": "vip@test.com",'
echo '    "type": "program"'
echo "  }"
echo ""
echo "Response:"
curl -X POST "${API_URL}${TEST_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "email": "vip@test.com",
    "type": "program"
  }' \
  -w "\n"

echo ""
echo ""
echo "================================================================================"
echo "TEST COMPLETE"
echo "================================================================================"
echo ""
echo "✅ Next: Check your Next.js dev server terminal for detailed logs:"
echo "   - [Ziina Create Payment] logs from the API"
echo "   - [Ziina API] logs from the payment service"
echo "   - [Ziina Create Payment Response] full API response"
echo ""
