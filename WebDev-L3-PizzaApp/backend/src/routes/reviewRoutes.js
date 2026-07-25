const express = require('express');
const router = express.Router();
const { getReviews, getAdminReviews, createReview, toggleReviewStatus } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// Public/User routes
router.get('/', getReviews);
router.post('/', protect, createReview);

// Admin routes
router.get('/admin', adminOnly, getAdminReviews);
router.put('/:id/toggle', adminOnly, toggleReviewStatus);

module.exports = router;
