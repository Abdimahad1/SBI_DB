// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Investor', 'BusinessOwner'], required: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otp: String,
  otpExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);