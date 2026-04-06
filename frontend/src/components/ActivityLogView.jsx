import './ActivityLogView.css';

const getActionIcon = (action) => {
  switch (action) {
    case 'created':
    case 'created project':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'updated':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'completed':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case 'deleted':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    default:
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/></svg>;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'created':
    case 'created project': return 'var(--primary)';
    case 'updated': return '#3b82f6';
    case 'completed': return '#10b981';
    case 'deleted': return '#ef4444';
    default: return 'var(--outline)';
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ActivityLogView({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="activity-empty">
        <p className="body-sm">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <div key={activity._id} className="activity-item">
          <div 
            className={`activity-icon activity-icon--${activity.action}`}
            style={{ color: getActionColor(activity.action), background: `${getActionColor(activity.action)}20` }}
          >
            {getActionIcon(activity.action)}
          </div>
          
          <div className="activity-content">
            <p className="activity-text">
              <span className="activity-user">{activity.user?.name || 'Unknown User'}</span>
              {' '}
              <span className="activity-action">{activity.action}</span>
              {' '}
              <span className="activity-task" title={activity.taskTitle}>
                {activity.taskTitle ? `"${activity.taskTitle}"` : 'a task'}
              </span>
            </p>
            <span className="activity-time">{formatTime(activity.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
