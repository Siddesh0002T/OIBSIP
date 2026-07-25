const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    name: { type: String, required: true },
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    vegetables: [{ type: String }],
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['razorpay', 'wallet'], default: 'razorpay' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  orderStatus: {
    type: String,
    enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Received'
  },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  isPriority: { type: Boolean, default: false },
  cancelReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
