const Notification = require('../models/Notification');

// ✅ Create a new notification with duplicate check
exports.createNotification = async (req, res) => {
  try {
    const { title, message, sender_name, sender_logo, user_id } = req.body;

    const targetUserId = user_id || req.userId;

    // Prevent duplicate
    const existingNotification = await Notification.findOne({
      user_id: targetUserId,
      title,
      message
    });

    if (existingNotification) {
      return res.status(200).json({ message: 'Notification already exists' });
    }

    const notification = await Notification.create({
      user_id: targetUserId,
      title,
      message,
      sender_name,
      sender_logo
    });

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Get all notifications for user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, user_id: req.userId });
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
