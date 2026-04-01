import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = isLogin
        ? { email, password }
        : { name, email, password, role };
      const res = isLogin
        ? await loginUser(payload)
        : await registerUser(payload);
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-ambient-1"></div>
      <div className="auth-ambient-2"></div>

      <div className="auth-card animate-fade-in" id="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="auth-brand-text">TaskFlow</h1>
          <p className="auth-brand-sub">The Digital Curator</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode()}
            id="login-tab"
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode()}
            id="register-tab"
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {!isLogin && (
            <div className="form-group">
              <label className="label-md" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="form-input"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="label-md" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="label-md" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="label-md">Select Your Role</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-option ${role === 'Manager' ? 'role-option--active' : ''}`}
                  onClick={() => setRole('Manager')}
                >
                  <div className="role-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span className="role-label">Manager</span>
                  <span className="role-desc">Create & assign tasks</span>
                </button>
                <button
                  type="button"
                  className={`role-option ${role === 'Team Member' ? 'role-option--active' : ''}`}
                  onClick={() => setRole('Team Member')}
                >
                  <div className="role-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <span className="role-label">Team Member</span>
                  <span className="role-desc">View & complete tasks</span>
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading} id="auth-submit">
            {loading ? (
              <span className="auth-spinner"></span>
            ) : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button className="auth-switch-btn" onClick={switchMode}>
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <p className="auth-system-status">System Status: All Operational</p>
    </div>
  );
}
