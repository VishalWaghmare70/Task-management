import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://task-management-backend-mmeh.onrender.com/api')).replace(/\/+$/, '');
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
export const deleteAccount = (data) => api.delete('/auth/delete-account', { data });


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

// Projects
export const fetchProjects = () => api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const fetchProjectDetails = (id) => api.get(`/projects/${id}`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export default api;
