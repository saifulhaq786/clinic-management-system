import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const productionBaseUrl = 'https://clinic-management-system-jwqg.onrender.com';

const api = axios.create({
  baseURL: configuredBaseUrl || (import.meta.env.DEV ? 'http://localhost:5001' : productionBaseUrl),
  timeout: 60000,
});

// CRITICAL: Base request interceptor to attach 'token'
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry and network errors
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;

    // Handle Auth Failures (401 Unauthorized or 403 Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear all potentially compromised/expired local storage items
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('session_type');
      localStorage.removeItem('user_role');
      
      // Force redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/mobile-login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Network level failure (cold-start resilience)
    if (
      !config._retried &&
      !error.response && // network-level failure (no HTTP status)
      error.message?.includes('Network Error')
    ) {
      config._retried = true;
      // Wait 3s then retry — server is likely waking up
      await new Promise(r => setTimeout(r, 3000));
      return api(config);
    }
    return Promise.reject(error);
  }
);

export default api;
