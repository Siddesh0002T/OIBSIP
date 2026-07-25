const express = require('express');
const router = express.Router();
const { getInventory, createInventoryItem, updateStock, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.route('/')
  .get(getInventory)
  .post(adminOnly, createInventoryItem);

router.route('/:id')
  .put(adminOnly, updateStock)
  .delete(adminOnly, deleteInventoryItem);

module.exports = router;
