const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');
const { createPaymentIntent } = require('../config/stripe');
const { logAction } = require('../utils/audit');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const paymentIntent = await createPaymentIntent(amount, {
      appointmentId,
      userId,
      doctorId: appointment.doctorId,
    });

    // Create transaction record
    const transaction = new Transaction({
      appointmentId,
      patientId: userId,
      doctorId: appointment.doctorId,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    await transaction.save();

    await logAction(userId, 'payment_initiated', 'transaction', transaction._id, { amount }, req);

    res.json({
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    // Update appointment as paid
    await Appointment.findByIdAndUpdate(transaction.appointmentId, { isPaid: true });

    await logAction(req.user.id, 'payment_completed', 'transaction', transactionId, { amount: transaction.amount }, req);

    res.json({ message: 'Payment confirmed', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({
      $or: [{ patientId: userId }, { doctorId: userId }],
    }).populate('appointmentId').sort('-createdAt');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
