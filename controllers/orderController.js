const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { customer_id, product_name, quantity, total_price, order_date } = req.body;
    const order = await Order.create({
      customer_id,
      product_name,
      quantity,
      total_price,
      order_date
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.find({ customer_id: req.params.customerId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
