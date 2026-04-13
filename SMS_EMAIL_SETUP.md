# SMS & Email Integration Setup Guide

## Overview

This guide shows you how to integrate **real SMS delivery** (via Twilio) and **email verification** (via Gmail) into Elite Clinic.

---

## 1. Twilio SMS Setup (Send OTP to Phone)

### Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/console](https://www.twilio.com/console)
2. Sign up for a free account (includes $10 free credit)
3. Verify your phone number (required for free tier)

### Step 2: Get Your Credentials

1. Go to Dashboard → Account
2. Copy your **Account SID**
3. Click "View Full Account SID & Auth Token" → Copy **Auth Token**
4. Go to Phone Numbers → Get a Trial Number (e.g., +1 (XXX) XXX-XXXX)

### Step 3: Add to .env File

In `/server/.env`, add:

```env
TWILIO_ACCOUNT_SID=AC...your_sid_here...
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Test

- SMS will now be sent to real phone numbers
- Check your device for OTP messages!

---

## 2. Gmail Email Verification Setup

### Step 1: Enable 2FA on Gmail

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Click "App passwords" (at the bottom)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password

### Step 2: Add to .env File

In `/server/.env`, add:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Step 3: Test

- Users will receive real emails for verification
- Beautiful HTML formatted emails with your clinic branding

---

## 3. Environment Variables Reference

Add all of these to `/server/.env`:

```env
# Server Config
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=elite_clinic_super_secret_key_2026

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Gmail Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Firebase (optional)
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=elite-clinic.firebaseapp.com
FIREBASE_PROJECT_ID=elite-clinic-demo
```

---

## 4. Testing

### Test OTP Flow

1. **Without Twilio**: OTP shows in console + test box
2. **With Twilio**: OTP sends to real phone ✅

### Test Email Verification

1. **Without Gmail**: Code shows in console + email logs show
2. **With Gmail**: Real email sent to inbox ✅

---

## 5. API Endpoints

### Mobile OTP

```
POST /api/mobile/send-otp
  Body: { phoneNumber: "+15551234567" }
  Response: { testOTP: "123456", phoneNumber: "..." }

POST /api/mobile/verify-otp
  Body: { phoneNumber: "+...", otp: "123456" }
  Response: { token: "...", user: { ... } }
```

### Email Verification

```
POST /api/auth/send-email-verification
  Body: { email: "user@gmail.com" }
  Response: { message: "Code sent", testCode: "123456" }

POST /api/auth/verify-email-code
  Body: { email: "user@gmail.com", code: "123456" }
  Response: { token: "...", user: { ... } }

POST /api/auth/resend-email-verification
  Body: { email: "user@gmail.com" }
  Response: { message: "Code resent", testCode: "123456" }
```

---

## 6. Development vs Production

### Development Mode (NODE_ENV != 'production')

- Test codes/OTPs displayed in responses
- Console logs show all details
- Live SMS/Email sent if credentials configured
- Perfect for testing

### Production Mode (NODE_ENV = 'production')

- Test codes/OTPs NOT sent in responses
- Only production numbers work
- Full SMS/Email integration required
- Enhanced error handling

---

## 7. Troubleshooting

### SMS Not Sending

- ✓ Check Twilio credentials in .env
- ✓ Verify Twilio account has credit
- ✓ Check phone number format (+country_code...)
- ✓ Check server logs for error messages

### Email Not Sending

- ✓ Check Gmail credentials in .env
- ✓ Gmail 2FA enabled? (Required)
- ✓ Using 16-char app password? (Not regular password)
- ✓ Check server logs for error messages

### Server Won't Start

- ✓ Missing .env file? Create it in /server/
- ✓ All required env vars? Check against template above
- ✓ Syntax errors in .env? (No spaces around =)

---

## 8. Ready to Go! 🚀

Once configured:

1. ✅ Users get real OTP on their phones
2. ✅ Users get real emails for verification
3. ✅ Mobile login works end-to-end
4. ✅ Email signup with verification works
5. ✅ Production-ready authentication

---

## Next Steps

After setup:

1. Test the mobile OTP flow: `/mobile-login`
2. Test email verification in signup: `/signup`
3. Monitor server logs for any issues
4. Deploy to production when ready

For production deployment, update:

- NODE_ENV=production
- Real database (prod MongoDB URI)
- Real Twilio/Gmail credentials
- Update CORS origins to your domain
