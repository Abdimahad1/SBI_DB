const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  business_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
