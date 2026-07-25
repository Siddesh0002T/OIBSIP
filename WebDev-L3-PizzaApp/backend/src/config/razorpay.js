const Razorpay = require('razorpay');

let razorpayInstance;

try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_secret',
  });
} catch (error) {
  console.error("Failed to initialize Razorpay:", error);
}

module.exports = razorpayInstance;
