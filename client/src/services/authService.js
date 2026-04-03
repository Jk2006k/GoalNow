import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests and log payload
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Debug proctoring requests
    if (config.url?.includes('proctoring') || config.url?.includes('evaluation')) {
      console.log(`📤 API Request:`, config.url, 'Token present:', !!token, 'First 20 chars:', token?.substring(0, 20) + '...');
    }
  } else {
    console.warn('⚠️ WARNING: No auth token found in localStorage for request to:', config.url);
  }
  
  // Log request details for debugging
  if (config.url?.includes('email-signup')) {
    console.log('=== AXIOS REQUEST INTERCEPTOR ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Headers:', config.headers);
    if (config.data) {
      const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      console.log('Request body profileImage exists:', !!data.profileImage);
      console.log('Request body profileImage length:', data.profileImage?.length || 0);
      console.log('Request body profileImage sample:', data.profileImage?.substring(0, 50) || 'null');
    }
  }
  
  return config;
});

export const authService = {
  // Google Sign-Up
  googleSignup: async (userData) => {
    try {
      console.log('=== GOOGLE SIGNUP ===');
      console.log('- firstName:', userData.firstName);
      console.log('- email:', userData.email);
      console.log('- profileImage provided:', !!userData.profileImage);
      console.log('- profileImage sample:', userData.profileImage?.substring(0, 50) || 'null');
      
      const response = await apiClient.post('/auth/google-signup', userData);
      
      console.log('Google signup response:');
      console.log('- profileImage saved:', !!response.data.user.profileImage);
      console.log('- profileImage sample:', response.data.user.profileImage?.substring(0, 50) || 'null');
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isLoggedIn', 'true');
        console.log('Saved to localStorage with profileImage:', !!response.data.user.profileImage);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Sign-up failed' };
    }
  },

  // Email Sign-Up
  emailSignup: async (userData) => {
    try {
      console.log('Email signup - data being sent:');
      console.log('- firstName:', userData.firstName);
      console.log('- email:', userData.email);
      console.log('- profileImage provided:', !!userData.profileImage);
      console.log('- profileImage length:', userData.profileImage?.length || 0);
      console.log('- profileImage is base64:', userData.profileImage?.startsWith('data:image') );
      console.log('- profileImage starts with:', userData.profileImage?.substring(0, 50) || 'N/A');
      
      const payload = JSON.stringify(userData);
      console.log('Payload size being sent:', payload.length, 'bytes');
      
      const response = await apiClient.post('/auth/email-signup', userData);
      
      console.log('=== EMAIL SIGNUP RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response success:', response.data.success);
      console.log('Response user._id:', response.data.user._id);
      console.log('Response profileImage exists:', !!response.data.user.profileImage);
      console.log('Response profileImage length:', response.data.user.profileImage?.length || 0);
      console.log('Response profileImage sample:', response.data.user.profileImage?.substring(0, 50) || 'null');
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        console.log('Saving to localStorage...');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Saved user to localStorage with profileImage:', !!response.data.user.profileImage);
        localStorage.setItem('isLoggedIn', 'true');
      }
      return response.data;
    } catch (error) {
      console.error('Email signup error:', error);
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
