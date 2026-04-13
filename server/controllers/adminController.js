const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const { logAction } = require('../utils/audit');

// Admin dashboard analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const doctors = await User.countDocuments({ role: 'doctor' });
    const patients = await User.countDocuments({ role: 'patient' });
    
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyRevenue = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$completedAt' } },
          revenue: { $sum: '$amount' },
          appointments: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    await logAction(req.user.id, 'view_admin_dashboard', 'system', null, {}, req);

    res.json({
      users: { total: totalUsers, doctors, patients },
      appointments: { total: totalAppointments, completed: completedAppointments, cancelled: cancelledAppointments },
      revenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Top performing doctors
exports.getTopDoctors = async (req, res) => {
  try {
    const topDoctors = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$doctorId', appointmentCount: { $sum: 1 } } },
      { $sort: { appointmentCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } }
    ]);

    res.json(topDoctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, userId, days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const query = { timestamp: { $gte: startDate } };
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await AuditLog.find(query).sort('-timestamp').limit(1000);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User management
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, { isActive: false });

    await logAction(req.user.id, 'suspend_user', 'user', userId, {}, req);

    res.json({ message: 'User suspended' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, { isVerified: true, isActive: true });

    await logAction(req.user.id, 'approve_doctor', 'user', userId, {}, req);

    res.json({ message: 'Doctor approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const users = await User.find(query).select('-password').sort('-createdAt');

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
