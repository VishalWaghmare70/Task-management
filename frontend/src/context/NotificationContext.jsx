import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetchNotifications();
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } else {
        console.warn('Notifications response is not an array:', res.data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
      // Ensure state is at least empty instead of keeping stale/broken data
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Load initially and poll every 15 seconds
  useEffect(() => {
    loadNotifs();
    const interval = setInterval(() => {
      loadNotifs();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadNotifs]);

  const addNotification = useCallback((message, type = 'info') => {
    // This is now mainly handled by the backend (task creation/updates).
    // If the frontend needs to optimistically push a local notification:
    const notification = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      local: true
    };
    setNotifications(prev => [notification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
    return notification;
  }, []);

  const markAsRead = useCallback(async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.read) return;

    // Optimistically update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (!notif.local) {
      try {
        await markNotificationRead(id);
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await clearAllNotifications();
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        reloadNotifications: loadNotifs
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
