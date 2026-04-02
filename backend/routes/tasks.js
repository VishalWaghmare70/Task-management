const express = require('express');
const router = express.Router();
const { getTasks, getTaskStats, createTask, updateTask, updateTaskStatus, deleteTask, uploadAttachments, deleteAttachment, addLink, deleteLink } = require('../controllers/taskController');
const { protect, managerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getTasks);
router.get('/stats', protect, getTaskStats); // Must be BEFORE /:id routes
router.post('/', protect, managerOnly, createTask);
router.put('/:id', protect, updateTask);
router.patch('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, managerOnly, deleteTask);

// Attachments — any authenticated user can upload/delete
router.post('/:id/upload', protect, upload.array('files', 5), uploadAttachments);
router.delete('/:taskId/attachment/:attachmentId', protect, deleteAttachment);

// Links — any authenticated user can add/delete
router.post('/:id/link', protect, addLink);
router.delete('/:taskId/link/:linkId', protect, deleteLink);

module.exports = router;
