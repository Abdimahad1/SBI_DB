const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  broadcastNotification
} = require('../controllers/NotificationsController');

// Notifications Routes
router.post('/broadcast', auth, broadcastNotification);   // Broadcast should come first
router.post('/', auth, createNotification);               // Create notification
router.get('/', auth, getUserNotifications);              // Get all notifications
router.patch('/:id', auth, markAsRead);                   // Mark one as read
router.delete('/:id', auth, deleteNotification);          // Delete notification

module.exports = router;
