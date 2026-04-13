const AuditLog = require('../models/AuditLog');

const logAction = async (userId, action, resource, resourceId, details, req) => {
  try {
    const auditLog = new AuditLog({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
      severity: determineSeverity(action),
    });
    await auditLog.save();
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
};

const determineSeverity = (action) => {
  const highSeverityActions = ['delete', 'prescribe', 'refund', 'system_config'];
  const mediumSeverityActions = ['update', 'payment', 'access_patient'];
  
  if (highSeverityActions.includes(action)) return 'high';
  if (mediumSeverityActions.includes(action)) return 'medium';
  return 'low';
};

module.exports = { logAction };
