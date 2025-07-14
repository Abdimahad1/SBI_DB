const mongoose = require('mongoose');

const BusinessProfileFormSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: { type: String, required: true },
  foundedYear: { type: Number, required: true },
  businessStatus: { 
    type: String, 
    enum: ['operating', 'acquired', 'closed', 'ipo'],
    required: true 
  },
  marketCategory: { 
    type: String, 
    enum: ['Technology', 'Retail', 'Healthcare', 'Finance', 'Manufacturing', 'Energy', 'Education', 'Other'],
    required: true 
  },
  countryCode: { 
    type: String, 
    enum: ['SOM', 'USA', 'CAN', 'AUS', 'DEN', 'FRA', 'JAP', 'UK', 'OTHER'],
    required: true 
  },
  city: { type: String, required: true },
  fundingTotalUSD: { type: Number, default: 0 },
  fundingRounds: { type: Number, default: 0 }, // ✅ added default
  seedFunding: { type: Number, default: 0 },
  ventureFunding: { type: Number, default: 0 },
  angelFunding: { type: Number, default: 0 },
  debtFinancing: { type: Number, default: 0 },
  convertibleNote: { type: Number, default: 0 },
  equityCrowdfunding: { type: Number, default: 0 },
  privateEquity: { type: Number, default: 0 },
  postIpoEquity: { type: Number, default: 0 },
  prediction: {
    result: { type: String, enum: ['Safe', 'Not Safe', 'Unknown'] },
    probability: { type: Number }
  }
}, { timestamps: true });

const BusinessProfileForm = mongoose.models.BusinessProfileForm || mongoose.model('BusinessProfileForm', BusinessProfileFormSchema);

module.exports = BusinessProfileForm;