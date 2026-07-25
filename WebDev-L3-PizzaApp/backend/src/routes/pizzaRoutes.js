const express = require('express');
const router = express.Router();
const { getPizzas, createPizza, updatePizza, deletePizza } = require('../controllers/pizzaController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/', getPizzas);
router.post('/', adminOnly, createPizza);
router.put('/:id', adminOnly, updatePizza);
router.delete('/:id', adminOnly, deletePizza);

module.exports = router;
