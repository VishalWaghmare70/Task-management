import { useState } from 'react';
import { changePassword } from '../services/api';
import './ChangePasswordModal.css';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      setSuccess(res.data.message || 'Password updated successfully!');
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="change-pwd-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="change-pwd-header">
          <div className="change-pwd-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="change-pwd-title">Change Password</h2>
          <p className="change-pwd-subtitle">Update your account password</p>
        </div>

        <form onSubmit={handleSubmit} className="change-pwd-form">
          {error && (
            <div className="change-pwd-alert change-pwd-alert--error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="change-pwd-alert change-pwd-alert--success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
              {success}
            </div>
          )}

          <div className="form-group">
            <label className="label-md" htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label-md" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="form-input"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="label-md" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="form-input"
              required
              minLength={6}
            />
          </div>

          <div className="change-pwd-actions">
            <button type="button" className="change-pwd-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="change-pwd-submit" disabled={loading}>
              {loading ? <span className="auth-spinner"></span> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
