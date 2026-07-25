const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Can be null if it's an admin manual adjust
  type: { type: String, enum: ['earn', 'redeem'], required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
