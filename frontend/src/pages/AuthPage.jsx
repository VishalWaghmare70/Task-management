import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';
import { CheckSquare, Mail, Lock, User, Shield, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Cold start notification after 1.5s
    const statusTimeout = setTimeout(() => setShowStatus(true), 1500);

    try {
      const payload = isLogin
        ? { email, password }
        : { name, email, password, role };
      const res = isLogin
        ? await loginUser(payload)
        : await registerUser(payload);
      
      login(res.data.user, res.data.token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      clearTimeout(statusTimeout);
      setLoading(false);
      setShowStatus(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 lg:p-8 relative overflow-hidden" style={{ background: 'var(--background, #f0f8ff)' }}>
      {/* Premium floating orb background — shared with Layout */}
      <div className="animated-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
        <div className="orb orb-5"></div>
        <div className="orb orb-6"></div>
      </div>
      <div className="animated-bg-overlay"></div>

      <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-none sm:rounded-[2.5rem] shadow-none sm:shadow-2xl sm:shadow-slate-200/50 border-0 sm:border border-slate-100 overflow-hidden animate-in fade-in zoom-in-[0.98] duration-700 relative z-[5]">
        <div className="p-8 sm:p-12 lg:p-16">
          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-6 transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500">
              <CheckSquare size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">TaskFlow</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">The Dynamic Workplace</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                isLogin ? 'bg-white text-primary shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                !isLogin ? 'bg-white text-primary shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('Manager')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      role === 'Manager' 
                        ? 'bg-primary/5 border-primary ring-4 ring-primary/5 text-primary' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Shield size={24} />
                    <span className="text-xs font-bold">Manager</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Team Member')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      role === 'Team Member' 
                        ? 'bg-primary/5 border-primary ring-4 ring-primary/5 text-primary' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Users size={24} />
                    <span className="text-xs font-bold">Team Member</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-75 disabled:hover:scale-100 touch-manipulation z-[10]"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  {showStatus && <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse pt-1">Server is waking up, please wait...</span>}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={20} />
                </div>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50/50 p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500 font-medium">
            System status: <span className="text-emerald-500 font-bold">Fully Operational</span>
          </p>
        </div>
      </div>
    </div>
  );
}
