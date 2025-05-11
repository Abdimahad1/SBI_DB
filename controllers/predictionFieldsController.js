const PredictionFieldsModel = require('../models/predictionFieldsModel');
const BusinessProfile = require('../models/BusinessProfile');
const Overview = require('../models/Overview');

// Create or update prediction fields for a user
exports.syncPredictionFields = async (req, res) => {
  const { userId } = req.params;

  try {
    const business = await BusinessProfile.findOne({ user_id: userId });
    const overview = await Overview.findOne({ user_id: userId });

    if (!business || !overview) {
      return res.status(200).json({
        message: 'User profile is incomplete. Cannot sync prediction fields.',
        missing: {
          business: !!business,
          overview: !!overview
        },
        data: null
      });
    }

    const predictionData = {
      userId,
      founded_year: business.founded_year,
      country_code: business.country,
      city: business.city,
      status: business.status,
      income: overview.income,
      expenses: overview.expenses,
      risk_score: parseFloat(overview.score_level) || 0,
      category_list: business.industry || 'General'
    };

    const existing = await PredictionFieldsModel.findOne({ userId });
    if (existing) {
      await PredictionFieldsModel.updateOne({ userId }, predictionData);
    } else {
      await PredictionFieldsModel.create(predictionData);
    }

    res.status(200).json({ message: 'Prediction fields synced successfully', data: predictionData });
  } catch (err) {
    console.error('Error syncing prediction fields:', err);
    res.status(500).json({ error: 'Server error while syncing prediction fields' });
  }
};

// Get prediction fields for a user (auto-sync if not found)
exports.getPredictionFields = async (req, res) => {
  const { userId } = req.params;

  try {
    let data = await PredictionFieldsModel.findOne({ userId });

    if (!data) {
      const business = await BusinessProfile.findOne({ user_id: userId });
      const overview = await Overview.findOne({ user_id: userId });

      if (!business || !overview) {
        return res.status(200).json({
          message: 'User profile is incomplete. Prediction fields not available.',
          missing: {
            business: !!business,
            overview: !!overview
          },
          data: null
        });
      }

      const predictionData = {
        userId,
        founded_year: business.founded_year,
        country_code: business.country,
        city: business.city,
        status: business.status,
        income: overview.income,
        expenses: overview.expenses,
        risk_score: parseFloat(overview.score_level) || 0,
        category_list: business.industry || 'General'
      };

      data = await PredictionFieldsModel.create(predictionData);
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error getting prediction fields:', err);
    res.status(500).json({ error: 'Server error while retrieving prediction fields' });
  }
};
