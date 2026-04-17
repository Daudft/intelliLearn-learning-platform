import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { Loader, AlertCircle, Trophy, Zap, BookOpen } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    learningStyle: '',
    dailyLearningGoal: 30,
  });

  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserProfile(userId);
      setUser(data.user);
      setProfile(data.profile);
      setAchievements(data.achievements);
      setStats(data.stats);
      setFormData({
        name: data.user.name,
        learningStyle: data.user.learningStyle || '',
        dailyLearningGoal: data.profile?.dailyLearningGoal || 30,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateUserProfile(userId, {
        name: formData.name,
        learningStyle: formData.learningStyle,
        dailyLearningGoal: formData.dailyLearningGoal,
      });
      setIsEditing(false);
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Header with user info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2 flex items-center gap-4">
                {user?.proficiencyLevel && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {user.proficiencyLevel}
                  </span>
                )}
                {user?.assessmentLanguage && (
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    {user.assessmentLanguage.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Edit form */}
          {isEditing && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Style</label>
                <select
                  value={formData.learningStyle}
                  onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select learning style</option>
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="reading-writing">Reading/Writing</option>
                  <option value="kinesthetic">Kinesthetic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Learning Goal (minutes)</label>
                <input
                  type="number"
                  value={formData.dailyLearningGoal}
                  onChange={(e) => setFormData({ ...formData, dailyLearningGoal: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Badges</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBadges}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Recent Assessment</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentAssessmentScore || 'N/A'}%</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Streak Days</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.streakDays || 0}</p>
                </div>
                <Zap className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h2>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((badge) => (
                <div key={badge._id} className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
                  <div className="text-4xl mb-2">{badge.badgeIcon}</div>
                  <h3 className="font-bold text-gray-900">{badge.badgeName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-yellow-700">+{badge.points} points</span>
                    <span className="text-gray-500">{new Date(badge.unlockedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No achievements yet. Start completing tasks!</p>
          )}
        </div>

        {/* Learning Path */}
        {stats?.learningPath && stats.learningPath.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Paths</h2>
            <div className="space-y-4">
              {stats.learningPath.map((path, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-gray-900 capitalize">{path.language}</h3>
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {path.proficiencyLevel}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(path.tasks?.filter((t) => t.status === 'completed').length / path.tasks?.length) * 100 || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {path.tasks?.filter((t) => t.status === 'completed').length || 0} / {path.tasks?.length || 0} tasks completed
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
