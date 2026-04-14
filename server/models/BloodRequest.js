const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  bloodType: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  hospitalName: { type: String, required: true },
  location: { type: String, required: true }, // Simple string for hospital location
  unitsRequired: { type: Number, required: true, min: 1 },
  contactPhone: { type: String, required: true },
  urgency: { type: String, enum: ['Normal', 'Urgent', 'Critical'], default: 'Normal' },
  status: { type: String, enum: ['Open', 'Fulfilled', 'Closed'], default: 'Open' },
  donors: [{
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pledged', 'Donated'], default: 'Pledged' },
    pledgedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
