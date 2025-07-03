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
  getUserCount
} = require('../controllers/authController'); // ✅ Import them all

const authMiddleware = require('../middlewares/authMiddleware');
router.get('/user-count', authMiddleware, getUserCount);
router.get('/all-users', authMiddleware, getAllUsers);
router.post('/admin-login', adminLogin);
router.post('/signup', signup);
router.post('/login', login);
router.get('/users', authMiddleware, getMe);
router.put('/users', authMiddleware, updateUser);
router.patch('/users', authMiddleware, partialUpdateUser);

module.exports = router;
