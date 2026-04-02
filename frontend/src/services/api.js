import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const changePassword = (data) => api.put('/auth/change-password', data);


// Tasks
export const fetchTasks = (params = {}) => api.get('/tasks', { params });
export const fetchTaskStats = () => api.get('/tasks/stats');
export const fetchActivities = () => api.get('/activities');
export const createTask = (data) => api.post('/tasks', data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);

// Attachments
export const uploadAttachments = (taskId, files, onProgress) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  return api.post(`/tasks/${taskId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
      : undefined,
  });
};

export const deleteAttachment = (taskId, attachmentId) =>
  api.delete(`/tasks/${taskId}/attachment/${attachmentId}`);

// Links
export const addLink = (taskId, data) => api.post(`/tasks/${taskId}/link`, data);
export const deleteLink = (taskId, linkId) => api.delete(`/tasks/${taskId}/link/${linkId}`);

// Users
export const fetchUsers = () => api.get('/users');

// Notifications
export const fetchNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');
export const clearAllNotifications = () => api.delete('/notifications');

export default api;
