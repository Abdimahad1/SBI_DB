const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  updateUser,
  partialUpdateUser
} = require('../controllers/authController'); // ✅ Import them all

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/users', authMiddleware, getMe);
router.put('/users', authMiddleware, updateUser);
router.patch('/users', authMiddleware, partialUpdateUser);

module.exports = router;
