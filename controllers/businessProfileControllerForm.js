const mongoose = require('mongoose');
const BusinessProfileForm = require('../models/BusinessProfileForm');
const axios = require('axios');

const ML_API_URL = 'http://localhost:3000/predict';

// CREATE or UPDATE business profile
exports.saveBusinessProfileForm = async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;

    const mlInput = {
      name: profileData.businessName,
      market: profileData.marketCategory,
      founded_year: profileData.foundedYear,
      funding_total_usd: profileData.fundingTotalUSD,
      funding_rounds: profileData.fundingRounds,
      seed: profileData.seedFunding,
      venture: profileData.ventureFunding,
      angel: profileData.angelFunding,
      debt_financing: profileData.debtFinancing,
      convertible_note: profileData.convertibleNote,
      equity_crowdfunding: profileData.equityCrowdfunding,
      private_equity: profileData.privateEquity,
      post_ipo_equity: profileData.postIpoEquity,
      country_code: profileData.countryCode,
      city: profileData.city,
      first_funding_year: profileData.foundedYear
    };

    let predictionResult;
    try {
      const mlResponse = await axios.post(ML_API_URL, mlInput);
      predictionResult = {
        result: mlResponse.data.prediction,
        probability: mlResponse.data.probability
      };
    } catch (mlError) {
      console.error('ML API Error:', mlError.response?.data || mlError.message);
      predictionResult = { result: 'Unknown', probability: null };
    }

    const existingProfile = await BusinessProfileForm.findOne({ user_id: userId });

    if (existingProfile) {
      const updatedProfile = await BusinessProfileForm.findOneAndUpdate(
        { user_id: userId },
        { ...profileData, prediction: predictionResult },
        { new: true }
      );
      return res.json(updatedProfile);
    } else {
      const newProfile = await BusinessProfileForm.create({
        user_id: userId,
        ...profileData,
        prediction: predictionResult
      });
      return res.status(201).json(newProfile);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET profile of current user
exports.getBusinessProfileForm = async (req, res) => {
  try {
    const profile = await BusinessProfileForm.findOne({ user_id: req.userId });
    if (!profile) return res.status(404).json({ message: 'Business profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET profile of a specific user by ID (used by investors)
exports.getBusinessProfileByUserId = async (req, res) => {
  try {
    const profile = await BusinessProfileForm.findOne({ user_id: req.params.id });
    if (!profile) return res.status(404).json({ message: 'Business profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE current user's profile
exports.deleteBusinessProfileForm = async (req, res) => {
  try {
    const deleted = await BusinessProfileForm.findOneAndDelete({ user_id: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Business profile not found' });
    res.json({ message: 'Business profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET prediction fields for a specific user
exports.getPredictionFields = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid ObjectId:', userId);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const profile = await BusinessProfileForm.findOne({
      user_id: new mongoose.Types.ObjectId(userId)
    });

    if (!profile) {
      console.warn('⚠️ No profile found for user:', userId);
      return res.status(404).json({ message: 'Business profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('🔥 Error fetching prediction fields:', err);
    res.status(500).json({ message: 'Failed to fetch prediction fields', error: err.message });
  }
};


