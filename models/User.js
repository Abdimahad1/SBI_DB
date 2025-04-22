const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Investor', 'BusinessOwner'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); // ✅ only the model here
