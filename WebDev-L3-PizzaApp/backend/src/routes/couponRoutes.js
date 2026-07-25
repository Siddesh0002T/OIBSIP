const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// User routes
router.post('/validate', protect, validateCoupon);

// Admin routes
router.get('/', adminOnly, getCoupons);
router.post('/', adminOnly, createCoupon);
router.put('/:id', adminOnly, updateCoupon);
router.delete('/:id', adminOnly, deleteCoupon);

module.exports = router;
