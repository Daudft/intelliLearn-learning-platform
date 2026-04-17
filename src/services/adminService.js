import api from './api';

const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // User management
  getAllUsers: async (page = 1, limit = 20, role = null, searchTerm = null) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (role) params.append('role', role);
    if (searchTerm) params.append('searchTerm', searchTerm);

    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  // Get single user details
  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Content management - get all questions
  getAllQuestions: async (language = null, difficulty = null, topic = null) => {
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    if (difficulty) params.append('difficulty', difficulty);
    if (topic) params.append('topic', topic);

    const response = await api.get(`/admin/questions?${params}`);
    return response.data;
  },

  // Add question
  addQuestion: async (questionData) => {
    const response = await api.post('/admin/questions', questionData);
    return response.data;
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    const response = await api.patch(`/admin/questions/${questionId}`, questionData);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  },

  // System monitoring
  getSystemHealth: async () => {
    const response = await api.get('/admin/system-health');
    return response.data;
  },

  // Get custom reports
  getCustomReport: async (reportType, startDate = null, endDate = null, language = null) => {
    const params = new URLSearchParams();
    params.append('reportType', reportType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (language) params.append('language', language);

    const response = await api.get(`/admin/reports?${params}`);
    return response.data;
  },
};

export default adminService;
