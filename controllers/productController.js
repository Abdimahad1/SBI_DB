const Product = require('../models/Product');
const Overview = require('../models/Overview');

// Helper Function: Recalculate Overview
const recalculateOverview = async (userId) => {
  const products = await Product.find({ user_id: userId });

  let expenses = 0;
  let income = 0;
  let products_sold = 0;

  products.forEach((prod) => {
    expenses += (prod.original_price || 0) * (prod.sold || 0);
    income += (prod.price || 0) * (prod.sold || 0);
    products_sold += prod.sold || 0;
  });

  const existing = await Overview.findOne({ user_id: userId });

  if (existing) {
    existing.expenses = expenses;
    existing.income = income;
    existing.products_sold = products_sold;
    await existing.save();
  } else {
    await Overview.create({
      user_id: userId,
      expenses,
      income,
      products_sold,
      locations: 0, // default 0
      score_level: 'Beginner' // default
    });
  }
};

// CREATE Product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      user_id: req.userId
    });

    await recalculateOverview(req.userId); // ✅ Recalculate overview after create

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET All Products by User
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.userId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE Product
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });

    await recalculateOverview(req.userId); // ✅ Recalculate overview after update

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE Product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    await recalculateOverview(req.userId); // ✅ Recalculate overview after delete

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
