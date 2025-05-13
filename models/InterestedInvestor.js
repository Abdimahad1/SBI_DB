const mongoose = require('mongoose');

const InterestedInvestorSchema = new mongoose.Schema({
  investment_id: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // will be added from JWT middleware
  name: { type: String, required: true },
  email: { type: String },
  message: { type: String },
  image: { type: String },
  title: { type: String },
  purpose: { type: String },
  goalAmount: { type: Number },
  currentContribution: { type: Number },
  status: { type: String, default: 'pending' }, // can be 'pending', 'accepted', 'rejected'
}, { timestamps: true });

module.exports = mongoose.model('InterestedInvestor', InterestedInvestorSchema);
