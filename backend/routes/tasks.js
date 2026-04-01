const express = require('express');
const router = express.Router();
const { getTasks, createTask, completeTask, deleteTask } = require('../controllers/taskController');
const { protect, managerOnly } = require('../middleware/auth');

router.get('/', protect, getTasks);
router.post('/', protect, managerOnly, createTask);
router.patch('/:id/complete', protect, completeTask);
router.delete('/:id', protect, managerOnly, deleteTask);

module.exports = router;
