const mongoose = require('mongoose');

const MyInvestmentSchema = new mongoose.Schema({
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investment_id: {
    type: String,
    required: true
  },
  title: String,
  image: String,
  purpose: String,
  reason: String,
  goalAmount: Number,
  currentContribution: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

// ✅ Prevent duplicate (same investor + same investment)
MyInvestmentSchema.index({ investment_id: 1, investorId: 1 }, { unique: true });

module.exports = mongoose.model('MyInvestment', MyInvestmentSchema);
