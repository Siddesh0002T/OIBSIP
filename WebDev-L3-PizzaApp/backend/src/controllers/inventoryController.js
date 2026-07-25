const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({});
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new inventory item
// @route   POST /api/inventory
// @access  Private/Admin
const createInventoryItem = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid item data' });
  }
};

// @desc    Update stock for an inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
const updateStock = async (req, res) => {
  const { stock, threshold, price, name, category } = req.body;
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (stock !== undefined) item.stock = stock;
    if (threshold !== undefined) item.threshold = threshold;
    if (price !== undefined) item.price = price;
    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getInventory, createInventoryItem, updateStock, deleteInventoryItem };
