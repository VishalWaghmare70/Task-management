const ActivityLog = require('../models/ActivityLog');

// GET /api/activities - get recent activity logs
const getActivities = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 activities for efficiency

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getActivities };
