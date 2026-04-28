import api from './api';

const questionService = {
  /**
   * Generate MCQ questions for a topic/difficulty
   */
  generateQuestions: async (language, topic, difficulty, level, count = 3) => {
    const response = await api.post('/questions/generate', {
      language,
      topic,
      difficulty,
      level,
      count,
    });
    return response.data;
  },

  /**
   * Save a learning question
   */
  saveQuestion: async (userId, language, topicId, topic, difficulty, proficiencyLevel, question, options, correctAnswer, explanation) => {
    const response = await api.post('/questions/save', {
      userId,
      language,
      topicId,
      topic,
      difficulty,
      proficiencyLevel,
      question,
      options,
      correctAnswer,
      explanation,
    });
    return response.data;
  },

  /**
   * Submit an answer to a question
   */
  submitAnswer: async (userId, questionId, userAnswer, timeSpent = 0, skip = false) => {
    const response = await api.post('/questions/submit-answer', {
      userId,
      questionId,
      userAnswer,
      timeSpent,
      skip,
    });
    return response.data;
  },

  /**
   * Get all questions for a topic/difficulty
   */
  getQuestions: async (userId, language, topic, difficulty) => {
    const response = await api.get(`/questions/${userId}/${language}/${topic}/${difficulty}`);
    return response.data;
  },

  /**
   * Get progress for a user in a language
   */
  getProgress: async (userId, language) => {
    const response = await api.get(`/questions/progress/${userId}/${language}`);
    return response.data;
  },
};

export default questionService;
