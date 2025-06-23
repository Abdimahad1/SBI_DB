const mongoose = require('mongoose');

const InvestorProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  investor_name: { type: String, required: true },
  investor_location: { type: String, required: true },
  investor_email: { type: String, required: true },
  investor_website: { type: String }, // optional
  logo: { type: String }
}, { timestamps: true });

InvestorProfileSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('InvestorProfile', InvestorProfileSchema);
