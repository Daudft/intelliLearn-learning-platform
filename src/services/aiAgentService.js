import api from './api';

const aiAgentService = {
  /**
   * Get AI explanation for a question
   * Provides detailed explanations, breakdowns, hints, and feedback
   */
  getAIExplanation: async (payload) => {
    try {
      const response = await api.post('/learning-path/ai-agent', payload);
      return response.data;
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      throw error;
    }
  },

  /**
   * Get AI explanation with specific action type
   * Actions: explain, breakdown, hints, feedback
   */
  getAIExplanationByAction: async (payload) => {
    try {
      const response = await api.post('/learning-path/ai-agent', {
        ...payload,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      throw error;
    }
  },
};

export default aiAgentService;
