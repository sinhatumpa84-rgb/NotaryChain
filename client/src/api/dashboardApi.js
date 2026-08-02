import api from './axios';

export const dashboardApi = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getCompanyDashboard: () => api.get('/dashboard/company'),
  getBankDashboard: () => api.get('/dashboard/bank'),
  getNotaryDashboard: () => api.get('/dashboard/notary')
};
