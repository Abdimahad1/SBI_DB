const mongoose = require('mongoose');

const BusinessOverviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  total_expenses: { type: Number, default: 0 },
  total_income: { type: Number, default: 0 },
  products_sold: { type: Number, default: 0 },
  locations: { type: Number, default: 0 },
  risk_level: { type: String, enum: ['Low', 'Medium', 'High', 'Warning'], default: 'Low' },
  risk_message: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('BusinessOverview', BusinessOverviewSchema);
