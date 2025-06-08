const mongoose = require('mongoose');

const BusinessProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  business_name: { type: String, required: true },
  location: { type: String, required: true },
  business_email: { type: String, required: true },
  logo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BusinessProfile', BusinessProfileSchema);