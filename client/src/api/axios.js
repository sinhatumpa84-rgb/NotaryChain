import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Screen-Resolution'] = `${window.screen.width}x${window.screen.height}`;
  return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        if (refresh) {
          const { data } = await axios.post('/api/auth/refresh-token', { token: refresh });
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
