const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  getMe,
  updateUser,
  partialUpdateUser,
  adminLogin,
  getAllUsers,
  getUserCount,
  blockUser,
  unblockUser,
  getRecentRegistrations,
  createAdmin, 
  getUserGrowth
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');

// user stats and listings
router.get('/user-count', authMiddleware, getUserCount);
router.get('/all-users', authMiddleware, getAllUsers);

// block/unblock user routes
router.patch('/block-user/:id', authMiddleware, blockUser);
router.patch('/unblock-user/:id', authMiddleware, unblockUser);

// standard auth
router.post('/admin-login', adminLogin);
router.post('/signup', signup);
router.post('/login', login);

// ✅ only an existing admin can create a new admin
router.post('/create-admin', authMiddleware, createAdmin);

router.get('/users', authMiddleware, getMe);
router.put('/users', authMiddleware, updateUser);
router.patch('/users', authMiddleware, partialUpdateUser);
router.get('/recent-registrations', authMiddleware, getRecentRegistrations);
router.get('/user-growth', authMiddleware, getUserGrowth);

module.exports = router;
