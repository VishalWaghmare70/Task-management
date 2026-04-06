const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// GET /api/projects - list all projects
const getProjects = async (req, res) => {
  try {
    const isManager = ['Manager', 'CEO', 'Founder'].includes(req.user.role);
    let query = {};
    
    // If team member, only show projects they have tasks in? 
    // Requirement says "Team Members: Can only see tasks assigned to them, Cannot create projects"
    // For now, let's allow managers to see all, and team members to see only projects they are involved in.
    if (!isManager) {
      const userTasks = await Task.find({ assigned_users: req.user.id }).select('project');
      const projectIds = [...new Set(userTasks.map(t => t.project).filter(p => p))];
      query._id = { $in: projectIds };
    }

    const projects = await Project.find(query)
      .populate('created_by', 'name email')
      .populate({
        path: 'tasks',
        select: 'status'
      })
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/projects - create project (Manager only)
const createProject = async (req, res) => {
  try {
    const { name, description, deadline } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description: description || '',
      deadline: deadline || null,
      created_by: req.user.id,
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'created project',
      taskTitle: project.name
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/projects/:id - single project details with tasks
const getProjectDetails = async (req, res) => {
  try {
    console.log(`🔍 Fetching details for project ID: ${req.params.id}`);
    const project = await Project.findById(req.params.id)
      .populate('created_by', 'name email');
    
    if (!project) {
      console.log('❌ Project not found in database');
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log(`✅ Found project: ${project.name}`);
    const tasks = await Task.find({ project: project._id })
      .populate('assigned_users', 'name email role')
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });

    res.json({ project, tasks });
  } catch (err) {
    console.log(`💥 Error finding project: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/projects/:id - update project (Manager only)
const updateProject = async (req, res) => {
  try {
    const { name, description, deadline, status } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (deadline !== undefined) project.deadline = deadline;
    if (status) project.status = status;

    await project.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'updated',
      taskTitle: project.name
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/projects/:id - delete project (Manager only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user.id,
      action: 'deleted',
      taskTitle: project.name
    });

    res.json({ message: 'Project and its tasks deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getProjects, createProject, getProjectDetails, updateProject, deleteProject };
