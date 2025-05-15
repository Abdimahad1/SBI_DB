const Notification = require('../models/Notification');
const User = require('../models/User');

// ✅ Create a new notification with duplicate check
exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      sender_name,
      sender_logo,
      user_id,
      investment_id,
      businessId
    } = req.body;

    const targetUserId = user_id || req.userId;

    console.log(`🔔 Creating notification for user: ${targetUserId}`);

    // Prevent exact duplicates
    const existingNotification = await Notification.findOne({
      user_id: targetUserId,
      title,
      message
    });

    if (existingNotification) {
      console.log('⚠️ Duplicate notification exists for this user.');
      return res.status(200).json({ message: 'Notification already exists' });
    }

    const notification = await Notification.create({
      user_id: targetUserId,
      title,
      message,
      sender_name,
      sender_logo,
      investment_id,
      businessId
    });

    console.log('✅ Notification created:', notification._id);
    res.status(201).json(notification);
  } catch (err) {
    console.error('❌ Error in createNotification:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all notifications for the logged-in user with role-based filter
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('🔍 Fetching notifications for user_id:', userId);

    // Fetch the user to get their role
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let query = { user_id: userId };

    // Only show investment-related notifications to investors
    if (user.role === 'Investor') {
      query.title = 'Investment Status Update';
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    console.log(`✅ Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (err) {
    console.error('❌ Error in getUserNotifications:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Mark a single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.log('✅ Marked notification as read:', updated._id);
    res.json(updated);
  } catch (err) {
    console.error('❌ Error in markAsRead:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete a single notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, user_id: req.userId });
    console.log('🗑️ Deleted notification:', req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('❌ Error in deleteNotification:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Broadcast notification to all users (optionally by role)
exports.broadcastNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      sender_name,
      sender_logo,
      investment_id,
      businessId,
      role,
      creatorId
    } = req.body;

    // If creatorId is provided, send only to that user
    if (creatorId) {
      const existing = await Notification.findOne({
        user_id: creatorId,
        title,
        message
      });

      if (!existing) {
        const notification = await Notification.create({
          user_id: creatorId,
          title,
          message,
          sender_name,
          sender_logo,
          investment_id,
          businessId
        });
        console.log('✅ Notification sent to creator:', creatorId);
        return res.status(201).json({
          message: 'Notification sent to creator',
          notification
        });
      }

      return res.status(200).json({ message: 'Notification already exists for creator' });
    }

    // TODO: Add broadcast logic if needed
  } catch (err) {
    console.error('❌ Error in broadcastNotification:', err.message);
    res.status(500).json({ message: err.message });
  }
};
