const Pizza = require('../models/Pizza');

// @desc    Get all active pizzas (Public) or all pizzas (Admin)
// @route   GET /api/pizzas
// @access  Public
const getPizzas = async (req, res) => {
  try {
    // If admin, return all pizzas, else only active ones
    const query = (req.user && req.user.role === 'admin') ? {} : { isActive: true };
    const pizzas = await Pizza.find(query);
    res.json(pizzas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new pizza
// @route   POST /api/pizzas
// @access  Private/Admin
const createPizza = async (req, res) => {
  try {
    const pizza = new Pizza(req.body);
    const createdPizza = await pizza.save();
    res.status(201).json(createdPizza);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid pizza data' });
  }
};

// @desc    Update a pizza
// @route   PUT /api/pizzas/:id
// @access  Private/Admin
const updatePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ message: 'Pizza not found' });
    }
    
    Object.assign(pizza, req.body);
    const updatedPizza = await pizza.save();
    res.json(updatedPizza);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid pizza data' });
  }
};

// @desc    Delete a pizza
// @route   DELETE /api/pizzas/:id
// @access  Private/Admin
const deletePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ message: 'Pizza not found' });
    }
    
    await pizza.deleteOne();
    res.json({ message: 'Pizza removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPizzas, createPizza, updatePizza, deletePizza };
