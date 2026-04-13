const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: You'll need to create a service account key in Firebase Console
// For development, we'll use a simpler approach with custom tokens

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDemoKeyForDevelopment",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "elite-clinic.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "elite-clinic-demo",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "elite-clinic.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abc123def456"
};

// Store OTP in memory (for development - use Redis/database in production)
const otpStore = new Map();

// Store email verification codes in memory
const emailVerificationStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateEmailVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = (phoneNumber, otp) => {
  const expireTime = Date.now() + (5 * 60 * 1000); // 5 minutes
  otpStore.set(phoneNumber, { otp, expireTime });
  console.log(`📱 OTP sent to ${phoneNumber}: ${otp}`);
};

const storeEmailVerificationCode = (email, code) => {
  const expireTime = Date.now() + (15 * 60 * 1000); // 15 minutes
  emailVerificationStore.set(email, { code, expireTime });
  console.log(`📧 Email verification code for ${email}: ${code}`);
};

const verifyOTP = (phoneNumber, otp) => {
  const stored = otpStore.get(phoneNumber);
  
  if (!stored) {
    return { valid: false, message: "No OTP found. Request a new one." };
  }
  
  if (Date.now() > stored.expireTime) {
    otpStore.delete(phoneNumber);
    return { valid: false, message: "OTP expired. Request a new one." };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: "Invalid OTP. Please try again." };
  }
  
  otpStore.delete(phoneNumber);
  return { valid: true, message: "OTP verified successfully" };
};

const verifyEmailCode = (email, code) => {
  const stored = emailVerificationStore.get(email);
  
  if (!stored) {
    return { valid: false, message: "No verification code found. Request a new one." };
  }
  
  if (Date.now() > stored.expireTime) {
    emailVerificationStore.delete(email);
    return { valid: false, message: "Verification code expired. Request a new one." };
  }
  
  if (stored.code !== code) {
    return { valid: false, message: "Invalid verification code. Please try again." };
  }
  
  emailVerificationStore.delete(email);
  return { valid: true, message: "Email verified successfully" };
};

module.exports = {
  firebaseConfig,
  generateOTP,
  generateEmailVerificationCode,
  storeOTP,
  storeEmailVerificationCode,
  verifyOTP,
  verifyEmailCode,
  otpStore,
  emailVerificationStore
};
