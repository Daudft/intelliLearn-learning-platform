import api from './api';

const learningPathService = {
  getLearningPath: async (userId) => {
    const response = await api.get(`/learning-path/${userId}`);
    return response.data;
  },

  // Wait for learning path to be created (with retries for AI generation)
  waitForLearningPath: async (userId, maxRetries = 20, delayMs = 1000) => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const response = await api.get(`/learning-path/${userId}`);
        if (response.data?.learningPath) {
          return response.data;
        }
      } catch {
        // Ignore errors during polling
      }
      
      attempts++;
      if (attempts < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delayMs + attempts * 100));
      }
    }
    
    // After all retries, return empty or null
    return { learningPath: null, message: 'Learning path not created yet. Please try again shortly.' };
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

  // Execute code via the backend (Piston) and return its output.
  runCode: async (payload) => {
    const response = await api.post('/learning-path/run-code', payload);
    return response.data;
  },

  // End-of-cycle quiz (unlocks after all tasks are completed)
  getQuiz: async (userId, language) => {
    const response = await api.get(`/learning-path/${userId}/${language}/quiz`);
    return response.data;
  },

  submitQuiz: async (payload) => {
    const response = await api.post('/learning-path/quiz/submit', payload);
    return response.data;
  },

  regenerateQuiz: async (userId, language) => {
    const response = await api.post('/learning-path/quiz/regenerate', { userId, language });
    return response.data;
  },

  advanceCycle: async (payload) => {
    const response = await api.post('/learning-path/advance-cycle', payload);
    return response.data;
  },
};

export default learningPathService;
