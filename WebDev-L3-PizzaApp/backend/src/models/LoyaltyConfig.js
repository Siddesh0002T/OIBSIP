const mongoose = require('mongoose');

const loyaltyConfigSchema = new mongoose.Schema({
  stampsRequiredForReward: { type: Number, default: 5 },
  rewardType: { type: String, enum: ['free_pizza', 'percent_discount'], default: 'percent_discount' },
  rewardValue: { type: Number, default: 20 }, // 20% discount or ₹ value
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyConfig', loyaltyConfigSchema);
