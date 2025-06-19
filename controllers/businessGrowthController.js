const BusinessGrowth = require('../models/BusinessGrowth');
const Product = require('../models/Product');

// Save monthly growth
exports.saveMonthlyGrowth = async (req, res) => {
  try {
    const { year, month } = req.body;
    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const products = await Product.find({ user_id: req.userId });

    let expenses = 0;
    let income = 0;
    let products_sold = 0;

    products.forEach((prod) => {
      expenses += (prod.original_price || 0) * (prod.sold || 0);
      income += (prod.price || 0) * (prod.sold || 0);
      products_sold += prod.sold || 0;
    });

    const update = {
      income,
      expenses,
      products_sold
    };

    const saved = await BusinessGrowth.findOneAndUpdate(
      { user_id: req.userId, year, month },
      { $set: update },
      { upsert: true, new: true }
    );

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get full growth for this user
exports.getGrowthHistory = async (req, res) => {
  try {
    const growth = await BusinessGrowth.find({ user_id: req.userId }).sort({ year: 1, month: 1 });
    res.json(growth);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// (Optional) Get growth public for ML or for admin
exports.getGrowthPublic = async (req, res) => {
  try {
    const growth = await BusinessGrowth.find({}).sort({ user_id: 1, year: 1, month: 1 });
    res.json(growth);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
