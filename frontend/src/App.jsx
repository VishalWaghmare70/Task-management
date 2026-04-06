import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectDetails from './pages/ProjectDetails';
import UsersPage from './pages/UsersPage';
import Layout from './components/Layout';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RoleBasedRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  // Manager/CEO goes to Project Dashboard (New Role-Based Landing Page)
  if (['Manager', 'CEO', 'Founder'].includes(user.role)) {
    return <Navigate to="/project-dashboard" replace />;
  }
  
  // Team Member goes to their personal Dashboard (Tasks Only)
  return <Navigate to="/dashboard" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <RoleBasedRedirect /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      
      {/* Wrap protected routes with Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/project-dashboard" element={
          <ProtectedRoute allowedRoles={['Manager', 'CEO', 'Founder']}>
            <ProjectDashboard />
          </ProtectedRoute>
        } />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<RoleBasedRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

