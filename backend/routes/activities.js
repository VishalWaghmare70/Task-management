const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getActivities); // Protect to only authenticated users

module.exports = router;
