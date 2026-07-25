const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const LoyaltyConfig = require('../models/LoyaltyConfig');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const sendEmail = require('../utils/sendEmail');

// @desc    Get user wallet balance and transactions
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    // Auto-create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    }

    const transactions = await WalletTransaction.find({ walletId: wallet._id }).sort({ createdAt: -1 });
    
    res.json({
      balance: wallet.balance,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching wallet' });
  }
};

// @desc    Top-up wallet balance
// @route   POST /api/wallet/topup
// @access  Private
const topUpWallet = async (req, res) => {
  const { amount, razorpayPaymentId } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    }

    wallet.balance += Number(amount);
    await wallet.save();

    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      type: 'topup',
      amount: Number(amount),
      description: 'Wallet Top-up',
      referenceId: razorpayPaymentId
    });

    res.json({ balance: wallet.balance, transaction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to top-up wallet' });
  }
};

// @desc    Pay for an order using Wallet
// @route   POST /api/wallet/pay
// @access  Private
const payWithWallet = async (req, res) => {
  const { amount, orderItems, deliveryAddress, phone } = req.body;
  
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    wallet.balance -= Number(amount);
    await wallet.save();

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: amount,
      paymentStatus: 'Completed',
      paymentMethod: 'wallet',
      deliveryAddress,
      phone
    });

    // Create transaction record
    await WalletTransaction.create({
      walletId: wallet._id,
      type: 'debit',
      amount: Number(amount),
      description: `Paid for Order #${order._id}`,
      referenceId: order._id.toString()
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
      await Inventory.findOneAndUpdate({ name: item.base, category: 'Base' }, { $inc: { stock: -qty } });
      await Inventory.findOneAndUpdate({ name: item.sauce, category: 'Sauce' }, { $inc: { stock: -qty } });
      await Inventory.findOneAndUpdate({ name: item.cheese, category: 'Cheese' }, { $inc: { stock: -qty } });
      if (item.vegetables && item.vegetables.length > 0) {
        for (const veg of item.vegetables) {
          await Inventory.findOneAndUpdate({ name: veg, category: 'Veggie' }, { $inc: { stock: -qty } });
        }
      }
    }

    // Award Loyalty Stamp
    const user = await User.findById(req.user._id);
    if (user) {
      user.loyaltyStamps += 1;
      await LoyaltyTransaction.create({ userId: user._id, orderId: order._id, type: 'earn', amount: 1 });

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

    res.json({ message: 'Payment successful', order, balance: wallet.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process wallet payment' });
  }
};

// @desc    Process refund to wallet (Admin)
// @route   POST /api/wallet/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  const { userId, amount, orderId, reason } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  try {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId, balance: 0 });
    }

    wallet.balance += Number(amount);
    await wallet.save();

    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      type: 'refund',
      amount: Number(amount),
      description: `Refund for Order #${orderId}: ${reason}`,
      referenceId: orderId
    });

    res.json({ message: 'Refund successful', balance: wallet.balance, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
};

module.exports = { getWallet, topUpWallet, payWithWallet, processRefund };
