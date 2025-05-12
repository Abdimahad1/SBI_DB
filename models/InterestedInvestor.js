const mongoose = require('mongoose');

const InterestedInvestorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investment_id: {
    type: String,
    required: true
  },
  name: String,
  email: String,
  message: String,
  image: String
}, { timestamps: true });

module.exports = mongoose.model('InterestedInvestor', InterestedInvestorSchema);
