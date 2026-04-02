import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, LogOut, Menu, X, Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [];

  if (user?.role === 'Manager' || user?.role === 'CEO') {
    navLinks.push({ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' });
  }

  navLinks.push({ to: '/dashboard?view=tasks', icon: CheckSquare, label: 'Tasks' });
  
  if (user?.role === 'Manager' || user?.role === 'CEO') {
    navLinks.push({ to: '/users', icon: Users, label: 'Team Members' });
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans relative">
      {/* Floating Animated Background Orbs */}
      <div className="animated-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
        <div className="orb orb-5"></div>
        <div className="orb orb-6"></div>
      </div>
      <div className="animated-bg-overlay"></div>

      <Toaster position="top-right" />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/60 backdrop-blur-xl border-r border-border/50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
            TaskFlow
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-10">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name}</span>
                <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">{user?.role}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0 shadow-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable view */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 lg:p-8 custom-scroll relative z-[2]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
