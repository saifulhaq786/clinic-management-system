const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendWelcomeEmail } = require('../config/smsEmail');

// Use consistent JWT secret
const SECRET = process.env.JWT_SECRET || "elite_clinic_super_secret_key_2026";

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, location, specialty } = req.body;
    
    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Please provide name, email, password, and role" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`⚠️  Registration attempt with existing email: ${normalizedEmail}`);
      return res.status(400).json({ error: "Email already registered. Try logging in or use a different email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ 
      name, 
      email: normalizedEmail,
      password: hashedPassword, 
      role, 
      location, 
      specialty,
      isVerified: false,
      emailVerificationRequired: true // Flag for new registrations
    });
    
    await user.save();
    
    console.log(`✅ User registered: ${normalizedEmail}`);
    
    // Generate and send email verification code
    const { generateEmailVerificationCode, storeEmailVerificationCode } = require('../config/firebase');
    const verificationCode = generateEmailVerificationCode();
    storeEmailVerificationCode(normalizedEmail, verificationCode);
    
    const emailResult = await sendVerificationEmail(normalizedEmail, verificationCode, name);
    
    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      console.error('⚠️  Failed to send verification email');
    }
    
    res.status(201).json({ 
      message: "✅ Account created! Please verify your email to complete registration.",
      email: user.email,
      requiresVerification: true,
      testVerificationCode: process.env.NODE_ENV !== 'production' ? verificationCode : undefined
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      res.status(400).json({ error: `${field} "${value}" is already in use.` });
    } else {
      res.status(500).json({ error: "Server error during registration. Please try again." });
    }
  }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log(`❌ Login attempt with non-existent email: ${normalizedEmail}`);
      return res.status(401).json({ message: "❌ Email not registered. Please sign up first." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for email: ${normalizedEmail}`);
      return res.status(401).json({ message: "❌ Incorrect password. Please try again." });
    }
    
    // Auto-verify old users (those created before email verification feature)
    if (!user.isVerified && !user.emailVerificationRequired) {
      user.isVerified = true;
      await user.save();
      console.log(`✅ Auto-verified old user: ${normalizedEmail}`);
    }
    
    // Check if user has verified their email (NEW registrations only)
    if (!user.isVerified && user.emailVerificationRequired) {
      console.log(`⚠️  Login attempt with unverified email: ${normalizedEmail}`);
      return res.status(403).json({ 
        message: "⚠️ Please verify your email first. Check your inbox for the verification code.",
        requiresVerification: true,
        email: normalizedEmail
      });
    }
    
    // Generate token using CONSISTENT secret
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email }, 
      SECRET, 
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${normalizedEmail}`);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role, 
        phone: user.phone, 
        age: user.age, 
        gender: user.gender, 
        bloodGroup: user.bloodGroup, 
        specialty: user.specialty, 
        bio: user.bio,
        location: user.location,
        isVerified: user.isVerified
      } 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login. Please try again." });
  }
});

// @route   POST api/auth/google
// @desc    Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { name, email, googleId, picture } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new user from Google data
      user = new User({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        googleId,
        password: "google_oauth_user", // Placeholder for OAuth users
        role: 'patient', // Default role
        isVerified: true,
        avatar: picture,
        location: { type: 'Point', coordinates: [0, 0] }
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      await user.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: picture,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

// @route   POST api/auth/guest
// @desc    Login as guest with test credentials
router.post('/guest', async (req, res) => {
  try {
    const { userType } = req.body; // 'patient' or 'doctor'
    
    let testEmail, testPassword, testRole;
    
    if (userType === 'doctor') {
      testEmail = 'doctor@clinic.com';
      testPassword = 'password123';
      testRole = 'doctor';
    } else {
      testEmail = 'patient@clinic.com';
      testPassword = 'password123';
      testRole = 'patient';
    }

    let user = await User.findOne({ email: testEmail.toLowerCase() });

    // Create test user if doesn't exist
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      user = new User({
        name: userType === 'doctor' ? 'Dr. Test User' : 'Test Patient',
        email: testEmail.toLowerCase(),
        password: hashedPassword,
        role: testRole,
        isVerified: true,
        specialty: userType === 'doctor' ? 'General Medicine' : undefined,
        bio: userType === 'doctor' ? 'Available for consultations' : 'Test patient account',
        location: { type: 'Point', coordinates: [0, 0] } // Default location
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      message: `✅ Logged in as test ${userType}`
    });
  } catch (err) {
    console.error("Guest login error:", err);
    res.status(500).json({ error: "Guest login failed" });
  }
});

// @route   GET api/auth/verify
// @desc    Verify token and get user
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user, verified: true });
  } catch (err) {
    res.status(401).json({ error: "Token verification failed" });
  }
});

// @route   PATCH api/auth/update
// @desc    Update user profile details safely
router.patch('/update', auth, async (req, res) => {
  try {
    const { name, bio, specialty, phone, age, gender, bloodGroup } = req.body;
    
    const updateFields = {};
    
    // Standard text fields
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (specialty !== undefined) updateFields.specialty = specialty;
    if (phone !== undefined) updateFields.phone = phone;
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;

    // Handle age validation
    if (age === "" || age === null || age === undefined) {
      updateFields.age = null;
    } else {
      updateFields.age = Number(age); 
    }

    // Ensure gender matches the strict database rules
    const validGenders = ['Male', 'Female', 'Other', 'Not Specified'];
    if (validGenders.includes(gender)) {
      updateFields.gender = gender;
    }


    // Execute the database update
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: updateFields }, 
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    // Send the exact crash reason to the frontend
    res.status(500).json({ error: err.message });
  }
});

// @route   POST api/auth/send-email-verification
// @desc    Send email verification code
router.post('/send-email-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate verification code
    const { generateEmailVerificationCode, storeEmailVerificationCode } = require('../config/firebase');
    const code = generateEmailVerificationCode();
    storeEmailVerificationCode(normalizedEmail, code);

    // Send verification email
    const emailResult = await sendVerificationEmail(normalizedEmail, code, user.name);

    res.json({
      message: "Verification code sent to your email",
      testCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      emailSent: emailResult.success
    });
  } catch (err) {
    console.error("Send email verification error:", err.message);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

// @route   POST api/auth/verify-email-code
// @desc    Verify email code
router.post('/verify-email-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Verify code
    const { verifyEmailCode } = require('../config/firebase');
    const verification = verifyEmailCode(normalizedEmail, code);
    
    if (!verification.valid) {
      return res.status(401).json({ error: verification.message });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send welcome email
    await sendWelcomeEmail(normalizedEmail, user.name);

    // Generate token after verification
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error("Verify email code error:", err.message);
    res.status(500).json({ error: "Email verification failed" });
  }
});

// @route   POST api/auth/resend-email-verification
// @desc    Resend email verification code
router.post('/resend-email-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new verification code
    const { generateEmailVerificationCode, storeEmailVerificationCode } = require('../config/firebase');
    const code = generateEmailVerificationCode();
    storeEmailVerificationCode(normalizedEmail, code);

    // Send verification email
    await sendVerificationEmail(normalizedEmail, code, user.name);

    res.json({
      message: "Verification code resent to your email",
      testCode: process.env.NODE_ENV !== 'production' ? code : undefined
    });
  } catch (err) {
    console.error("Resend email verification error:", err.message);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

module.exports = router;