const mongoose = require('mongoose');

const predictionFieldsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  founded_year: { type: Number, required: true },
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  risk_score: { type: Number, required: true },
  category_list: { type: String, required: true },
  country_code: { type: String, required: true },
  city: { type: String, required: true },
  status: { type: String, required: true }
});

module.exports = mongoose.model('PredictionFieldsModel', predictionFieldsSchema);
