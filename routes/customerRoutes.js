const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { createCustomer, getCustomers } = require('../controllers/customerController');

router.post('/', auth, createCustomer);
router.get('/', auth, getCustomers);

module.exports = router;
