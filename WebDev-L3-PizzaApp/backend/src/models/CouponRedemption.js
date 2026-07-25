const mongoose = require('mongoose');

const couponRedemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  discountAmount: { type: Number, required: true }
}, { timestamps: true });

// Prevent user from redeeming the same coupon more than once
couponRedemptionSchema.index({ userId: 1, couponId: 1 }, { unique: true });

module.exports = mongoose.model('CouponRedemption', couponRedemptionSchema);
