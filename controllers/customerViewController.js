const Product = require('../models/Product');

// Get products for Customer View
exports.getCustomerProducts = async (req, res) => {
  try {
    const { category, search, limit, business } = req.query;

    const filter = {
      status: 'Active'
    };

    if (business) {
      filter.user_id = business;  // 💥 Correct field is user_id
    }

    if (category && category !== 'All') {
      filter.type = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // case-insensitive search
    }

    const limitNumber = parseInt(limit) || 100;

    const products = await Product.find(filter)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products for customers.' });
  }
};
