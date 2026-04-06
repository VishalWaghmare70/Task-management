const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date, default: null },
  assigned_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  completion_time: { type: Date, default: null },
  attachments: [{
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    original_name: { type: String, required: true },
  }],
  links: [{
    url: { type: String, required: true },
    title: { type: String, default: '' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
