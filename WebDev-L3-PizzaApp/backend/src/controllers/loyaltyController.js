const User = require('../models/User');
const LoyaltyConfig = require('../models/LoyaltyConfig');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');

// @desc    Get user's loyalty status
// @route   GET /api/loyalty/me
// @access  Private
const getLoyaltyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyStamps rewardsAvailable');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const config = await LoyaltyConfig.findOne();
    res.json({
      loyaltyStamps: user.loyaltyStamps,
      rewardsAvailable: user.rewardsAvailable,
      stampsRequiredForReward: config ? config.stampsRequiredForReward : 5
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Redeem a loyalty reward
// @route   POST /api/loyalty/redeem
// @access  Private
const redeemReward = async (req, res) => {
  try {
    const { orderSubtotal } = req.body;
    const user = await User.findById(req.user._id);

    if (user.rewardsAvailable <= 0) {
      return res.status(400).json({ message: 'No rewards available to redeem' });
    }

    const config = await LoyaltyConfig.findOne();
    if (!config) {
      return res.status(500).json({ message: 'Loyalty config not found' });
    }

    let discountAmount = 0;
    if (config.rewardType === 'percent_discount') {
      discountAmount = (orderSubtotal * config.rewardValue) / 100;
    } else if (config.rewardType === 'free_pizza') {
      // Assuming a free pizza is a fixed amount discount, or just config.rewardValue
      discountAmount = config.rewardValue; 
    }

    // Don't let discount exceed subtotal
    if (discountAmount > orderSubtotal) {
      discountAmount = orderSubtotal;
    }

    // Decrement reward
    user.rewardsAvailable -= 1;
    await user.save();

    // Log transaction
    await LoyaltyTransaction.create({
      userId: user._id,
      type: 'redeem',
      amount: discountAmount
    });

    res.json({
      message: 'Reward redeemed successfully',
      discountAmount,
      newTotal: orderSubtotal - discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get loyalty config (Admin)
// @route   GET /api/loyalty/config
// @access  Private/Admin
const getLoyaltyConfig = async (req, res) => {
  try {
    const config = await LoyaltyConfig.findOne();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update loyalty config (Admin)
// @route   PUT /api/loyalty/config
// @access  Private/Admin
const updateLoyaltyConfig = async (req, res) => {
  try {
    const { stampsRequiredForReward, rewardType, rewardValue } = req.body;
    let config = await LoyaltyConfig.findOne();
    
    if (!config) {
      config = new LoyaltyConfig({ stampsRequiredForReward, rewardType, rewardValue });
    } else {
      if (stampsRequiredForReward !== undefined) config.stampsRequiredForReward = stampsRequiredForReward;
      if (rewardType !== undefined) config.rewardType = rewardType;
      if (rewardValue !== undefined) config.rewardValue = rewardValue;
    }

    const updatedConfig = await config.save();
    res.json(updatedConfig);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get loyalty leaderboard (Admin)
// @route   GET /api/loyalty/leaderboard
// @access  Private/Admin
const getLeaderboard = async (req, res) => {
  try {
    // Top users by lifetime stamps. We can approximate this by summing up 'earn' transactions for each user
    const leaderboard = await LoyaltyTransaction.aggregate([
      { $match: { type: 'earn' } },
      { $group: { _id: '$userId', totalEarned: { $sum: '$amount' } } },
      { $sort: { totalEarned: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 1, name: '$user.name', email: '$user.email', totalEarned: 1 } }
    ]);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLoyaltyStatus,
  redeemReward,
  getLoyaltyConfig,
  updateLoyaltyConfig,
  getLeaderboard
};
