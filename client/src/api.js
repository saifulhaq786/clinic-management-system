import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const productionBaseUrl = 'https://clinic-management-system-jwqg.onrender.com';

const api = axios.create({
  baseURL: configuredBaseUrl || (import.meta.env.DEV ? 'http://localhost:5001' : productionBaseUrl),
  timeout: 60000, // 60s timeout — Render free tier cold-starts are slow
});

// Retry once on network errors (cold-start resilience)
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
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
