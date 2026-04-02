const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // 'info', 'success', 'warning'
  read: { type: Boolean, default: false },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
