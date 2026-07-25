const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const LoyaltyConfig = require('../models/LoyaltyConfig');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const sendEmail = require('../utils/sendEmail');

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
};

// @desc    Verify Payment and Create Database Order
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderItems, totalAmount, deliveryAddress, phone } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'fallback_secret')
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    try {
      // Create Order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: totalAmount,
      paymentStatus: 'Completed',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      deliveryAddress,
      phone
    });

    // Process Coupon if provided
    if (req.body.couponId) {
      const Coupon = require('../models/Coupon');
      const CouponRedemption = require('../models/CouponRedemption');
      await Coupon.findByIdAndUpdate(req.body.couponId, { $inc: { usedCount: 1 } });
      await CouponRedemption.create({
        userId: req.user._id,
        couponId: req.body.couponId,
        orderId: order._id,
        discountAmount: 0 // Ideally passed from frontend or recalculated
      });
    }

    // Decrement Stock
      for (const item of orderItems) {
        const qty = item.quantity || 1;
        
        // base
        await Inventory.findOneAndUpdate({ name: item.base, category: 'Base' }, { $inc: { stock: -qty } });
        // sauce
        await Inventory.findOneAndUpdate({ name: item.sauce, category: 'Sauce' }, { $inc: { stock: -qty } });
        // cheese
        await Inventory.findOneAndUpdate({ name: item.cheese, category: 'Cheese' }, { $inc: { stock: -qty } });
        // veggies
        if (item.vegetables && item.vegetables.length > 0) {
          for (const veg of item.vegetables) {
            await Inventory.findOneAndUpdate({ name: veg, category: 'Veggie' }, { $inc: { stock: -qty } });
          }
        }
      }

      // 3. Award Loyalty Stamp
      const user = await User.findById(req.user._id);
      if (user) {
        user.loyaltyStamps += 1;
        
        // Log transaction
        await LoyaltyTransaction.create({
          userId: user._id,
          orderId: order._id,
          type: 'earn',
          amount: 1
        });

        const config = await LoyaltyConfig.findOne();
        const threshold = config ? config.stampsRequiredForReward : 5;
        
        if (user.loyaltyStamps >= threshold) {
          user.loyaltyStamps = user.loyaltyStamps - threshold;
          user.rewardsAvailable += 1;
          
          try {
            await sendEmail({
              email: user.email,
              subject: '🎉 Reward Unlocked!',
              message: `Congratulations ${user.name}! You have unlocked a new reward. You can apply it on your next order.`,
              html: `<h3>Congratulations ${user.name}!</h3><p>You have unlocked a new reward. You can apply it on your next order!</p>`
            });
          } catch (emailErr) {
            console.error('Failed to send reward email:', emailErr);
          }
        }
        await user.save();
      }

      res.status(200).json({ message: "Payment verified successfully", order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error processing order" });
    }
  } else {
    res.status(400).json({ message: "Invalid payment signature" });
  }
};

module.exports = { createOrder, verifyPayment };
