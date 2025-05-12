const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  _id: {
    type: String, // Allows custom ID like "inv-12345-abc"
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  image: { type: String, required: true },
  purpose: { type: String, required: true },
  reason: { type: String, required: true },
  currentContribution: { type: Number, default: 0 },
  goalAmount: { type: Number, required: true },
  category: { type: String, default: 'General' },

  // ✅ New field to differentiate investor-submitted cards
  isInvestorInitiated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
