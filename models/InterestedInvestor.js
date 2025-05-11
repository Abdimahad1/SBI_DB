const mongoose = require('mongoose');

const InterestedInvestorSchema = new mongoose.Schema({
  business_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user_id: {  // ✅ Add this
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  email: String,
  phone: String,
  message: String,
  image: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });


module.exports = mongoose.model('InterestedInvestor', InterestedInvestorSchema);
