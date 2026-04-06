import { useState, useEffect } from 'react';
import { fetchProjects, deleteProject } from '../services/api';
import CreateProjectModal from '../components/CreateProjectModal';
import { LayoutDashboard, Plus, Calendar, CheckCircle2, Circle, Clock, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProjectDashboard.css';

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = ['MANAGER', 'CEO', 'FOUNDER', 'ADMIN'].includes(user?.role?.toUpperCase());

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetchProjects();
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be removed.')) return;
    
    try {
      await deleteProject(projectId);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const dashboardSteps = [
    { title: 'Create Project', desc: 'Initialize a project container for your team.' },
    { title: 'Assign Tasks', desc: 'Break down work and delegate tasks easily.' },
    { title: 'Track Progress', desc: 'Monitor completion and hit your deadlines.' },
  ];

  return (
    <div className="project-dashboard animate-fade-in-up">
      {/* Intro Section */}
      <section className="intro-section">
        <div className="intro-content">
          <h1 className="intro-title">Project Central</h1>
          <p className="intro-subtitle">Manage your team effectively with project-based task tracking.</p>
        </div>
        
        <div className="how-it-works shadow-premium">
          <h2 className="section-header">How this platform works</h2>
          <div className="steps-container">
            {dashboardSteps.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{i + 1}</div>
                <div className="step-text">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="section-top">
          <h2 className="section-header">Projects</h2>
          {isManager && (
            <button 
              className="btn-primary create-project-btn" 
              onClick={() => {
                setSelectedProject(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={20} />
              Create Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-state">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state shadow-premium">
            <LayoutDashboard size={48} className="empty-icon" />
            <p>No projects yet. Start by creating one!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => {
              const completedTasks = project.tasks?.filter(t => t.status === 'Completed').length || 0;
              const totalTasks = project.tasks?.length || 0;
              const progress = totalTasks > 0 ? Math.round((completedTasks/totalTasks) * 100) : 0;

              return (
                <div 
                  key={project._id} 
                  className="project-card shadow-hover"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <div className="project-card-header">
                    <div className="title-group">
                      <h3 className="project-name">{project.name}</h3>
                      <span className={`status-badge ${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </div>
                    {isManager && (
                      <div className="project-actions">
                        <button className="action-btn edit-btn" onClick={(e) => handleEdit(e, project)}>
                          <Edit3 size={16} />
                        </button>
                        <button className="action-btn delete-btn" onClick={(e) => handleDelete(e, project._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="project-desc">{project.description || 'No description provided.'}</p>
                  
                  <div className="project-stats">
                    <div className="stat-item" title="Tasks">
                      <CheckCircle2 size={16} />
                      <span>{totalTasks} Tasks</span>
                    </div>
                    {project.deadline && (
                      <div className="stat-item" title="Deadline">
                        <Calendar size={16} />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="progress-section">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-text">{progress}% complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }} 
        onSuccess={loadProjects}
        editProject={selectedProject}
      />
    </div>
  );
}
