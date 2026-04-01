import { useState, useEffect } from 'react';
import { fetchUsers } from '../services/api';
import './CreateTaskModal.css';

export default function CreateTaskModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers().then(res => setUsers(res.data)).catch(() => {});
    }
  }, [isOpen]);

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Task title is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit({ title, description, assigned_users: selectedUsers });
      setTitle(''); setDescription(''); setSelectedUsers([]);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="create-task-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="headline-sm">Create New Task</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label className="label-md" htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label-md" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task..."
              className="form-input form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="label-md">Assign Team Members</label>
            <div className="user-selector">
              {users.filter(u => u.role === 'Team Member').map(u => (
                <button
                  key={u._id}
                  type="button"
                  className={`user-option ${selectedUsers.includes(u._id) ? 'user-option--selected' : ''}`}
                  onClick={() => toggleUser(u._id)}
                >
                  <span className="user-option-avatar">
                    {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                  <span>{u.name}</span>
                  {selectedUsers.includes(u._id) && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 12l2 2 4-4"/></svg>
                  )}
                </button>
              ))}
              {users.filter(u => u.role === 'Team Member').length === 0 && (
                <p className="body-md" style={{ padding: 'var(--space-3)' }}>No team members found.</p>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} id="submit-task-btn">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
