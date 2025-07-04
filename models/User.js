const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true },
  password: String,
  role: { 
    type: String, 
    enum: ['Investor', 'BusinessOwner', 'Admin'], 
    required: true 
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  avatar: { 
    type: String, 
    default: ""   // allow user profile pictures later
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otp: String,
  otpExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
