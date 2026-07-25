const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  base: { type: String },
  sauce: { type: String },
  cheese: { type: String },
  vegetables: [{ type: String }],
  price: { type: Number, required: true },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Pizza', pizzaSchema);
