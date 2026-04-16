const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The clinic_admin
  
  description: { type: String, default: '' },
  
  // Verification
  isVerified: { type: Boolean, default: false },
  
  // Location details with structured address
  address: {
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  
  // Verification & Trust
  registrationNumber: { type: String, required: true, unique: true }, // Medical registration board ID
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },

  // Relationship
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  createdAt: { type: Date, default: Date.now }
});

clinicSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Clinic', clinicSchema);
