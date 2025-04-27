const Overview = require('../models/Overview');
const Product = require('../models/Product');

// CREATE or UPDATE Overview
exports.generateOverview = async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.userId });

    let expenses = 0;
    let income = 0;
    let products_sold = 0;

    products.forEach((prod) => {
      expenses += (prod.original_price || 0) * (prod.sold || 0);
      income += (prod.price || 0) * (prod.sold || 0);
      products_sold += prod.sold || 0;
    });

    const existing = await Overview.findOne({ user_id: req.userId });

    if (existing) {
      existing.expenses = expenses;
      existing.income = income;
      existing.products_sold = products_sold;
      await existing.save();
      res.json(existing);
    } else {
      const overview = await Overview.create({
        user_id: req.userId,
        expenses,
        income,
        products_sold,
        locations: 0,
        score_level: 'Beginner'
      });
      res.status(201).json(overview);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET Overview
exports.getOverview = async (req, res) => {
  try {
    const overview = await Overview.findOne({ user_id: req.userId });
    if (!overview) {
      return res.status(404).json({ message: 'Overview not found.' });
    }
    res.json(overview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE Locations or Score
exports.updateOverview = async (req, res) => {
  try {
    const { locations, score_level } = req.body;
    const updated = await Overview.findOneAndUpdate(
      { user_id: req.userId },
      { $set: { locations, score_level } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Overview not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
