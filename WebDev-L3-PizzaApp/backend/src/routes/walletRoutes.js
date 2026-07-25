const express = require('express');
const router = express.Router();
const { getWallet, topUpWallet, payWithWallet, processRefund } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/', protect, getWallet);
router.post('/topup', protect, topUpWallet);
router.post('/pay', protect, payWithWallet);
router.post('/refund', adminOnly, processRefund);

module.exports = router;
