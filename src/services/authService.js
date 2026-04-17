import api from './api';

const authService = {
  // Sign Up
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Sign In
  signin: async (credentials) => {
    const response = await api.post('/auth/signin', credentials);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // ✅ FORGOT PASSWORD
  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  // ✅ RESET PASSWORD
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // ✅ VERIFY EMAIL
  verifyEmail: async (data) => {
    const response = await api.post('/auth/verify-email', data);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // ✅ NEW - Check Assessment Status
  checkAssessmentStatus: async (userId) => {
    const response = await api.get(`/assessment/status/${userId}`);
    return response.data;
  },

  // ✅ NEW - Get User Result
  getUserResult: async (userId) => {
    const response = await api.get(`/assessment/result/${userId}`);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('user');
    return response.data;
  },
};

export default authService;