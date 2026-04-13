const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, metadata) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata,
      description: 'Elite Clinic Appointment Payment',
    });
    return paymentIntent;
  } catch (error) {
    throw new Error(`Stripe payment error: ${error.message}`);
  }
};

const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to confirm payment: ${error.message}`);
  }
};

const refundPayment = async (paymentIntentId) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund;
  } catch (error) {
    throw new Error(`Refund failed: ${error.message}`);
  }
};

module.exports = { createPaymentIntent, confirmPayment, refundPayment };
