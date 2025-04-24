const Product = require('../models/Product');

// CREATE Product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      user_id: req.userId
    });
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
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
