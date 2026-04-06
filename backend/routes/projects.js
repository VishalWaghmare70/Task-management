const express = require('express');
console.log('✅ Project Routes Loaded');
const router = express.Router();
const { createProject, getProjects, getProjectDetails, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, managerOnly } = require('../middleware/auth');

router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectDetails);
router.post('/', protect, managerOnly, createProject);
router.put('/:id', protect, managerOnly, updateProject);
router.delete('/:id', protect, managerOnly, deleteProject);

module.exports = router;
