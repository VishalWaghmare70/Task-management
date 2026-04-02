const Notification = require('../models/Notification');

// GET /api/notifications
// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Transform id so frontend compatible
    const formatted = notifications.map(n => ({
      id: n._id.toString(),
      message: n.message,
      type: n.type,
      timestamp: n.createdAt,
      read: n.read,
      task: n.task
    }));
      
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/notifications/:id/read
// Mark a specific notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/notifications/read-all
// Mark all notifications for the user as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/notifications
// Clear all notifications
const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ message: 'Notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAll
};
