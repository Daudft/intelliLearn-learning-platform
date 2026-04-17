import api from './api';

const learningPathService = {
  getLearningPath: async (userId) => {
    const response = await api.get(`/learning-path/${userId}`);
    return response.data;
  },

  initializeLearningPath: async (payload) => {
    const response = await api.post('/learning-path/initialize', payload);
    return response.data;
  },

  addLanguagePath: async (payload) => {
    const response = await api.post('/learning-path/add-language', payload);
    return response.data;
  },

  completeTask: async (payload) => {
    const response = await api.patch('/learning-path/complete-task', payload);
    return response.data;
  },

  saveTaskDraft: async (payload) => {
    const response = await api.patch('/learning-path/save-draft', payload);
    return response.data;
  },

  submitTaskSolution: async (payload) => {
    const response = await api.post('/learning-path/submit-solution', payload);
    return response.data;
  },

  getTaskExplanation: async (userId, language, taskId) => {
    const response = await api.get(`/learning-path/${userId}/${language}/${taskId}/explanation`);
    return response.data;
  },

  getTaskCodeFeedback: async (payload) => {
    const response = await api.post('/learning-path/ai-feedback', payload);
    return response.data;
  },
};

export default learningPathService;
