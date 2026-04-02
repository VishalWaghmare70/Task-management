import React, { useState, useEffect, useRef } from 'react';
import { fetchTasks, fetchTaskStats, fetchActivities, fetchUsers, createTask, updateTask, updateTaskStatus, deleteTask, uploadAttachments, deleteAttachment, addLink, deleteLink } from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Search, Plus, Clock, CheckCircle, ListTodo, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const overdueNotified = React.useRef(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [usersList, setUsersList] = useState([]);

  const isManager = ['Manager', 'CEO', 'Founder'].includes(user?.role);

  const loadData = async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filter !== 'all' && filter !== 'overdue') params.status = filter;
      if (filterUser) params.user = filterUser;
      if (filterPriority) params.priority = filterPriority;

      const [tasksRes, statsRes, usersRes] = await Promise.all([
        fetchTasks(params), 
        fetchTaskStats(), 
        fetchUsers()
      ]);
      
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setStats(statsRes.data || null);
      setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterUser, filterPriority, filter]);

  // Check for overdue tasks
  useEffect(() => {
    if (tasks.length > 0) {
      const today = new Date(new Date().toDateString());
      tasks.forEach(t => {
        if ((t.status === 'Pending' || t.status === 'In Progress') && t.dueDate) {
          const dueDate = new Date(t.dueDate);
          if (dueDate < today && !overdueNotified.current.has(t._id)) {
            addNotification(`Task "${t.title}" becomes Overdue`, 'warning');
            overdueNotified.current.add(t._id);
          }
        }
      });
    }
  }, [tasks, addNotification]);

  const handleCreateTask = async (data) => {
    try {
      const { files, links, ...taskData } = data;
      const res = await createTask(taskData);
      const taskId = res.data._id;

      // Handle file uploads if any
      if (files && files.length > 0) {
        await uploadAttachments(taskId, files);
      }

      // Handle links if any
      if (links && links.length > 0) {
        for (const link of links) {
          if (link.url.trim()) {
            await addLink(taskId, link);
          }
        }
      }

      toast.success('Task created successfully');
      addNotification('New task added', 'info');
      await loadData();
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      if (newStatus === 'In Progress') {
        addNotification('Task moved to In Progress', 'info');
        toast.success('Task moved to In Progress', { duration: 2500 });
      } else if (newStatus === 'Completed') {
        addNotification('Task completed', 'success');
        toast.success('Task moved to Completed', { duration: 2500 });
      }
      await loadData();
    } catch (err) {
      toast.error('Status update failed');
      await loadData();
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      await loadData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const handleUpdateTask = async (taskId, data) => {
    try {
      await updateTask(taskId, data);
      toast.success('Task updated');
      await loadData();
      setEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleUpload = async (taskId, files, onProgress) => {
    try {
      await uploadAttachments(taskId, files, onProgress);
      toast.success('Files uploaded');
      await loadData();
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleDeleteAttachment = async (taskId, attachmentId) => {
    try {
      await deleteAttachment(taskId, attachmentId);
      toast.success('Attachment removed');
      await loadData();
    } catch (err) {
      toast.error('Failed to remove attachment');
    }
  };

  const handleAddLink = async (taskId, data) => {
    try {
      await addLink(taskId, data);
      toast.success('Link added');
      await loadData();
    } catch (err) {
      toast.error('Failed to add link');
    }
  };

  const handleDeleteLink = async (taskId, linkId) => {
    try {
      await deleteLink(taskId, linkId);
      toast.success('Link removed');
      await loadData();
    } catch (err) {
      toast.error('Failed to remove link');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'overdue') return (t.status === 'Pending' || t.status === 'In Progress') && t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString());
    return true;
  });

  return (
    <div className="flex flex-col gap-10 max-w-[1600px] mx-auto w-full relative min-h-screen">

      
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Mission Control</h1>
        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Manage, Track, and Scale your team's objectives</p>
      </div>

      {/* Top Stats Section - Restricted to Manager/CEO */}
      {(user?.role === 'Manager' || user?.role === 'CEO') && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
              <ListTodo size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Total Tasks</p>
              <h2 className="text-2xl font-black text-foreground leading-none">{stats?.totalTasks || 0}</h2>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Completed</p>
              <h2 className="text-2xl font-black text-foreground leading-none">{stats?.completedTasks || 0}</h2>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Pending</p>
              <h2 className="text-2xl font-black text-foreground leading-none">{stats?.pendingTasks || 0}</h2>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100">
              <AlertCircle size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Overdue</p>
              <h2 className="text-2xl font-black text-foreground leading-none">{stats?.overdueTasks || 0}</h2>
            </div>
          </div>
        </section>
      )}

      {/* Main Board View */}
      <section className="flex flex-col gap-6">
        {/* Header & Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
              <select
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
                className="flex-1 lg:w-48 py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary cursor-pointer text-slate-700 font-medium"
              >
                <option value="">All Team Members</option>
                {usersList
                  .filter(u => u.name && u._id !== user?._id) // Hide self
                  .filter(u => {
                    if (user?.role === 'CEO' || user?.role === 'Founder') return true; // CEO sees everyone
                    return u.role === 'Team Member'; // Managers and Others see just Team Members
                  })
                  .map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>

              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="flex-1 lg:w-48 py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary cursor-pointer text-slate-700 font-medium"
              >
                <option value="">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 shrink-0 pt-4 border-t border-slate-100 xl:border-t-0 xl:pt-0 xl:pl-6 xl:border-l">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar gap-1 max-w-[260px] xs:max-w-none shadow-inner">
              {['all', 'Pending', 'In Progress', 'Completed', 'overdue'].map(f => {
                const isActive = filter === f;
                const statusColor = 
                  f === 'Pending' ? 'text-pending' : 
                  f === 'In Progress' ? 'text-progress' : 
                  f === 'Completed' ? 'text-completed' : 
                  f === 'overdue' ? 'text-rose-500' : 
                  'text-primary';
                
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all relative ${
                      isActive 
                      ? `bg-white ${statusColor} shadow-md shadow-slate-200` 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                    }`}
                  >
                    {isActive && (
                      <span className={`absolute bottom-0.5 left-1/2 -translateX-1/2 w-4 h-0.5 ${
                        f === 'Pending' ? 'bg-pending' : 
                        f === 'In Progress' ? 'bg-progress' : 
                        f === 'Completed' ? 'bg-completed' : 
                        f === 'overdue' ? 'bg-rose-500' : 
                        'bg-primary'
                      } rounded-full`} />
                    )}
                    {f === 'all' ? 'Board' : f}
                  </button>
                );
              })}
            </div>

            {isManager && (
              <button 
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/hover transition-all shrink-0 active:scale-95 group"
              >
                <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden md:inline">Add Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Board Container */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
            <p className="font-medium animate-pulse">Loading board...</p>
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            activeFilter={filter}
            onDragEnd={(e) => {
              const { active, over } = e;
              if (!over) return;
              const taskId = active.id;
              const newStatus = over.id;
              const task = tasks.find(t => t._id === taskId);
              if (task && task.status !== newStatus) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
                handleStatusChange(taskId, newStatus);
              }
            }}
            taskProps={{
              onComplete: (id) => handleStatusChange(id, 'Completed'),
              onProgress: (id) => handleStatusChange(id, 'In Progress'),
              onDelete: handleDelete,
              onEdit: handleEdit,
              isManager,
              onUpload: handleUpload,
              onDeleteAttachment: handleDeleteAttachment,
              onAddLink: handleAddLink,
              onDeleteLink: handleDeleteLink
            }}
          />
        )}
      </section>

      {modalOpen && <CreateTaskModal onClose={() => setModalOpen(false)} onSubmit={handleCreateTask} users={usersList} />}
      {editModalOpen && editingTask && <EditTaskModal task={editingTask} onClose={() => setEditModalOpen(false)} onSubmit={(id, data) => handleUpdateTask(id, data)} users={usersList} />}
    </div>
  );
}
