const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  creator_id: {  // Add this field to track who created the content
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  sender_name: { 
    type: String 
  },
  sender_logo: { 
    type: String 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  related_entity: {  // Add this to track what entity this notification is about
    type: String,
    enum: ['goal', 'product', 'financial', 'other'],
    default: 'other'
  },
  related_entity_id: {  // Add this to reference the specific entity
    type: mongoose.Schema.Types.ObjectId
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Notification', NotificationSchema);