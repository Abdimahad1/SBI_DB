const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  total_price: { type: Number, required: true },
  order_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
