// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000 // 8 second timeout to avoid long wait times
});

// Better error handling
const handleApiError = (error) => {
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
    // Network error - server not reachable
    console.log('Connection error detected:', error.code);
    return {
      isConnectionError: true,
      message: 'Не удалось подключиться к серверу. Проверьте подключение к интернету или убедитесь, что сервер запущен.'
    };
  } else if (error.response) {
    // Request was made and server responded with an error code
    return {
      statusCode: error.response.status,
      message: error.response.data?.message || 'Ошибка сервера'
    };
  } else {
    // Something else went wrong
    return {
      message: 'Произошла неизвестная ошибка'
    };
  }
};

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {
  // Check if connected to backend
  checkConnection: async () => {
    try {
      const response = await api.get('/health', { timeout: 3000 });
      return { connected: true, data: response.data };
    } catch (error) {
      console.warn('Backend connection check failed:', error.code || error.message);
      return { connected: false, error: handleApiError(error) };
    }
  },
  
  // Login with email/password
  login: async (email, password) => {
    try {
      // Check connection first
      const connectionCheck = await authService.checkConnection();
      if (!connectionCheck.connected) {
        throw connectionCheck.error;
      }
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw handleApiError(error);
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  
  // Check auth status
  checkAuth: async () => {
    try {
      // Check connection first
      const connectionCheck = await authService.checkConnection();
      if (!connectionCheck.connected) {
        console.warn('Can\'t check auth - server not available');
        return { authenticated: false, error: connectionCheck.error };
      }
      
      const response = await api.get('/auth/check');
      return { authenticated: true, user: response.data.user };
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear token if unauthorized
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('auth_token');
      }
      return { authenticated: false, error: handleApiError(error) };
    }
  },
  
  // Get current user info from token
  getCurrentUser: () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      // Decode JWT token (simplified, consider using a proper JWT library)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      localStorage.removeItem('auth_token');
      return null;
    }
  },
  
  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.isAdmin === true;
  }
};

export default authService;