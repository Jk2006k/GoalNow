import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Google Sign-Up
  googleSignup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/google-signup', userData);
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isLoggedIn', 'true');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Sign-up failed' };
    }
  },

  // Email Sign-Up
  emailSignup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/email-signup', userData);
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isLoggedIn', 'true');
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Sign-up failed' };
    }
  },

  // Get User Profile
  getProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/auth/profile/${userId}`);
      return response.data.user;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update User Profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/auth/profile/${userId}`, userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data.user;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('authToken') && !!localStorage.getItem('user');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  },
};

export default apiClient;
