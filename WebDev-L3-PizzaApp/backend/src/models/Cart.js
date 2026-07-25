const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  pizzaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza',
    required: false, // Optional, since custom pizzas don't have a direct pizza ID
  },
  name: {
    type: String,
    required: true,
  },
  base: { type: String, required: true },
  sauce: { type: String, required: true },
  cheese: { type: String, required: true },
  vegetables: { type: [String], default: [] },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  imageUrl: { type: String }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [cartItemSchema],
}, {
  timestamps: true,
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
