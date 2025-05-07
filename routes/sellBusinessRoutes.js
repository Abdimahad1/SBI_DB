const express = require('express');
const router = express.Router();

const {
  createBusiness,
  getBusinesses,
  getAllBusinesses,
  updateBusiness,
  deleteBusiness
} = require('../controllers/sellBusinessController');

const authMiddleware = require('../middlewares/authMiddleware');

// ✅ PUBLIC route — Investors can access all listings (no auth required)
router.get('/public', getAllBusinesses);

// 🔐 AUTHENTICATED routes — For business owners only
router.post('/', authMiddleware, createBusiness);
router.get('/', authMiddleware, getBusinesses);
router.patch('/:id', authMiddleware, updateBusiness);
router.delete('/:id', authMiddleware, deleteBusiness);

module.exports = router;
