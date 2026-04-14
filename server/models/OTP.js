const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true, index: true }, // phone or email
  code: { type: String, required: true },
  expiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 } // Auto-delete after 15 mins
});

module.exports = mongoose.model('OTP', otpSchema);
