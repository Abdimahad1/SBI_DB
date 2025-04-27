const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification
} = require('../controllers/NotificationsController');

// Notifications Routes
router.post('/', auth, createNotification);       // Create notification
router.get('/', auth, getUserNotifications);       // Get all notifications
router.patch('/:id', auth, markAsRead);            // Mark one as read
router.delete('/:id', auth, deleteNotification);   // Delete notification

module.exports = router;
