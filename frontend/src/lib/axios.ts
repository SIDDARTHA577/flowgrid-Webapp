import axios from 'axios';

let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
if (baseUrl && !baseUrl.startsWith('http') && !baseUrl.startsWith('/')) {
  baseUrl = `https://${baseUrl}`;
}

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
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
