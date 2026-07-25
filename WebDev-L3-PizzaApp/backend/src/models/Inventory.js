const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['Base', 'Sauce', 'Cheese', 'Veggie'], 
    required: true 
  },
  stock: { type: Number, required: true, default: 0 },
  threshold: { type: Number, required: true, default: 20 },
  price: { type: Number, required: true, default: 0 },
  imageUrl: { type: String } // optional for UI
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
