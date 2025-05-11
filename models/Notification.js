const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  sender_name: { type: String }, // ✅ NEW
  sender_logo: { type: String }, // ✅ NEW
  read: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model('Notification', NotificationSchema);
