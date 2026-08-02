import api from './axios';

export const adminApi = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
  getSystemHealth: () => api.get('/admin/health'),
  getLoginHistory: (params) => api.get('/admin/logins', { params }),
  getFraudReports: (params) => api.get('/admin/fraud-reports', { params }),
  updateFraudReport: (id, data) => api.patch(`/admin/fraud-reports/${id}`, data)
};
