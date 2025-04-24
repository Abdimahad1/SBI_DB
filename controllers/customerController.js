const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const customer = await Customer.create({
      name,
      phone,
      email,
      business_owner_id: req.userId
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ business_owner_id: req.userId });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
