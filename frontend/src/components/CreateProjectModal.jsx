import { useState, useEffect } from 'react';
import { createProject, updateProject } from '../services/api';
import './CreateProjectModal.css';
import { LayoutDashboard, X, Calendar, AlertCircle } from 'lucide-react';

export default function CreateProjectModal({ isOpen, onClose, onSuccess, editProject = null }) {
  const [formData, setFormData] = useState({ name: '', description: '', deadline: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name || '',
        description: editProject.description || '',
        deadline: editProject.deadline ? new Date(editProject.deadline).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({ name: '', description: '', deadline: '' });
    }
  }, [editProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return setError('Project name is required');
    
    setLoading(true);
    try {
      if (editProject) {
        await updateProject(editProject._id, formData);
      } else {
        await createProject(formData);
      }
      onSuccess();
      onClose();
      if (!editProject) setFormData({ name: '', description: '', deadline: '' });
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editProject ? 'update' : 'create'} project`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-project-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <div className="header-icon">
            <LayoutDashboard size={24} />
          </div>
          <div className="header-text">
            <h2>{editProject ? 'Edit Project' : 'New Project'}</h2>
            <p>{editProject ? 'Update your project details.' : 'Create a dedicated space for your team\'s tasks.'}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </header>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Project Name</label>
            <input 
              type="text" 
              placeholder="e.g. Website Redesign"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="What is this project about?"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Deadline (Optional)</label>
            <div className="input-with-icon">
              <Calendar size={18} className="input-icon" />
              <input 
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (editProject ? 'Updating...' : 'Creating...') : (editProject ? 'Save Changes' : 'Create Project')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
