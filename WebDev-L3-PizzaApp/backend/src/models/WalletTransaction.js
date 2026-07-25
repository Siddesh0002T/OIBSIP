const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  type: { type: String, enum: ['topup', 'debit', 'refund'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  referenceId: { type: String }, // e.g. orderId or razorpayPaymentId
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
