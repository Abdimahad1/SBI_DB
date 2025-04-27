const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Location', LocationSchema);
