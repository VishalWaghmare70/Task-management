import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteAccount } from '../services/api';
import './DeleteAccountModal.css';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const res = await deleteAccount({ password });
      setSuccess(res.data.message || 'Account deleted successfully!');
      setTimeout(() => {
        logout(); // Logout and redirect
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="delete-acc-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="delete-acc-header">
          <div className="delete-acc-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="delete-acc-title">Delete Account</h2>
          <p className="delete-acc-subtitle">This action is permanent and cannot be undone.</p>
        </div>

        <div className="delete-acc-warning">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p>You will lose all your assigned tasks and profile data.</p>
        </div>

        <form onSubmit={handleSubmit} className="delete-acc-form">
          {error && (
            <div className="delete-acc-alert delete-acc-alert--error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="delete-acc-alert delete-acc-alert--success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
              {success}
            </div>
          )}

          <div className="form-group">
            <label className="label-md" htmlFor="delete-password">Confirm Password</label>
            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password to confirm"
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="delete-acc-actions">
            <button type="button" className="delete-acc-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="delete-acc-submit" disabled={loading}>
              {loading ? <span className="auth-spinner"></span> : 'Delete My Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
