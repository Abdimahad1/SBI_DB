const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  original_price: { type: Number, required: true }, // <-- added field
  total: { type: Number, required: true },
  sold: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  type: { type: String, enum: ['Electronics', 'Clothes', 'Accessories'], required: true },
  image_url: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
