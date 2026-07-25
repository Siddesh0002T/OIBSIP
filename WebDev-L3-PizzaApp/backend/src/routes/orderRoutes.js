const express = require('express');
const router = express.Router();
const { getMyOrders, getOrderById, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.route('/')
  .get(adminOnly, getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(adminOnly, updateOrderStatus);

module.exports = router;
