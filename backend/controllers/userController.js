const User = require('../models/User');

// GET /api/users - list all users (for Manager to assign tasks)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getUsers };
