# Tap Payments + Tabby Setup Guide

This guide explains what you need to do to set up **Tap Payments** for this UAE-based app, with **Tabby** as a supported payment option.

The goal is:

```txt
Cards / Apple Pay / normal checkout -> Tap Payments
Buy now, pay later / installments -> Tabby through Tap Payments
Program activation -> after the app verifies the Tap payment status
```

This guide is written for a non-technical setup process first. It explains what you need to do with Tap before a developer starts implementation.

## 1. Why Tap Payments Is the Best Fit Here

For this app, Tap Payments is a strong fit because:

- The business is UAE-based.
- Customers are mainly in the UAE.
- Scale is not very large.
- Implementation should be quick and simple.
- Tabby is required.
- Tap supports UAE/AED payment methods and lists Tabby as a supported BNPL option.

Compared with more enterprise-style gateways, Tap should be easier to onboard and easier to manage for a smaller UAE-focused business.

## 2. Recommended Payment Flow

Use Tap's hosted/redirect checkout flow first.

The simple flow should be:

```txt
User selects a program
-> App creates a Tap charge from the server
-> Tap returns a payment page URL
-> User pays on Tap's hosted payment page
-> Tap redirects user back to the app
-> App retrieves the charge from Tap using tap_id
-> App activates the program only if Tap confirms payment success
```

This is better than building a custom card form because:

- Tap hosts the sensitive payment page.
- The app does not directly collect card details.
- It is quicker to launch.
- Tabby can appear as a payment option when it is enabled and eligible.
- Card fallback can still be available if Tabby is unavailable.

## 3. What You Need Before Opening the Account

Prepare these business details:

- Legal business name.
- Trade license or company registration document.
- UAE business address.
- Bank account details for settlements.
- Website URL.
- Product/service description.
- Refund policy.
- Terms and conditions URL.
- Privacy policy URL.
- Customer support email.
- Customer support phone number.
- Expected monthly transaction volume.
- Average transaction size.
- Highest transaction size.

For this app, describe the business as selling:

- Private wellness / NeuroHolistic programs.
- Group programs.
- Academy programs.
- Session-based services.

Ask Tap whether this category is accepted by both Tap and Tabby before you start development.

## 4. Create a Tap Payments Account

1. Go to the Tap Payments website.
2. Choose the UAE region.
3. Create a business account or contact sales.
4. Submit your business information.
5. Complete KYC/business verification.
6. Add settlement bank details.
7. Ask Tap to enable online payments for AED.

When speaking with Tap, say:

```txt
We are a UAE-based wellness platform. We need online card payments and Tabby for UAE customers. We want to use Tap's hosted checkout or redirect payment flow first for a quick implementation.
```

## 5. Ask Tap to Enable Tabby

Tabby will not necessarily appear automatically. You need to request it.

Ask Tap support or your Tap account manager:

```txt
Please enable Tabby on our Tap account for UAE/AED online payments.
```

Also ask:

- Is Tabby available for our business category?
- Is Tabby available for services/programs, not only physical products?
- Is Tabby available for all our prices?
- Will Tabby appear on the hosted payment page when eligible?
- What customer fields are required for Tabby?
- Do we need to provide product/order line items for Tabby?
- Are refunds and partial refunds supported for Tabby through Tap?
- Are settlements handled by Tap or directly by Tabby?

## 6. Confirm Your Prices With Tap/Tabby

This app has some high-value purchases. Do not assume every amount will be eligible for Tabby.

Ask Tap/Tabby about these amounts:

```txt
Group per session: 500 AED
Standard private per session: 800 AED
Dr. Fawzia per session: 1,000 AED
Group full program: 4,500 AED
Standard private full program: 7,700 AED
Dr. Fawzia full program: 9,000 AED
Academy installment: 5,000 AED
Academy full program: 25,000 AED
```

Important: even if Tabby is enabled, Tabby can still reject a customer based on eligibility/risk checks. That is normal. The app should still let the customer pay by card if Tabby is unavailable.

## 7. Get Test/Sandbox Access

Ask Tap for sandbox/test credentials.

You need:

- Test secret API key.
- Test public key, if needed.
- Test merchant/business ID, if provided.
- Test payment method setup.
- Test cards or test payment instructions.
- Confirmation that Tabby can be tested in sandbox, or whether Tabby testing is limited.

Tap's redirect flow uses a server-side charge request and returns a `transaction.url` where the user completes payment.

## 8. Find API Credentials in Tap

In the Tap dashboard, look for API credentials under an area like:

```txt
goSell -> API Credentials
```

Save these values securely:

```txt
Sandbox secret key
Production secret key
Merchant ID, if shown
Business ID, if shown
Webhook/signing secret, if Tap provides one
```

Do not put these values in Git, screenshots, or chat.

## 9. Environment Variables for the App

When development starts, the app should use environment variables like:

```env
TAP_SECRET_KEY=
TAP_PUBLIC_KEY=
TAP_MERCHANT_ID=
TAP_API_BASE=https://api.tap.company
TAP_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

Rules:

- Secret keys must stay server-side.
- Never prefix secret values with `NEXT_PUBLIC_`.
- Keep sandbox and production keys separate.
- Rotate keys if they are accidentally exposed.

## 10. Return URL Setup

Tap's redirect flow requires a `redirect.url` in the charge request.

Use a URL like this:

```txt
https://your-production-domain.com/payment/tap/return
```

For local development:

```txt
http://localhost:3000/payment/tap/return
```

After payment, Tap redirects the customer back to this URL and includes a `tap_id`.

The app should then:

1. Read the `tap_id`.
2. Retrieve the charge from Tap's API.
3. Check the payment status.
4. Activate the program only if the status is successful/captured/paid.

Do not activate a program just because the user reached the return page.

## 11. Webhook Setup

Ask Tap whether your account supports webhooks for charge/payment status updates.

If available, configure a webhook URL:

```txt
https://your-production-domain.com/api/payments/tap/webhook
```

For local testing, use a tunnel such as ngrok:

```txt
https://your-ngrok-url.ngrok-free.app/api/payments/tap/webhook
```

Ask Tap:

- Which payment events are available?
- How are webhook signatures verified?
- Is there a signing secret?
- Can failed, captured, refunded, and chargeback events be sent?
- Are webhook retries supported?

Even if you use the redirect return URL, webhooks are still useful because customers can close the browser before returning to the app.

## 12. Payment Source Choice

Tap supports different `source.id` values for different payment methods.

For the fastest setup, ask Tap if you can use:

```txt
src_all
```

This is intended to show all available payment methods on Tap's hosted payment page.

If you want cards only, Tap docs mention:

```txt
src_card
```

For this app, the preferred approach is:

```txt
Use src_all so Tap can show cards, Apple Pay, Tabby, and other enabled methods.
```

Confirm with Tap that Tabby appears through `src_all` once Tabby is enabled.

## 13. Customer and Order Data Needed

For every Tap charge, the app should send customer information such as:

- Customer name.
- Customer email.
- Customer phone number.
- Amount.
- Currency: `AED`.
- Description.
- Internal reference/payment ID.
- Redirect URL.
- Metadata such as program type and user ID.

For Tabby, ask Tap if additional fields are required:

- Billing address.
- UAE phone number.
- Product/service line items.
- Category.
- Customer history.

The more accurate the customer/order data is, the better the chance that Tabby eligibility works correctly.

## 14. Payment States the App Should Use

The app should keep clear payment states.

Recommended payment states:

```txt
created
pending
authorized
captured
paid
failed
cancelled
refunded
partially_refunded
chargeback
```

Program states should remain separate:

```txt
pending
active
completed
cancelled
```

Why separate them?

Because a payment and a program are related, but they are not the same thing.

Example:

```txt
Payment = paid
Program = active
```

or:

```txt
Payment = refunded
Program = cancelled
```

## 15. Recommended Database Approach

The app should add a separate payments table instead of storing everything only in the programs table.

Suggested fields:

```txt
id
user_id
program_id
provider                  tap
provider_charge_id         Tap charge ID
provider_reference
amount
currency                  AED
payment_method             card / tabby / apple_pay / unknown
status
program_type              private / group / academy
payment_option            full / per_session
raw_response
created_at
updated_at
paid_at
refunded_at
```

This makes support, refunds, retries, admin checks, and future migration easier.

## 16. What Should Happen After Successful Payment

Once the app verifies that the Tap charge is successful:

1. Mark payment as paid/captured.
2. Create or activate the program.
3. Assign the therapist.
4. Create the pending session records.
5. Send confirmation email.
6. Redirect customer to dashboard or success page.

The app should not rely on the customer clicking "I paid".

## 17. What Should Happen If Payment Fails

If the payment fails:

1. Mark payment as failed.
2. Do not activate the program.
3. Show a helpful failure page.
4. Let the customer try again.
5. Keep the failed payment record for admin/debugging.

## 18. What Should Happen If Tabby Is Unavailable

Tabby may be unavailable for a customer.

Possible reasons:

- Customer is not eligible.
- Amount is too high.
- Customer phone/country is unsupported.
- Tabby is not enabled yet.
- Tabby rejects the transaction.

The app should still allow normal card payment through Tap.

Recommended customer message:

```txt
Tabby may not be available for every transaction. You can still complete your payment by card.
```

## 19. Admin Dashboard Requirements

The admin dashboard should show:

- Customer name.
- Customer email.
- Program type.
- Payment option.
- Amount.
- Currency.
- Payment method.
- Tap charge ID.
- Payment status.
- Program status.
- Created date.
- Paid date.
- Refunded date, if any.

Manual admin verification should become a fallback, not the normal flow.

## 20. Testing Checklist

Before going live, test:

- Card payment success.
- Card payment failure.
- Customer cancels payment.
- User returns to the app with `tap_id`.
- App retrieves charge from Tap.
- App activates program only after successful charge status.
- Tabby appears as a payment option.
- Tabby approved flow.
- Tabby rejected/unavailable flow.
- Duplicate return/webhook does not create duplicate programs.
- Existing active program blocks duplicate purchase.
- Refund flow.
- Partial refund flow, if supported.
- Admin dashboard shows payment details.
- Confirmation email is sent only after verified payment.

## 21. Go-Live Checklist

Before production:

- Tap account approved.
- Bank settlement details approved.
- Production secret key created.
- Tabby enabled in production.
- AED enabled.
- Hosted/redirect checkout enabled.
- Return URL points to production.
- Webhook URL points to production, if available.
- Production domain is live.
- Privacy policy is live.
- Terms and conditions are live.
- Refund policy is live.
- Support contact details are live.
- At least one real low-value test payment is completed, if allowed.
- Refund process is understood by admin/support.

## 22. What To Give the Developer

Give the developer:

- Sandbox secret key.
- Sandbox public key, if used.
- Merchant ID/business ID, if Tap provides one.
- Confirmation that Tabby is enabled.
- Confirmation that `src_all` can show Tabby.
- Return URL requirements.
- Webhook/signature details, if available.
- Production keys only after sandbox testing is complete.

Do not share secrets in public chat or commit them to Git.

## 23. Current App Work Needed Later

The app currently uses Ziina/payment-link style behavior. Later implementation should:

- Remove Ziina links.
- Remove Ziina API routes.
- Remove the "I've Made the Payment" button.
- Add Tap payment creation API.
- Redirect users to Tap's hosted payment URL.
- Add a return route that reads `tap_id`.
- Retrieve Tap charge status server-side.
- Add webhook handling if Tap provides webhooks.
- Activate programs only after verified payment status.
- Keep card fallback when Tabby is unavailable.

## 24. Official References

- Tap Tabby payment method: https://www.tap.company/en-ae/products/payment-methods/tabby
- Tap Redirect payment flow: https://developers.tap.company/docs/redirect
- Tap Create a Charge API: https://developers.tap.company/reference/create-a-charge
- Tap API actions: https://developers.tap.company/reference/api-actions
- Tap support: https://support.tap.company/
- Tap support contact: https://support.tap.company/en/support/solutions/articles/153000140145-how-to-contact-the-tap-payments-support-team-
