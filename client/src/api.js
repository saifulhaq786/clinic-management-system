import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const productionBaseUrl = 'https://clinic-management-system-jwqg.onrender.com';

const api = axios.create({
  baseURL: configuredBaseUrl || (import.meta.env.DEV ? 'http://localhost:5001' : productionBaseUrl),
});

export default api;
