import api from './api';

const assessmentService = {
  // Get available languages
  getLanguages: async () => {
    const response = await api.get('/assessment/languages');
    return response.data;
  },

  // Get test questions for selected language
  getQuestions: async (language) => {
    const response = await api.get(`/assessment/questions/${language}`);
    return response.data;
  },

  // Submit assessment answers
  submitAssessment: async (data) => {
    const response = await api.post('/assessment/submit', data);
    return response.data;
  },

  // Get user's assessment result
  getUserResult: async (userId) => {
    const response = await api.get(`/assessment/result/${userId}`);
    return response.data;
  },

  // Check if user completed assessment
  checkStatus: async (userId) => {
    const response = await api.get(`/assessment/status/${userId}`);
    return response.data;
  },

  // Get all user attempts
  getAllAttempts: async (userId) => {
    const response = await api.get(`/assessment/all-attempts/${userId}`);
    return response.data;
  },

  // ========== ADAPTIVE ASSESSMENT ==========
  // Start new adaptive assessment
  startAdaptiveAssessment: async (data) => {
    const response = await api.post('/assessment/adaptive/start', data);
    return response.data;
  },

  // Submit answer and get next question
  submitAdaptiveAnswer: async (data) => {
    const response = await api.post('/assessment/adaptive/submit-answer', data);
    return response.data;
  },
};

export default assessmentService;