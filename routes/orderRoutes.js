const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { createOrder, getOrdersByCustomer } = require('../controllers/orderController');

router.post('/', auth, createOrder);
router.get('/:customerId', auth, getOrdersByCustomer);

module.exports = router;
