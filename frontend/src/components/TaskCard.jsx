import { useState, useRef } from 'react';
import { 
  Calendar, 
  Paperclip, 
  Link as LinkIcon, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Image as ImageIcon, 
  File as FileIcon, 
  Globe,
  PlayCircle
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function TaskCard({ 
  task, 
  onComplete,
  onProgress, 
  isManager, 
  onDelete, 
  onEdit, 
  onUpload, 
  onDeleteAttachment, 
  onAddLink, 
  onDeleteLink 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isCompleted = task.status === 'Completed';
  const isOverdue = !isCompleted && task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !onUpload) return;
    setUploading(true);
    try {
      await onUpload(task._id, files);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim() || !onAddLink) return;
    try {
      await onAddLink(task._id, { url: linkUrl.trim(), title: linkTitle.trim() });
      setLinkUrl('');
      setLinkTitle('');
      setShowLinkForm(false);
    } catch(err) {}
  };

  const getDueDateLabel = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    return format(date, 'MMM d');
  };

  const dueDateLabel = getDueDateLabel();

  return (
    <div className={twMerge(
      "group relative rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50",
      task.status === 'Pending' ? 'bg-[#FEF3C7] border-amber-200 shadow-amber-900/5 border-l-4 border-l-pending' : 
      task.status === 'In Progress' ? 'bg-[#DBEAFE] border-blue-200 shadow-blue-900/5 border-l-4 border-l-progress' : 
      task.status === 'Completed' ? 'bg-[#D1FAE5] border-emerald-200 shadow-emerald-900/5 border-l-4 border-l-completed' : 
      'bg-white border-slate-100'
    )}>
      <div className="p-5">
        {/* Header: Badges & Menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <span className={clsx(
              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
              task.status === 'Pending' ? "bg-pending/10 text-pending border-pending/20" :
              task.status === 'In Progress' ? "bg-progress/10 text-progress border-progress/20" :
              "bg-completed/10 text-completed border-completed/20"
            )}>
              {task.status}
            </span>
            <span className={clsx(
              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
              task.priority === 'High' ? "bg-rose-50 text-rose-600 border-rose-100 shadow-sm" :
              task.priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
              "bg-emerald-50 text-emerald-600 border-emerald-100"
            )}>
              {task.priority}
            </span>
          </div>
          
          <div className="relative menu-container">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <MoreVertical size={18} />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl z-20 py-2 animate-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => { onEdit(task); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all"
                  >
                    <Edit3 size={16} /> Edit Details
                  </button>
                  <button 
                    onClick={() => { onDelete(task._id); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all border-t border-slate-50 mt-1"
                  >
                    <Trash2 size={16} /> Delete Task
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Task Identity */}
        <div className="mb-4">
          <h3 className="text-base font-black text-slate-900 mb-1 leading-tight group-hover:text-primary transition-colors cursor-default">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Active Resources Management */}
        {(task.attachments?.length > 0 || task.links?.length > 0) && (
          <div className="space-y-2 mb-4 py-4 border-y border-slate-50">
            {task.attachments?.map(att => (
              <div key={att._id} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-xl group/att transition-all hover:bg-white hover:shadow-sm ring-1 ring-transparent hover:ring-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0 p-1.5 rounded-lg bg-white border border-slate-100 text-attachment-file">
                    {att.original_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <ImageIcon size={14} className="text-attachment-image" /> : <FileIcon size={14} />}
                  </div>
                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-slate-600 hover:text-primary truncate">
                    {att.original_name}
                  </a>
                </div>
                <button 
                  onClick={() => onDeleteAttachment(task._id, att._id)}
                  className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/att:opacity-100 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {task.links?.map(link => (
              <div key={link._id} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-xl group/link transition-all hover:bg-white hover:shadow-sm ring-1 ring-transparent hover:ring-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0 p-1.5 rounded-lg bg-white border border-slate-100 text-attachment-link">
                    <Globe size={14} />
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-slate-600 hover:text-primary truncate">
                    {link.title || link.url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
                <button 
                  onClick={() => onDeleteLink(task._id, link._id)}
                  className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/link:opacity-100 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Footer: Avatars & Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} id={`up-${task._id}`} />
            <label htmlFor={`up-${task._id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer">
              <Paperclip size={16} />
            </label>
            <button onClick={() => setShowLinkForm(!showLinkForm)} className={clsx(
              "p-2 rounded-xl transition-all",
              showLinkForm ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-primary hover:bg-primary/5"
            )}>
              <LinkIcon size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {task.assigned_users?.slice(0, 3).map((u, i) => (
                <div key={u._id || i} className="w-8 h-8 rounded-full bg-white border-2 border-white ring-1 ring-slate-100 flex items-center justify-center font-black text-[9px] text-slate-600 shadow-sm" title={u.name}>
                  {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>

            <div className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tight shadow-sm transition-all",
              isOverdue ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100 group-hover:border-slate-200"
            )}>
              <Calendar size={12} strokeWidth={2.5} />
              {isOverdue ? `Overdue: ${dueDateLabel}` : dueDateLabel || "TBD"}
            </div>
          </div>
        </div>

        {/* Quick Add Link Form */}
        {showLinkForm && (
          <form onSubmit={handleAddLink} className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 animate-in slide-in-from-top-2">
            <input
              type="url"
              placeholder="Source URL (https://...)"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-medium"
              required
              autoFocus
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Title (optional)"
                value={linkTitle}
                onChange={e => setLinkTitle(e.target.value)}
                className="flex-1 text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/5"
              />
              <button type="submit" className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20">
                Add
              </button>
            </div>
          </form>
        )}

        {/* Completion Milestone */}
        {isCompleted ? (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-completed/10 text-completed flex items-center justify-center border border-completed/20">
              <CheckCircle2 size={16} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed by</p>
              <p className="text-[11px] font-bold text-slate-700">{task.completed_by?.name || 'System'}</p>
            </div>
          </div>
        ) : !isManager && (
          task.status === 'Pending' ? (
            <button 
              onClick={() => onProgress(task._id)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-progress/5 text-slate-600 hover:text-progress border border-slate-200 hover:border-progress/30 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-[0.98]"
            >
              <PlayCircle size={16} strokeWidth={2.5} />
              Start Task
            </button>
          ) : (
            <button 
              onClick={() => onComplete(task._id)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-completed/5 text-slate-600 hover:text-completed border border-slate-200 hover:border-completed/30 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-[0.98]"
            >
              <CheckCircle2 size={16} strokeWidth={2.5} />
              Resolve Task
            </button>
          )
        )}

        {/* Upload State Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
