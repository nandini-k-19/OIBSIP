import axios from 'axios';

export const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (url && typeof url === 'string' && url.trim() !== '') {
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    if (!url.endsWith('/api')) {
      url = url.replace(/\/$/, '') + '/api';
    }
    return url;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('onrender.com')) {
      const backendHost = hostname.replace('frontend', 'backend');
      return `https://${backendHost}/api`;
    }
  }
  return 'http://localhost:8000/api';
};

export const getWsUrl = () => {
  let url = import.meta.env.VITE_WS_URL;
  if (url && typeof url === 'string' && url.trim() !== '') {
    url = url.trim();
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      url = `wss://${url.replace(/^https?:\/\//, '')}`;
    }
    return url.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('onrender.com')) {
      const backendHost = hostname.replace('frontend', 'backend');
      return `wss://${backendHost}`;
    }
  }
  return 'ws://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();
export const WS_BASE_URL = getWsUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pizzahub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear auth storage
      if (localStorage.getItem('pizzahub_token')) {
        localStorage.removeItem('pizzahub_token');
        localStorage.removeItem('pizzahub_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
