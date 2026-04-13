# 🚨 SMS & Email Troubleshooting

## Current Status

### ❌ SMS (Twilio) - NOT WORKING

**Problem**: Twilio account is US-based but trying to send to Indian number

- Twilio SID: `ACca...` (US account)
- Your phone: `+91807216...` (India)
- Twilio trial accounts cannot send international SMS by default

**Solutions**:

1. **Use Twilio India Account** (Best)
   - Create new Twilio account from India
   - Get SID from Indian account
   - Add to .env as TWILIO_ACCOUNT_SID

2. **Use Alternative SMS Service** (Recommended)
   - AWS SNS (supports India)
   - Vonage (supports India)
   - Message Bird (supports multi-country)
   - Install package: `npm install aws-sdk` or relevant package
   - Update /server/config/smsEmail.js with new provider

3. **For Testing** (Temporary)
   - Use Mobile Login with email verification instead of SMS
   - User can verify via Gmail instead

---

### ❌ Gmail - NOT WORKING

**Problem**: App password invalid or expired

- Gmail: `itsaifulhaq@gmail.com`
- App Password: `pmjt gzlw iojl fiox` (might be wrong/expired)

**Errors to Check**:

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution**:

1. Go to https://myaccount.google.com/security
2. Make sure **2FA is still ON**
3. Go to **"App passwords"** (regenerate)
4. Create NEW password for Mail
5. Copy the new 16-character password
6. Update .env:
   ```env
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```
7. Restart server

---

## Recommended Fix (IMMEDIATE)

Since Twilio won't work with India, here's what to do NOW:

### Option 1: Disable SMS, Use Email Only (QUICKEST - 2 minutes)

Backend already supports it. Users can:

- Sign up → Email verification → Login
- Mobile login → Not recommended until SMS is fixed
- Use regular email/password login

### Option 2: Get AWS SNS (BETTER - 15 minutes)

1. Create AWS account (free tier available)
2. Install AWS SDK:
   ```bash
   npm install aws-sdk
   ```
3. Create config/awsSms.js with AWS SMS sender
4. Update routes/mobile.js to use AWS instead of Twilio
5. Update .env with AWS credentials

### Option 3: Get Twilio India Account (BEST - 20 minutes)

1. Go to https://www.twilio.com
2. Create India-based account
3. Get new SID/Token
4. Update .env:
   ```env
   TWILIO_ACCOUNT_SID=AC_new_india_sid
   TWILIO_AUTH_TOKEN=new_token
   ```

---

## What's Broken Right Now

| Feature            | Status | Issue                      | Fix                          |
| ------------------ | ------ | -------------------------- | ---------------------------- |
| Email Verification | ❌     | Gmail credential wrong     | Regenerate app password      |
| SMS OTP            | ❌     | Twilio US account to India | Get India account or AWS SNS |
| Email Login        | ✅     | Working                    | -                            |
| Email Signup       | ⚠️     | No email sent              | Fix Gmail creds              |
| Mobile Login       | ❌     | No SMS sent                | Fix Twilio                   |

---

## Quick Fix (Next 5 minutes)

### Step 1: Fix Gmail NOW

```bash
cd server
# Edit .env with valid Gmail app password
# Restart server
npm run dev
```

### Step 2: Disable Twilio SMS in tests

Since SMS won't work, tell users:

- "Use email verification for signup"
- "SMS feature not available in your region"

### Step 3: Long-term solution

Choose one:

- AWS SNS (recommended for India)
- Vonage (supports India)
- Get Twilio India account (or SMS-friendly service)

---

## Test This Now

1. **Try Email Signup**
   - Go to /signup
   - Create account
   - **Check if email arrives** (should verify Gmail creds)

2. **If email fails**:
   - Check backend logs for Gmail error
   - Regenerate Gmail app password
   - Restart and try again

3. **SMS will continue to fail** until above issue is fixed

---

## Backend Response Changes

When SMS fails, API now returns:

```json
{
  "message": "⚠️ SMS service unavailable. Please try email verification instead.",
  "phoneNumber": "+918072164214",
  "smsSent": false
}
```

User will see proper error instead of silent failure.
