const Task = require('../models/Task');

// GET /api/tasks - all tasks (all logged-in users)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
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
    const { title, description, assigned_users } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const task = await Task.create({
      title,
      description: description || '',
      assigned_users: assigned_users || [],
      created_by: req.user.id,
    });
    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/tasks/:id/complete - mark as complete (any logged-in user)
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status === 'Completed') return res.status(400).json({ message: 'Task already completed' });

    task.status = 'Completed';
    task.completed_by = req.user.id;
    task.completion_time = new Date();
    await task.save();

    const populated = await task.populate([
      { path: 'assigned_users', select: 'name email role' },
      { path: 'created_by', select: 'name email' },
      { path: 'completed_by', select: 'name email' },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/tasks/:id - delete task (Manager only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTasks, createTask, completeTask, deleteTask };
