import api from './axios';

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  deleteAccount: () => api.delete('/users/account'),
  getActivityTimeline: () => api.get('/users/activity')
};
