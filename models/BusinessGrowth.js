const mongoose = require('mongoose');

const BusinessGrowthSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 1 = Jan, 12 = Dec
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  products_sold: { type: Number, default: 0 }
}, { timestamps: true });

BusinessGrowthSchema.index({ user_id: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('BusinessGrowth', BusinessGrowthSchema);
