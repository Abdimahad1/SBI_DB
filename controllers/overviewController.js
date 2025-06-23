const Overview = require('../models/Overview');
const Product = require('../models/Product');

// CREATE or UPDATE Overview
exports.generateOverview = async (req, res) => {
  try {
    console.log('➡️ Generating overview for user:', req.userId);

    const products = await Product.find({ user_id: req.userId });

    let expenses = 0;
    let income = 0;
    let products_sold = 0;

    products.forEach((prod) => {
      expenses += (prod.original_price || 0) * (prod.sold || 0);
      income += (prod.price || 0) * (prod.sold || 0);
      products_sold += prod.sold || 0;
    });

    const updatedOverview = await Overview.findOneAndUpdate(
      { user_id: req.userId },
      {
        $set: {
          expenses,
          income,
          products_sold,
          locations: 0,          // Optional — you can remove if you want
          score_level: 'Beginner' // Optional — you can remove if you want
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ Overview upserted:', updatedOverview);
    res.json(updatedOverview);
  } catch (err) {
    console.error('❌ Error in generateOverview:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET Overview
exports.getOverview = async (req, res) => {
  try {
    console.log('➡️ Fetching overview for user:', req.userId);

    const overview = await Overview.findOne({ user_id: req.userId });
    if (!overview) {
      console.warn('⚠️ Overview not found for user:', req.userId);
      return res.status(404).json({ message: 'Overview not found.' });
    }

    console.log('✅ Overview found:', overview);
    res.json(overview);
  } catch (err) {
    console.error('❌ Error in getOverview:', err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE Locations or Score
exports.updateOverview = async (req, res) => {
  try {
    console.log('➡️ Updating locations/score for user:', req.userId);

    const { locations, score_level } = req.body;

    const updated = await Overview.findOneAndUpdate(
      { user_id: req.userId },
      { $set: { locations, score_level } },
      { new: true }
    );

    if (!updated) {
      console.warn('⚠️ Overview not found for update:', req.userId);
      return res.status(404).json({ message: 'Overview not found.' });
    }

    console.log('✅ Overview updated:', updated);
    res.json(updated);
  } catch (err) {
    console.error('❌ Error in updateOverview:', err);
    res.status(500).json({ message: err.message });
  }
};
