import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTasks, createTask, completeTask, deleteTask } from '../services/api';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const isManager = user?.role === 'Manager';

  const loadTasks = async () => {
    try {
      const res = await fetchTasks();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleCreateTask = async (data) => {
    await createTask(data);
    await loadTasks();
  };

  const handleComplete = async (id) => {
    await completeTask(id);
    await loadTasks();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    await loadTasks();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.status === 'Completed';
    if (filter === 'pending') return t.status === 'Pending';
    return true;
  });

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        {/* Greeting */}
        <section className="greeting-section animate-fade-in">
          <div>
            <h1 className="display-md">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
            <p className="body-md greeting-date">{formatDate()}</p>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-row animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card" id="stat-total">
            <div className="stat-icon stat-icon--total">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6"/></svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{totalTasks}</span>
              <span className="stat-label label-md">Total Tasks</span>
            </div>
          </div>
          <div className="stat-card" id="stat-completed">
            <div className="stat-icon stat-icon--completed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{completedTasks}</span>
              <span className="stat-label label-md">Completed</span>
            </div>
          </div>
          <div className="stat-card" id="stat-pending">
            <div className="stat-icon stat-icon--pending">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{pendingTasks}</span>
              <span className="stat-label label-md">Pending</span>
            </div>
          </div>
        </section>

        {/* Task section header */}
        <section className="tasks-header animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="tasks-header-left">
            <h2 className="headline-sm">All Tasks</h2>
            <div className="filter-pills">
              <button className={`filter-pill ${filter === 'all' ? 'filter-pill--active' : ''}`} onClick={() => setFilter('all')}>All</button>
              <button className={`filter-pill ${filter === 'pending' ? 'filter-pill--active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
              <button className={`filter-pill ${filter === 'completed' ? 'filter-pill--active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
            </div>
          </div>
          {isManager && (
            <button className="create-task-btn" onClick={() => setModalOpen(true)} id="create-task-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Task
            </button>
          )}
        </section>

        {/* Task grid */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="body-md">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <h3 className="title-md">No tasks found</h3>
            <p className="body-md">{isManager ? 'Create your first task to get started.' : 'No tasks have been assigned yet.'}</p>
          </div>
        ) : (
          <section className="task-grid" id="task-grid">
            {filteredTasks.map((task, i) => (
              <div key={task._id} style={{ animationDelay: `${0.05 * i}s` }}>
                <TaskCard
                  task={task}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  isManager={isManager}
                />
              </div>
            ))}
          </section>
        )}
      </main>

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
