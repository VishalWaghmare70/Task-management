import './TaskCard.css';

export default function TaskCard({ task, onComplete, isManager, onDelete }) {
  const isPending = task.status === 'Pending';

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`task-card ${isPending ? '' : 'task-card--completed'}`} id={`task-${task._id}`}>
      <div className="task-card-header">
        <span className={`status-pill ${isPending ? 'status-pill--pending' : 'status-pill--completed'}`}>
          {isPending ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          )}
          {task.status}
        </span>
        {isManager && (
          <button className="task-delete-btn" onClick={() => onDelete(task._id)} title="Delete task">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        )}
      </div>

      <h3 className="task-card-title">{task.title}</h3>
      {task.description && <p className="task-card-desc">{task.description}</p>}

      <div className="task-card-meta">
        <div className="task-assignees">
          {task.assigned_users?.map((u, i) => (
            <div className="assignee-chip" key={u._id || i} title={u.name}>
              <span className="assignee-avatar">{getInitials(u.name)}</span>
              <span className="assignee-name">{u.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
        <span className="task-date">{formatDate(task.createdAt)}</span>
      </div>

      {isPending && (
        <button className="task-complete-btn" onClick={() => onComplete(task._id)} id={`complete-${task._id}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4"/></svg>
          Mark Complete
        </button>
      )}

      {!isPending && task.completed_by && (
        <div className="task-completed-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          <span>Completed by {task.completed_by.name}</span>
        </div>
      )}
    </div>
  );
}
