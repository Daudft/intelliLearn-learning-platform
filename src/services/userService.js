import api from './api';

const userService = {
  // Get user profile
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (userId, profileData) => {
    const response = await api.patch(`/users/profile/${userId}`, profileData);
    return response.data;
  },

  // Get activity history
  getActivityHistory: async (userId, limit = 50, skip = 0, type = null) => {
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('skip', skip);
    if (type) params.append('type', type);

    const response = await api.get(`/users/activity-history/${userId}?${params}`);
    return response.data;
  },

  // Get activity summary
  getActivitySummary: async (userId) => {
    const response = await api.get(`/users/activity-summary/${userId}`);
    return response.data;
  },

  // Log activity
  logActivity: async (activityData) => {
    const response = await api.post('/users/log-activity', activityData);
    return response.data;
  },

  // Get user achievements/badges
  getUserAchievements: async (userId) => {
    const response = await api.get(`/users/achievements/${userId}`);
    return response.data;
  },

  // Unlock achievement/badge
  unlockAchievement: async (userId, badgeId) => {
    const response = await api.post('/users/unlock-achievement', {
      userId,
      badgeId,
    });
    return response.data;
  },

  // Update learning preferences
  updateLearningPreferences: async (userId, preferences) => {
    const response = await api.patch(`/users/learning-preferences/${userId}`, preferences);
    return response.data;
  },

  // Get learning statistics
  getLearningStats: async (userId) => {
    const response = await api.get(`/users/learning-stats/${userId}`);
    return response.data;
  },

  // Get real-time leaderboard (all students ranked by points)
  getLeaderboard: async () => {
    const response = await api.get('/users/leaderboard');
    return response.data;
  },
};

export default userService;
