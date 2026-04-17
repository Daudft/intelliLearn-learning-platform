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
};

export default assessmentService;