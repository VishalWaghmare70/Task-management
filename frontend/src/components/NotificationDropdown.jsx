import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, BellRing, Check, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import './NotificationDropdown.css';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
};

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [bellRing, setBellRing] = useState(false);
  const prevCountRef = useRef(unreadCount);
  const dropdownRef = useRef(null);

  // Ring animation when new notification arrives
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setBellRing(true);
      const timeout = setTimeout(() => setBellRing(false), 700);
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleItemClick = (id) => {
    markAsRead(id);
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="notification-bell"
        className={`notif-bell-btn ${isOpen ? 'notif-bell-btn--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellRing size={20} className={bellRing ? 'notif-bell-ring' : ''} />
        ) : (
          <Bell size={20} />
        )}
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="notif-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="notif-dropdown">
          {/* Header */}
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notifications</span>
            <div className="notif-dropdown-actions">
              {unreadCount > 0 && (
                <button
                  className="notif-action-btn"
                  onClick={() => markAllAsRead()}
                >
                  <CheckCheck size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notif-action-btn notif-action-btn--danger"
                  onClick={() => { clearAll(); setIsOpen(false); }}
                >
                  <Trash2 size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">
                  <Bell size={24} />
                </div>
                <p className="notif-empty-text">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const TypeIcon = typeIcons[notif.type] || Info;
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${!notif.read ? 'notif-item--unread' : ''}`}
                    onClick={() => handleItemClick(notif.id)}
                  >
                    <div className={`notif-type-dot notif-type-dot--${notif.type || 'info'}`}>
                      <TypeIcon size={18} />
                    </div>
                    <div className="notif-content">
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-time">{timeAgo(notif.timestamp)}</span>
                    </div>
                    {!notif.read && <div className="notif-unread-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
