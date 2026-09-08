import axios from 'axios';

function getApiBaseUrl(): string {
  let envUrl = (import.meta as any).env?.VITE_API_BASE_URL;

  if (envUrl && typeof envUrl === 'string') {
    envUrl = envUrl.trim();
    // If Render host is passed without protocol (e.g. "dormify-backend.onrender.com/api")
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://') && !envUrl.startsWith('/')) {
      envUrl = `https://${envUrl}`;
    }
    return envUrl.replace(/\/+$/, '');
  }

  // In production, fallback to deployed backend if VITE_API_BASE_URL was omitted during build
  if ((import.meta as any).env?.PROD) {
    return 'https://dormify-ymt7.onrender.com/api';
  }

  return '/api';
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dormify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dormify_token');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    let message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (message === 'Network Error') {
      message = 'Network Error: Unable to reach backend server. If using Render free tier, the server may be waking up from sleep (takes ~45s). Please retry in a moment.';
    }
    const customError = new Error(message) as any;
    customError.statusCode = error.response?.status;
    customError.response = error.response;
    return Promise.reject(customError);
  }
);
