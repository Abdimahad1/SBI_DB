const mongoose = require('mongoose');

const BusinessProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  business_name: { type: String, required: true },
  location: { type: String, required: true },
  country: { type: String, default: '' },
  city: { type: String, default: '' },
  founded_year: { type: Number },
  status: { type: String, enum: ['operating', 'closed'], default: 'operating' }, // ✅ new standardized status field
  business_email: { type: String, required: true },
  website_url: { type: String },
  logo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BusinessProfile', BusinessProfileSchema);
