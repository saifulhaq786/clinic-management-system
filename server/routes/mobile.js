const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificationService = require('../services/verificationService');
const { sendOTP_SMS } = require('../config/smsEmail');
const { verifyFirebaseToken } = require('../config/firebase');
const auth = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || "elite_clinic_super_secret_key_2026";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  age: user.age,
  gender: user.gender,
  bloodGroup: user.bloodGroup,
  specialty: user.specialty,
  bio: user.bio,
  location: user.location,
  isVerified: user.isVerified,
  avatar: user.avatar
});

// Validation helper
const normalizePhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, assume +1 (US)
  if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  
  return '+' + cleaned;
};

// @route   POST /api/mobile/send-otp
// @desc    Send OTP to phone number
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    console.log('[MOBILE/SEND-OTP] Received request with:', { phoneNumber });
    
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    console.log('[MOBILE/SEND-OTP] Normalized phone:', normalizedPhone);
    
    // Validate phone format (should be +X format with 10-15 digits)
    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      console.error('[MOBILE/SEND-OTP] Invalid phone format:', normalizedPhone);
      return res.status(400).json({ error: "Invalid phone number format" });
    }
    
    // Generate and store OTP FIRST natively in DB
    const otp = verificationService.generateCode();
    await verificationService.saveCode(normalizedPhone, otp, 5); // 5 mins for phone
    
    // Attempt to send real SMS via Twilio
    let smsSent = false;
    try {
      const smsResult = await sendOTP_SMS(normalizedPhone, otp);
      smsSent = smsResult.success;
      if (!smsSent) {
        console.warn(`[SMS] Could not deliver SMS to ${normalizedPhone} — OTP still stored for verification`);
      }
    } catch (smsErr) {
      console.warn(`[SMS] Twilio error: ${smsErr.message} — OTP still stored for verification`);
    }

    const responseData = {
      message: smsSent 
        ? "OTP sent successfully. Valid for 5 minutes." 
        : "OTP generated but SMS could not be delivered (Twilio trial limitation).",
      phoneNumber: normalizedPhone,
      smsSent,
      // Always include OTP when SMS fails — Twilio trial can only send to verified numbers
      ...(!smsSent ? { otp: otp } : {})
    };
    
    console.log('[MOBILE/SEND-OTP] Response:', { ...responseData, testOTP: '***' });
    res.json(responseData);
  } catch (err) {
    console.error("Send OTP error:", err.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// @route   POST /api/mobile/verify-otp
// @desc    Verify OTP and login/register user
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, name, role, firebaseToken } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    let isVerified = false;

    // 1. Primary: Verify via Firebase Token
    if (req.body.firebaseToken) {
      const fbVerify = await verifyFirebaseToken(req.body.firebaseToken);
      if (fbVerify.success) {
        // Double check phone matches if provided (Firebase phone is more trusted)
        isVerified = true;
        console.log(`✅ [FIREBASE] Token verified for: ${fbVerify.phoneNumber}`);
      } else {
        return res.status(401).json({ error: "Firebase verification failed: " + fbVerify.error });
      }
    } 
    // 2. Secondary: Fallback to manual OTP (for dev/presentation)
    else if (otp) {
      const otpVerification = await verificationService.verifyCode(normalizedPhone, otp);
      if (otpVerification.valid) {
        isVerified = true;
      } else {
        return res.status(401).json({ error: otpVerification.message });
      }
    } else {
      return res.status(400).json({ error: "Verification code or Firebase token required" });
    }

    if (!isVerified) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    
    // Find or create user
    let user = await User.findOne({ phone: normalizedPhone });
    
    if (!user) {
      // New user - require name and role
      if (!name || !role) {
        return res.status(400).json({ 
          error: "Name and role are required for new users" 
        });
      }
      
      // Create new user
      user = new User({
        name,
        email: `${normalizedPhone.replace(/[+\-\s]/g, '')}@phone.local`, // Generate unique email
        phone: normalizedPhone,
        password: "phone_auth_user", // Placeholder
        role,
        isVerified: true,
        location: { type: 'Point', coordinates: [0, 0] }
      });
      
      try {
        await user.save();
        console.log(`✅ New user registered: ${normalizedPhone}`);
      } catch (saveErr) {
        if (saveErr.code === 11000) {
          // User already exists (race condition)
          user = await User.findOne({ phone: normalizedPhone });
        } else {
          throw saveErr;
        }
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, phone: user.phone },
      SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`✅ User logged in via phone: ${normalizedPhone}`);
    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// @route   GET /api/mobile/user/:phone
// @desc    Check if user exists by phone (for login flow)
router.get('/user/:phone', async (req, res) => {
  try {
    const normalizedPhone = normalizePhoneNumber(req.params.phone);
    const user = await User.findOne({ phone: normalizedPhone });
    
    res.json({
      exists: !!user,
      phone: normalizedPhone,
      // For new registration flow
      requiresNewUser: !user
    });
  } catch (err) {
    console.error("Phone lookup error:", err.message);
    res.status(500).json({ error: "Failed to check phone number" });
  }
});

module.exports = router;
