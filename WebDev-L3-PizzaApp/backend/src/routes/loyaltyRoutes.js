const express = require('express');
const router = express.Router();
const { 
  getLoyaltyStatus, 
  redeemReward, 
  getLoyaltyConfig, 
  updateLoyaltyConfig, 
  getLeaderboard 
} = require('../controllers/loyaltyController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// User routes
router.get('/me', protect, getLoyaltyStatus);
router.post('/redeem', protect, redeemReward);

// Admin routes
router.get('/config', adminOnly, getLoyaltyConfig);
router.put('/config', adminOnly, updateLoyaltyConfig);
router.get('/leaderboard', adminOnly, getLeaderboard);

module.exports = router;
