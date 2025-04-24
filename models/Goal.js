const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  dueDate: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, enum: ['Clothes', 'Accessories', 'Electronics', 'Shoes'], required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);
