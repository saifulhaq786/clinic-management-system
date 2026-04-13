# Mobile Number Login with OTP

## Overview

Complete mobile phone authentication system with OTP verification for secure user registration and login.

## Features Implemented

### Backend (`/server/routes/mobile.js`)

✅ **Send OTP** - Generate and store 6-digit OTP (valid for 5 minutes)
✅ **Verify OTP** - Validate OTP and authenticate/register user
✅ **Phone Lookup** - Check if user exists (for login vs registration flow)
✅ **Auto-Registration** - Create new user accounts with phone number
✅ **Phone Number Normalization** - Format various phone formats to +X pattern

### Frontend (`/client/src/MobileLogin.jsx`)

✅ **3-Stage Flow**:

1. Phone Number Entry
2. OTP Verification
3. New User Registration (if needed)

✅ **Development Testing** - Test OTP displayed in UI
✅ **Error Handling** - Clear error messages at each stage
✅ **User-Friendly** - Progressive disclosure based on user existence

### Database

✅ Phone field added to User model with unique constraint
✅ Sparse index for optional phone field

## API Endpoints

### 1. Send OTP

```
POST /api/mobile/send-otp
Content-Type: application/json

{
  "phoneNumber": "+1 (555) 123-4567"  // or "+15551234567" or "5551234567"
}

Response: {
  "message": "OTP sent successfully. Valid for 5 minutes.",
  "phoneNumber": "+15551234567",
  "testOTP": "123456"  // Only in development
}
```

### 2. Verify OTP

```
POST /api/mobile/verify-otp
Content-Type: application/json

// Existing user login:
{
  "phoneNumber": "+15551234567",
  "otp": "123456"
}

// New user registration:
{
  "phoneNumber": "+15551234567",
  "otp": "123456",
  "name": "John Doe",
  "role": "patient"  // or "doctor"
}

Response: {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "5551234567@phone.local",
    "phone": "+15551234567",
    "role": "patient",
    "isVerified": true
  }
}
```

### 3. Check User Existence

```
GET /api/mobile/user/:phone

Response: {
  "exists": true,
  "phone": "+15551234567",
  "requiresNewUser": false
}
```

## Phone Number Formats Supported

✅ International: `+1 (555) 123-4567` → `+15551234567`
✅ US Format: `(555) 123-4567` → `+15551234567`
✅ Simple: `5551234567` → `+15551234567`
✅ International: `+919876543210` → stays as is
✅ With dashes: `555-123-4567` → `+15551234567`

## OTP Validation

- ✅ 6-digit numeric code
- ✅ 5-minute expiration
- ✅ Auto-delete after verification
- ✅ Auto-delete after expiration
- ✅ Clear error messages for common issues

## User Flow

### For Existing Users

1. Enter phone number → Click "Send OTP"
2. Receive OTP (see in console/UI)
3. Enter OTP → Click "Login"
4. Authenticated & redirected to dashboard

### For New Users

1. Enter phone number → Click "Send OTP"
2. Receive OTP
3. Enter OTP → Click "Continue"
4. System detects new user
5. Enter name & select role (patient/doctor)
6. Click "Create Account"
7. Authenticated & redirected to dashboard

## Testing

### Development Mode

Test OTP is displayed in the UI and console:

```
🧪 TEST OTP: 123456
```

### Using the System

1. Visit `http://localhost:5173/mobile-login`
2. Enter any phone number (format doesn't matter)
3. Click "Send OTP"
4. Copy the displayed OTP
5. Paste and verify
6. Complete registration or login

## Production Deployment

To send real SMS in production:

### Option 1: Twilio (Recommended)

```javascript
const twilio = require("twilio");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

await client.messages.create({
  body: `Your Elite Clinic OTP: ${otp}`,
  from: process.env.TWILIO_PHONE,
  to: phoneNumber,
});
```

### Option 2: Firebase Cloud Functions

```javascript
admin.auth().sendSignInLinkToEmail(phoneNumber, {
  // Firebase OTP handling
});
```

### Option 3: AWS SNS

```javascript
const sns = new AWS.SNS();
await sns
  .publish({
    PhoneNumber: phoneNumber,
    Message: `Your Elite Clinic OTP: ${otp}`,
  })
  .promise();
```

## Environment Variables

```
# Development (uses in-memory OTP store)
NODE_ENV=development
JWT_SECRET=supersecretkey123

# Production (add SMS service keys)
NODE_ENV=production
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890
```

## Security Features

✅ OTP stored in-memory (production: use Redis/database)
✅ OTP automatically expires after 5 minutes
✅ Phone numbers normalized to prevent duplicates
✅ JWT tokens used for session management
✅ Bearer token required for protected routes
✅ Rate limiting on auth endpoints (5 attempts/15 min)
✅ Phone number unique constraint in database

## User Experience

### Mobile Login Button

Located on Login page:

```
Or login with phone number
📱 Phone Login with OTP →
```

### Progress Indicators

- ✅ Clear stage titles
- ✅ Back buttons to previous stage
- ✅ Success/error messages
- ✅ Loading states
- ✅ Test OTP for development

## Files Created/Modified

### New Files

- `/server/routes/mobile.js` - Mobile auth routes
- `/server/config/firebase.js` - OTP generation & storage
- `/client/src/MobileLogin.jsx` - Mobile login UI component

### Modified Files

- `/server/server.js` - Added mobile routes
- `/server/models/User.js` - Added phone field with unique index
- `/client/src/Login.jsx` - Added mobile login link
- `/client/src/App.jsx` - Added mobile login route

## Future Enhancements

1. **SMS Verification**: Integrate real SMS provider (Twilio/Firebase)
2. **Resend OTP**: Add resend after 30 seconds
3. **Rate Limiting**: Limit OTP requests per phone number
4. **Phone Verification**: Mark user phone as verified after first login
5. **Recovery Codes**: Backup codes if OTP unavailable
6. **Biometric**: Fingerprint/Face ID option after OTP
7. **WhatsApp OTP**: Send OTP via WhatsApp instead of SMS
8. **Email Backup**: Send OTP to email if SMS fails
9. **Multi-Device**: Logout from all other devices after phone login
10. **Account Recovery**: Use phone to recover email-based accounts

## Status

✅ **Backend**: Complete and ready to test
✅ **Frontend**: Complete with mobile-friendly UI
✅ **Database**: Schema updated
✅ **Testing**: Development mode with test OTP display
✅ **Production Ready**: Ready for SMS integration

---

**Last Updated**: 13 April 2026
**Version**: 1.0
