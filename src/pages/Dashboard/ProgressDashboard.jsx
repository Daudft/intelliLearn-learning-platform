import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { Loader, AlertCircle, BarChart3, TrendingUp, Award } from 'lucide-react';

export default function ProgressDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getLearningStats(userId);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your progress and achievements</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {stats && (
          <>
            {/* Main stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Tasks Completed</h3>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.stats.totalTasksCompleted}</p>
                <p className="text-sm text-gray-500 mt-2">unlocked {stats.stats.totalTasksUnlocked}</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Assessments Taken</h3>
                  <BarChart3 className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.stats.totalAssessmentsTaken}</p>
                <p className="text-sm text-gray-500 mt-2">avg score: {stats.stats.averageAssessmentScore}%</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Badges Earned</h3>
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.stats.totalBadgesEarned}</p>
                <p className="text-sm text-gray-500 mt-2">keep going!</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Total Points</h3>
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.stats.totalPoints}</p>
                <p className="text-sm text-gray-500 mt-2">streak: {stats.stats.streakDays} days</p>
              </div>
            </div>

            {/* Language stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Languages progress */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Language Progress</h2>
                <div className="space-y-6">
                  {Object.entries(stats.languageStats).map(([language, data]) => (
                    <div key={language}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 capitalize">{language}</h3>
                          <p className="text-sm text-gray-500">{data.proficiencyLevel}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {data.completed}/{data.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(data.completed / data.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent assessments */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Assessments</h2>
                <div className="space-y-4">
                  {stats.recentAssessments.length > 0 ? (
                    stats.recentAssessments.map((assessment, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-gray-900 capitalize">{assessment.language}</h3>
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                            assessment.percentage >= 70 
                              ? 'bg-green-100 text-green-800' 
                              : assessment.percentage >= 40
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {assessment.percentage}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {assessment.score}/{assessment.totalQuestions} questions correct
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(assessment.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No assessments taken yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Topic breakdown if available */}
            {stats.recentAssessments.length > 0 && stats.recentAssessments[0].topicBreakdown && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Latest Assessment Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.recentAssessments[0].topicBreakdown).map(([topic, data]) => (
                    <div key={topic} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3">{topic}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{data.correct}</p>
                          <p className="text-sm text-gray-600">of {data.total}</p>
                        </div>
                        <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center bg-blue-50">
                          <span className="text-lg font-bold text-blue-600">
                            {Math.round((data.correct / data.total) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
