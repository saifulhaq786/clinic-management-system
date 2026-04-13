const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Admin role check middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Dashboard stats
router.get('/stats', auth, adminOnly, adminController.getDashboardStats);

// Top performing doctors
router.get('/top-doctors', auth, adminOnly, adminController.getTopDoctors);

// Audit logs
router.get('/audit-logs', auth, adminOnly, adminController.getAuditLogs);

// User management
router.get('/users', auth, adminOnly, adminController.getAllUsers);
router.patch('/users/:userId/suspend', auth, adminOnly, adminController.suspendUser);
router.patch('/users/:userId/approve', auth, adminOnly, adminController.approveDoctor);

module.exports = router;
