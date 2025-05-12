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
    type: String, // ✅ This is important to connect with notifications and status updates
    required: true,
    unique: true // Optional but helpful to prevent duplicates
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

module.exports = mongoose.model('MyInvestment', MyInvestmentSchema);
