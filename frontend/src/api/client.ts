import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('mnkhan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle token expiration/auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthError = 
      error.response?.status === 403 && 
      (error.response?.data?.message === 'Token expired' || error.response?.data?.message?.includes('Auth failed'));

    if (isAuthError) {
      console.warn('[API] Auth session expired. Logging out...');
      localStorage.removeItem('mnkhan_token');
      localStorage.removeItem('mnkhan_user');
      // Redirect to home/login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default client;
