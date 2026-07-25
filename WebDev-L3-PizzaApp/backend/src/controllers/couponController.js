const Coupon = require('../models/Coupon');
const CouponRedemption = require('../models/CouponRedemption');

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit } = req.body;
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      usageLimit
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create coupon' });
  }
};

// @desc    Update a coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    Object.assign(coupon, req.body);
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update coupon' });
  }
};

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    await coupon.deleteOne();
    res.json({ message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon' });
  }
};

// @desc    Validate and calculate discount for a coupon (User)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const userId = req.user._id;

    if (!code || orderTotal === undefined) {
      return res.status(400).json({ message: 'Code and orderTotal are required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is no longer active' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value of ₹${coupon.minOrderValue} required` });
    }

    // Check if user already used this coupon
    const redemption = await CouponRedemption.findOne({ userId, couponId: coupon._id });
    if (redemption) {
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'flat') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    // Ensure discount doesn't exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    res.json({
      couponId: coupon._id,
      code: coupon.code,
      discountAmount,
      newTotal: orderTotal - discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to validate coupon' });
  }
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
