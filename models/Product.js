const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true }, // ✅ Added field
  sold: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  type: { type: String, enum: ['Electronics', 'Clothes', 'Accessories'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
