import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProjectDetails, fetchUsers, createTask, updateTaskStatus } from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import KanbanBoard from '../components/KanbanBoard';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LayoutDashboard, Plus, ArrowLeft, Calendar, User, CheckCircle2, ListTodo } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const isManager = ['Manager', 'CEO', 'Founder'].includes(user?.role);

  useEffect(() => {
    loadProjectData();
    loadUsers();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const res = await fetchProjectDetails(id);
      setProject(res.data.project);
      setTasks(res.data.tasks);
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleCreateTask = async (data) => {
    try {
      const { files, links, ...taskData } = data;
      const res = await createTask({ ...taskData, project: id });
      const taskId = res.data._id;

      if (files?.length) await uploadAttachments(taskId, files);
      if (links?.length) {
        for (const link of links) {
          if (link.url.trim()) await addLink(taskId, link);
        }
      }

      addNotification(`New task assigned in project "${project.name}"`, 'info');
      toast.success('Task created successfully');
      loadProjectData();
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success(`Task marked as ${status}`);
      loadProjectData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const { deleteTask: apiDeleteTask } = await import('../services/api');
      await apiDeleteTask(taskId);
      toast.success('Task deleted');
      loadProjectData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    try {
      const { updateTask: apiUpdateTask } = await import('../services/api');
      await apiUpdateTask(taskId, data);
      toast.success('Task updated');
      loadProjectData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="loading-container">Loading mission details...</div>;
  if (!project) return null;

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progress = tasks.length > 0 ? Math.round((completedCount/tasks.length)*100) : 0;

  return (
    <div className="project-details animate-fade-in">
      <header className="project-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="project-title-area">
          <div className="title-row">
            <h1 className="project-detail-name">{project.name}</h1>
            <span className={`status-badge ${project.status.toLowerCase()}`}>{project.status}</span>
          </div>
          <p className="project-detail-desc">{project.description || 'No description provided.'}</p>
        </div>

        <div className="project-meta-grid">
          <div className="meta-card shadow-glass">
            <Calendar size={18} />
            <div className="meta-content">
              <label>Deadline</label>
              <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          <div className="meta-card shadow-glass">
            <User size={18} />
            <div className="meta-content">
              <label>Manager</label>
              <span>{project.created_by?.name || 'Unknown'}</span>
            </div>
          </div>
          <div className="meta-card shadow-glass">
            <CheckCircle2 size={18} />
            <div className="meta-content">
              <label>Progress</label>
              <div className="mini-progress">
                <div className="mini-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span>{progress}%</span>
            </div>
          </div>
          <div className="meta-card shadow-glass">
            <ListTodo size={18} />
            <div className="meta-content">
              <label>Total Tasks</label>
              <span>{tasks.length}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="project-tasks-section">
        <div className="section-header-row">
          <h2 className="section-title">Project Tasks</h2>
          {isManager && (
            <button className="btn-primary assign-btn" onClick={() => setModalOpen(true)}>
              <Plus size={18} />
              Assign Task
            </button>
          )}
        </div>

        <div className="board-wrapper shadow-premium">
          <KanbanBoard 
            tasks={tasks}
            activeFilter={activeFilter}
            onDragEnd={(e) => {
              if (e.over && e.active.id !== e.over.id) {
                const task = tasks.find(t => t._id === e.active.id);
                if (task && task.status !== e.over.id) {
                  handleStatusChange(e.active.id, e.over.id);
                }
              }
            }}
            taskProps={{
              isManager,
              onComplete: (id) => handleStatusChange(id, 'Completed'),
              onProgress: (id) => handleStatusChange(id, 'In Progress'),
              onDelete: handleDeleteTask,
              onEdit: (task) => { /* handle edit later or open edit modal? for now keep simple */ },
              onUpload: (taskId, files) => { /* handle upload */ },
              onAddLink: (taskId, data) => { /* handle link */ }
            }}
          />
        </div>
      </section>

      {modalOpen && (
        <CreateTaskModal 
          onClose={() => setModalOpen(false)} 
          onSubmit={handleCreateTask} 
          users={users} 
        />
      )}
    </div>
  );
}
