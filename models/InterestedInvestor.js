const mongoose = require('mongoose');

const InterestedInvestorSchema = new mongoose.Schema({
  investment_id: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // investor's ID
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // business owner's ID
  name: { type: String, required: true },
  email: { type: String },
  message: { type: String },
  image: { type: String },
  title: { type: String },
  purpose: { type: String },
  goalAmount: { type: Number },
  currentContribution: { type: Number },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('InterestedInvestor', InterestedInvestorSchema);

