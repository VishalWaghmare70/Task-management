import { useState, useRef, useEffect } from 'react';
import { X, Calendar, Check, Link as LinkIcon, Paperclip, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default function EditTaskModal({ task, onClose, onSubmit, users }) {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [selectedUsers, setSelectedUsers] = useState(task.assigned_users?.map(u => u._id) || []);
  const [loading, setLoading] = useState(false);
  
  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit(task._id, {
        title,
        description,
        priority,
        dueDate: dueDate || null,
        assigned_users: selectedUsers
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-100 overflow-hidden animate-in zoom-in-[0.98] duration-500">
        <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-white/50 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Edit3 size={24} strokeWidth={2.5} className="lucide lucide-edit-3" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Task</h2>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-0.5">Refine your team's objectives</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scroll">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Context & Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-slate-900 min-h-[100px] resize-none font-medium leading-relaxed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Risk Level / Priority</label>
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={twMerge(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                      priority === level 
                        ? (level === 'High' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200 scale-[1.02]' : 
                           level === 'Medium' ? 'bg-pending text-white border-pending shadow-lg shadow-amber-200 scale-[1.02]' : 
                           'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-[1.02]')
                        : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deadline</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="date"
                  min={today}
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm text-slate-900 font-bold transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assign Team Collaborators</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1 max-h-[220px] overflow-y-auto no-scrollbar">
              {users
                .filter(u => u.name && !['prerna', 'rajesh'].includes(u.name.toLowerCase().trim().split(' ')[0]))
                .map(u => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => toggleUser(u._id)}
                  className={twMerge(
                    "flex items-center gap-3 p-3 rounded-2xl transition-all border text-left",
                    selectedUsers.includes(u._id)
                      ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center font-black text-[11px] text-slate-600 shadow-sm relative shrink-0">
                    {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    {selectedUsers.includes(u._id) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white">
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={twMerge("text-xs font-black truncate tracking-tight uppercase", selectedUsers.includes(u._id) ? "text-primary" : "text-slate-700")}>{u.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 sticky bottom-0 z-10 backdrop-blur-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex-[2] py-4 text-xs font-black uppercase tracking-[0.2em] text-white bg-primary rounded-2xl hover:bg-primary/hover transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
          >
            {loading ? 'Updating Objectives...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Fixed lucide import check
import { Edit3 } from 'lucide-react';
