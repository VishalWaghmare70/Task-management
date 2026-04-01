const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  assigned_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  completion_time: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
