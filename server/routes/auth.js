const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendWelcomeEmail } = require('../config/smsEmail');

// Use consistent JWT secret
const SECRET = process.env.JWT_SECRET || "elite_clinic_super_secret_key_2026";
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const isPhonePlaceholderEmail = (email = '') => email.endsWith('@phone.local');

const sanitizeUser = (user) => ({
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
  isVerified: user.isVerified,
  avatar: user.avatar
});

const createAuthToken = (user) => jwt.sign(
  { id: user._id, role: user.role, email: user.email, phone: user.phone },
  SECRET,
  { expiresIn: '7d' }
);

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
    
    console.log(`User registered: ${normalizedEmail}`);
    
    // Generate a purely random OTP securely
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    await user.save();
    
    let emailSent = false;
    try {
      const emailResult = await sendVerificationEmail(normalizedEmail, verificationCode, name);
      emailSent = emailResult.success;
    } catch (emailErr) {
      console.warn('Email send error:', emailErr.message);
    }
    
    // If email service is NOT working, auto-verify the user so they can login
    if (!emailSent) {
      console.log(`Email service unavailable — auto-verifying user: ${normalizedEmail}`);
      user.isVerified = true;
      user.emailVerificationRequired = false;
      await user.save();
      
      const token = createAuthToken(user);
      return res.status(201).json({ 
        message: "Account created successfully!",
        token,
        user: sanitizeUser(user),
        requiresVerification: false
      });
    }
    
    // Email was sent — require verification
    res.status(201).json({ 
      message: "Account created! Please verify your email.",
      email: user.email,
      requiresVerification: true,
      verificationCode: verificationCode // Always include so modal can show it
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
      // Generate a fresh verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = code;
      await user.save();
      
      // Try sending email (may fail on cloud servers)
      let emailSent = false;
      try {
        const emailResult = await sendVerificationEmail(normalizedEmail, code, user.name);
        emailSent = emailResult.success;
      } catch (e) {
        console.warn('Re-send verification email failed:', e.message);
      }
      
      console.log(`Login blocked — email unverified: ${normalizedEmail}, emailSent: ${emailSent}`);
      return res.status(403).json({ 
        message: emailSent 
          ? "Please verify your email. A new code has been sent to your inbox."
          : "Please verify your email using the code shown below.",
        requiresVerification: true,
        email: normalizedEmail,
        verificationCode: code // Always include so UI can show it
      });
    }
    
    // Generate token using CONSISTENT secret
    const token = createAuthToken(user);

    console.log(`✅ User logged in: ${normalizedEmail}`);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login. Please try again." });
  }
});

// @route   POST api/auth/google
// @desc    Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential, role, location } = req.body;

    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: "Google sign-in is not configured on the server." });
    }

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ error: "Google account email could not be verified." });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const name = payload.name || normalizedEmail.split('@')[0];
    const picture = payload.picture || null;

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = new User({
        name,
        email: normalizedEmail,
        googleId,
        password: `google_oauth_${googleId}`,
        role: role === 'doctor' ? 'doctor' : 'patient',
        isVerified: true,
        emailVerificationRequired: false,
        avatar: picture,
        location: location?.type === 'Point' ? location : { type: 'Point', coordinates: [0, 0] }
      });
      await user.save();
    } else {
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      user.isVerified = true;
      user.emailVerificationRequired = false;
      if (isPhonePlaceholderEmail(user.email)) {
        user.email = normalizedEmail;
      }
      await user.save();
    }

    const token = createAuthToken(user);

    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

// @route   POST api/auth/link-email
// @desc    Convert a phone-only account into a full email/password account
router.post('/link-email', auth, async (req, res) => {
  try {
    const { name, email, password, role, specialty, location } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.phone) {
      return res.status(400).json({ error: "This account is already using an email login." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existingUser) {
      return res.status(400).json({ error: "That email is already linked to another account." });
    }

    const salt = await bcrypt.genSalt(10);
    user.name = name?.trim() || user.name;
    user.email = normalizedEmail;
    user.password = await bcrypt.hash(password, salt);
    user.role = role === 'doctor' ? 'doctor' : user.role;
    user.specialty = specialty || user.specialty;
    user.isVerified = true;
    user.emailVerificationRequired = false;
    if (location?.type === 'Point') {
      user.location = location;
    }
    await user.save();

    const token = createAuthToken(user);
    res.json({
      message: "Email login added successfully.",
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error("Link email error:", err);
    res.status(500).json({ error: "Failed to add email login to this account." });
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

    const token = createAuthToken(user);

    res.json({
      token,
      user: sanitizeUser(user),
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

    // Generate fresh code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    await user.save();

    // Send verification email
    let emailSent = false;
    try {
      const emailResult = await sendVerificationEmail(normalizedEmail, code, user.name);
      emailSent = emailResult.success;
    } catch (emailErr) {
      console.warn('Email send failed:', emailErr.message);
    }

    res.json({
      message: emailSent ? "Verification code sent to your email" : "Email could not be delivered. Use the code shown below.",
      verificationCode: !emailSent ? code : undefined, // Show code when email fails
      emailSent
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
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verificationCode !== code && code !== '123456') { // Allow universal dev fallback
      return res.status(401).json({ error: "Invalid verification code. Please try again." });
    }

    user.isVerified = true;
    user.emailVerificationRequired = false;
    user.verificationCode = null;
    await user.save();

    // DB update already completed inline completely.

    // Send welcome email
    await sendWelcomeEmail(normalizedEmail, user.name);

    // Generate token after verification
    const token = createAuthToken(user);

    res.json({
      message: "Email verified successfully!",
      token,
      user: sanitizeUser(user)
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
