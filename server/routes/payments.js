const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Create payment intent for appointment
router.post('/intent', auth, paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', auth, paymentController.confirmPayment);

// Get transaction history
router.get('/history', auth, paymentController.getTransactionHistory);

module.exports = router;
