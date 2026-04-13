const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String, // 'login', 'view_patient', 'prescribe', 'payment', etc.
  resource: String, // 'appointment', 'prescription', 'user', etc.
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  timestamp: { type: Date, default: Date.now },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
