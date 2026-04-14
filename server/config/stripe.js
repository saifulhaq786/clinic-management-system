const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe;
if (stripeKey) {
  stripe = require('stripe')(stripeKey);
}

const createPaymentIntent = async (amount, metadata) => {
  try {
    if (!stripe) {
      // Mock successful payment intent if no keys are provided
      console.log('Mocking Stripe Payment Intent (No API Key found)');
      return {
        id: `pi_mock_${Date.now()}`,
        client_secret: `secret_mock_${Date.now()}`,
        amount: Math.round(amount * 100)
      };
    }

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
    if (!stripe) {
      console.log(`Mocking Stripe Payment Confirmation for ${paymentIntentId}`);
      return { id: paymentIntentId, status: 'succeeded' };
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to confirm payment: ${error.message}`);
  }
};

const refundPayment = async (paymentIntentId) => {
  try {
    if (!stripe) {
      console.log(`Mocking Stripe Refund for ${paymentIntentId}`);
      return { id: `re_mock_${Date.now()}`, object: 'refund', status: 'succeeded' };
    }
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund;
  } catch (error) {
    throw new Error(`Refund failed: ${error.message}`);
  }
};

module.exports = { createPaymentIntent, confirmPayment, refundPayment };
