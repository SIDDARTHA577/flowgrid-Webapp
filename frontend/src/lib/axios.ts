import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for sending/receiving HttpOnly cookies
});

// Interceptor to handle 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        // Redirect to login page on session expiry
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
