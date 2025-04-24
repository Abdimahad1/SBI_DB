const mongoose = require('mongoose');

const BusinessGrowthSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: { type: String, required: true },
  percentage: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('BusinessGrowth', BusinessGrowthSchema);
