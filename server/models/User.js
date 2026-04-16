const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'clinic_admin'], default: 'patient' },
  
  // --- NEW MEDICAL & CONTACT DETAILS ---
  phone: { type: String, default: undefined, sparse: true, unique: true },
  age: { type: Number, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Not Specified'], default: 'Not Specified' },
  bloodGroup: { type: String, default: '' },
  
  // Doctor Specific
  specialty: { type: String, default: 'General' },
  bio: { type: String, default: 'Dedicated medical professional.' },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  affiliatedClinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
  
  // Availability
  isAvailable: { type: Boolean, default: true },
  
  // Auth & Verification
  isVerified: { type: Boolean, default: false },
  emailVerificationRequired: { type: Boolean, default: false },
  verificationCode: { type: String, default: null }, // Email
  phoneOTP: { type: String, default: null }, // Phone
  otpExpiry: { type: Date, default: null }, // Shared expiry for current verification logic
  googleId: { type: String, default: null },
  firebaseUid: { type: String, default: undefined, unique: true, sparse: true },
  avatar: { type: String, default: null },
  
  // Location
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ location: "2dsphere" });
userSchema.index({ email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
