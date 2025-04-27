const mongoose = require('mongoose');

const OverviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expenses: { type: Number, default: 0 },
  income: { type: Number, default: 0 },
  products_sold: { type: Number, default: 0 },
  locations: { type: Number, default: 0 },
  score_level: { type: String, default: 'Beginner' } // you can change later to number if you want
}, { timestamps: true });

module.exports = mongoose.model('Overview', OverviewSchema);
