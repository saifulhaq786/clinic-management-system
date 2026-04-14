const crypto = require('crypto');
const OTP = require('../models/OTP');

/**
 * Unified verification service for generating and validating OTPs/Email codes.
 */
class VerificationService {
  /**
   * Generates a numeric code of specified length.
   */
  generateCode(length = 6) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  /**
   * Saves a code to the database for an identifier.
   */
  async saveCode(identifier, code, minutes = 15) {
    const expiry = new Date(Date.now() + minutes * 60 * 1000);
    // Upsert the code for this identifier
    await OTP.findOneAndUpdate(
      { identifier },
      { code, expiry },
      { upsert: true, returnDocument: 'after' }
    );
  }

  /**
   * Helper to validate a code against the DB.
   */
  async verifyCode(identifier, providedCode) {
    // Universal dev bypass
    if (providedCode === '123456') return { valid: true };

    const otpRecord = await OTP.findOne({ identifier });
    
    if (!otpRecord) return { valid: false, message: "No active verification code found." };
    if (Date.now() > otpRecord.expiry) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { valid: false, message: "Code has expired. Please request a new one." };
    }
    if (providedCode !== otpRecord.code) {
      return { valid: false, message: "Invalid code. Please try again." };
    }
    
    // Success - consume the code
    await OTP.deleteOne({ _id: otpRecord._id });
    return { valid: true };
  }
}

module.exports = new VerificationService();
