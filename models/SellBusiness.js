const mongoose = require('mongoose');

const SellBusinessSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: { type: String, required: true },
  price: { type: Number, required: true },
  reason: { type: String, required: true },
  contact: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('SellBusiness', SellBusinessSchema);
