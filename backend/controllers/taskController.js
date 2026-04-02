const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// GET /api/tasks - all tasks (all logged-in users)
const getTasks = async (req, res) => {
  try {
    const { status, user, priority, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (user) query.assigned_users = user; // Match if user is in assigned_users array
    if (search) {
      query.title = { $regex: search, $options: 'i' }; // Case-insensitive search on title
    }

    const tasks = await Task.find(query)
      .populate('assigned_users', 'name email role')
      .populate('created_by', 'name email')
      .populate('completed_by', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/tasks - create task (Manager only)
const createTask = async (req, res) => {
  try {
    const { title, description, assigned_users, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    // Validate priority
    const validPriorities = ['Low', 'Medium', 'High'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Priority must be Low, Medium, or High' });
    }

    // Validate dueDate
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ message: 'Invalid due date' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      assigned_users: assigned_users || [],
      created_by: req.user.id,
    });
    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
    ]);

    await ActivityLog.create({
      user: req.user.id,
      action: 'created',
      task: task._id,
      taskTitle: task.title
    });

    // Notify assigned users
    if (assigned_users && assigned_users.length > 0) {
      const notifs = assigned_users.map(userId => {
        const dateStr = dueDate ? ` (Due: ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : '';
        return {
          user: userId,
          message: `You have been assigned a new task: "${task.title}"${dateStr}`,
          type: 'info',
          task: task._id
        };
      });
      await Notification.insertMany(notifs);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/tasks/:id/status - update task status (any logged-in user)
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    task.status = status;
    
    // Manage completion time and user
    if (status === 'Completed') {
      task.completed_by = req.user.id;
      task.completion_time = new Date();
    } else {
      task.completed_by = null;
      task.completion_time = null;
    }
    
    await task.save();

    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
      { path: 'completed_by', select: 'name email' },
    ]);

    await ActivityLog.create({
      user: req.user.id,
      action: status === 'Completed' ? 'completed' : 'updated',
      task: task._id,
      taskTitle: task.title
    });

    // Notify CEO and Manager when task is completed
    if (status === 'Completed') {
      const managers = await User.find({ role: { $in: ['Manager', 'CEO', 'Founder'] } });
      if (managers.length > 0) {
        // Exclude the user who actually completed it if they are a manager themselves
        const toNotify = managers.filter(m => m._id.toString() !== req.user.id);
        if (toNotify.length > 0) {
           const notifs = toNotify.map(m => ({
             user: m._id,
             message: `Task "${task.title}" was completed by ${req.user.name || 'a team member'}`,
             type: 'success',
             task: task._id
           }));
           await Notification.insertMany(notifs);
        }
      }
    }

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/tasks/:id - delete task (Manager only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Clean up local files before deleting the task
    if (task.attachments && task.attachments.length > 0) {
      task.attachments.forEach(att => {
        const filePath = path.join(__dirname, '..', 'uploads', att.public_id);
        fs.unlink(filePath, () => {}); // Ignore errors if file already gone
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user.id,
      action: 'deleted',
      taskTitle: task.title
    });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/tasks/:id/upload - upload attachments to a task
const uploadAttachments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Build the base URL for serving files
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;

    const newAttachments = req.files.map(file => ({
      url: `${baseUrl}/${file.filename}`,
      public_id: file.filename,
      original_name: file.originalname,
    }));

    task.attachments.push(...newAttachments);
    await task.save();

    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
      { path: 'completed_by', select: 'name email' },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// DELETE /api/tasks/:taskId/attachment/:attachmentId - remove an attachment
const deleteAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const attachment = task.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    // Delete local file
    const filePath = path.join(__dirname, '..', 'uploads', attachment.public_id);
    fs.unlink(filePath, () => {}); // Ignore errors if file already gone

    // Remove from DB
    task.attachments.pull(attachmentId);
    await task.save();

    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
      { path: 'completed_by', select: 'name email' },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Delete attachment failed', error: err.message });
  }
};

// POST /api/tasks/:id/link - add a link to a task
const addLink = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { url, title } = req.body;
    if (!url) return res.status(400).json({ message: 'Link URL is required' });

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    task.links.push({ url, title: title || '' });
    await task.save();

    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
      { path: 'completed_by', select: 'name email' },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add link', error: err.message });
  }
};

// DELETE /api/tasks/:taskId/link/:linkId - remove a link
const deleteLink = async (req, res) => {
  try {
    const { taskId, linkId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const link = task.links.id(linkId);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    task.links.pull(linkId);
    await task.save();

    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
      { path: 'completed_by', select: 'name email' },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete link', error: err.message });
  }
};

// PUT /api/tasks/:id - update task (creator or manager only)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Authorization: only creator or manager can edit
    const isCreator = task.created_by.toString() === req.user.id;
    const isUserManager = ['Manager', 'CEO', 'Founder'].includes(req.user.role);
    if (!isCreator && !isUserManager) {
      return res.status(403).json({ message: 'Not authorized to edit this task' });
    }

    // Don't allow editing completed tasks
    if (task.status === 'Completed') {
      console.log("UPDATE TASK FAILED: Status is completed");
      return res.status(400).json({ message: 'Cannot edit a completed task' });
    }

    const { title, description, assigned_users, priority, dueDate } = req.body;

    // Validate title if provided
    if (title !== undefined && !title.trim()) {
      console.log("UPDATE TASK FAILED: Title is empty");
      return res.status(400).json({ message: 'Task title cannot be empty' });
    }

    // Validate priority if provided
    const validPriorities = ['Low', 'Medium', 'High'];
    if (priority && !validPriorities.includes(priority)) {
      console.log("UPDATE TASK FAILED: Invalid priority", priority);
      return res.status(400).json({ message: 'Priority must be Low, Medium, or High' });
    }

    // Validate dueDate if provided
    if (dueDate && dueDate !== null && isNaN(new Date(dueDate).getTime())) {
      console.log("UPDATE TASK FAILED: Invalid dueDate", dueDate);
      return res.status(400).json({ message: 'Invalid due date' });
    }

    // Update only provided fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (assigned_users !== undefined) task.assigned_users = assigned_users;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
      { path: 'completed_by', select: 'name email' },
    ]);

    await ActivityLog.create({
      user: req.user.id,
      action: 'updated',
      task: task._id,
      taskTitle: task.title
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

// GET /api/tasks/stats - get dashboard statistics
const getTaskStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find()
      .populate('assigned_users', 'name')
      .populate('completed_by', 'name');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const overdueTasks = tasks.filter(t =>
      (t.status === 'Pending' || t.status === 'In Progress') && t.dueDate && new Date(t.dueDate) < today
    ).length;

    // Priority breakdown
    const priorityBreakdown = [
      { name: 'High', value: tasks.filter(t => t.priority === 'High').length, color: '#f87171' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, color: '#fbbf24' },
      { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length, color: '#2dd4bf' },
    ];

    // Status breakdown for pie chart
    const statusBreakdown = [
      { name: 'Completed', value: completedTasks, color: '#10b981' },
      { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
      { name: 'Pending', value: pendingTasks, color: '#fbbf24' },
      { name: 'Overdue', value: overdueTasks, color: '#ef4444' },
    ].filter(s => s.value > 0);

    // Completion trend — last 7 days
    const completionTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const created = tasks.filter(t => {
        const c = new Date(t.createdAt);
        return c >= d && c < nextD;
      }).length;

      const completed = tasks.filter(t => {
        if (!t.completion_time) return false;
        const c = new Date(t.completion_time);
        return c >= d && c < nextD;
      }).length;

      completionTrend.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created,
        completed,
      });
    }

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      priorityBreakdown,
      statusBreakdown,
      completionTrend,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get stats', error: err.message });
  }
};

module.exports = { getTasks, getTaskStats, createTask, updateTask, updateTaskStatus, deleteTask, uploadAttachments, deleteAttachment, addLink, deleteLink };
