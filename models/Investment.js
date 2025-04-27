const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
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
  goalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
