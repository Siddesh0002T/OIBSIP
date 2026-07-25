const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  discountValue: { type: Number, required: true }, // % or flat amount
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number }, // applicable for percentage
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number }, // total times it can be used across all users
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
