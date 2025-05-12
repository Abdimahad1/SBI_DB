const mongoose = require('mongoose');

const InterestedInvestorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investment_id: {
    type: String, // Keeping as string to match frontend
    required: true
  },
  name: String,
  email: String,
  message: String,
  image: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('InterestedInvestor', InterestedInvestorSchema);
