import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import DeleteAccountModal from './DeleteAccountModal';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [delModalOpen, setDelModalOpen] = useState(false);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span className="brand-text">TaskFlow</span>
          </div>

          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role-badge">{user?.role}</span>
            </div>
            <div className="user-avatar" title={user?.name}>
              {getInitials(user?.name || 'U')}
            </div>
            <button
              className="change-pwd-btn"
              onClick={() => setPwdModalOpen(true)}
              id="change-password-btn"
              title="Change Password"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Password</span>
            </button>
            <button
              className="delete-acc-nav-btn"
              onClick={() => setDelModalOpen(true)}
              id="delete-account-nav-btn"
              title="Delete Account"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
            <button className="logout-btn" onClick={logout} id="logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <ChangePasswordModal
        isOpen={pwdModalOpen}
        onClose={() => setPwdModalOpen(false)}
      />

      <DeleteAccountModal
        isOpen={delModalOpen}
        onClose={() => setDelModalOpen(false)}
      />
    </>
  );
}
