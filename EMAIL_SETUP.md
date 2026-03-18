# Email Setup Guide - Resend Integration

## ✅ What's Been Set Up

### 1. **API Route** - `/src/app/api/send-booking-email/route.ts`
- Receives POST requests with booking details
- Validates required fields (name, email, therapist, date, time)
- Generates professional HTML email template
- Sends via Resend SDK
- Logs errors without breaking anything

### 2. **Email Utility** - `/src/lib/email/send-booking-email.ts`
- Non-blocking fire-and-forget implementation
- Catches all errors silently
- Never impacts the booking UI

### 3. **Frontend Integration** - `BookingModalProvider.tsx`
- Imports email utility
- Triggers email send after successful booking
- Email sends while user sees success page
- No UI impact if email fails

---

## 🔧 Required Setup

### Step 1: Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up / Log in
3. Go to API Keys section
4. Copy your API key

### Step 2: Update Environment Variables

Add to your `.env.local`:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 3: Update Email Settings

In `/src/app/api/send-booking-email/route.ts`, line 43:

```typescript
from: 'NeuroHolistic <noreply@neuroholistic.app>',
```

Replace `noreply@neuroholistic.app` with your actual Resend email domain.

---

## 📧 Email Features

- **Professional Template**: Clean, branded HTML email
- **Dynamic Content**: Automatically fills booking details
- **Error Handling**: Silently fails, never blocks user
- **Non-Blocking**: Sends in background after success page appears
- **Customizable**: Add meeting links via `meetingLink` parameter

### Email Includes:
✅ User's name
✅ Therapist name  
✅ Booking date (formatted nicely)
✅ Booking time
✅ Meeting link (optional)
✅ Professional branding

---

## 🚀 How It Works

1. User fills out all booking steps
2. User clicks "Confirm Booking"
3. Booking is created in Supabase ✓
4. UI shows success page immediately ✓
5. Email is sent in background (async) ✓
6. If email fails → logs to console, doesn't affect user ✓

---

## 🔮 Future Enhancements

- Add meeting link generation (Zoom/Google Meet)
- Create additional email templates (cancellation, reminder)
- Track email delivery via Resend webhooks
- Add email preview in admin dashboard

---

## ⚠️ Troubleshooting

**"Missing Resend environment variable"**
- Ensure `RESEND_API_KEY` is in `.env.local`
- Restart dev server after adding env var

**"Email domain not verified"**
- Resend requires email domain verification
- Check Resend dashboard for verification status

**"Email not being sent"**
- Check browser console for errors
- API route logs errors in your terminal
- Verify Resend API key is correct
