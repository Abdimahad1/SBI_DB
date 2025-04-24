const mongoose = require('mongoose');

const NotificationSettingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email_alerts: { type: Boolean, default: true },
  in_app: { type: Boolean, default: true },
  sound: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('NotificationSetting', NotificationSettingSchema);
