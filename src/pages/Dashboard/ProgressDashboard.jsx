import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { 
  Loader, 
  AlertCircle, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target,
  Clock,
  Brain,
  ChevronRight,
  Star,
  Flame,
  BookOpen,
  Code,
  Trophy,
  Calendar,
  Activity,
  Zap
} from 'lucide-react';

export default function ProgressDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

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

  // Calculate overall progress percentage
  const calculateOverallProgress = () => {
    if (!stats?.languageStats) return 0;
    const languages = Object.values(stats.languageStats);
    if (languages.length === 0) return 0;
    const totalProgress = languages.reduce((sum, lang) => 
      sum + (lang.completed / lang.total) * 100, 0
    );
    return Math.round(totalProgress / languages.length);
  };

  // Get performance level based on assessment scores
  const getPerformanceLevel = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Learning Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track your coding journey and achievements</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={fetchStats}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {stats && (
          <>
            {/* Hero Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">All Time</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.stats.totalTasksCompleted}</p>
                <p className="text-sm text-gray-600 mt-2">Tasks Completed</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    📚 {stats.stats.totalTasksUnlocked} tasks unlocked
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Average</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.stats.totalAssessmentsTaken}</p>
                <p className="text-sm text-gray-600 mt-2">Assessments Taken</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    📊 Avg Score: {stats.stats.averageAssessmentScore}%
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Achievements</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.stats.totalBadgesEarned}</p>
                <p className="text-sm text-gray-600 mt-2">Badges Earned</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    🎯 Keep collecting more!
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span className="text-xs font-medium text-white">{stats.stats.streakDays} day streak</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.stats.totalPoints}</p>
                <p className="text-sm text-purple-100 mt-2">Total Points</p>
                <div className="mt-3 pt-3 border-t border-purple-400">
                  <p className="text-xs text-purple-100">
                    ⚡ Next level: {1000 - (stats.stats.totalPoints % 1000)} points needed
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
                  <p className="text-sm text-gray-600">Your learning journey across all languages</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-600">{calculateOverallProgress()}%</span>
                  <p className="text-xs text-gray-500">Completion Rate</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-500 relative"
                  style={{ width: `${calculateOverallProgress()}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.stats.totalTasksCompleted}</div>
                  <div className="text-xs text-gray-500">Tasks Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.stats.totalAssessmentsTaken}</div>
                  <div className="text-xs text-gray-500">Assessments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.stats.totalBadgesEarned}</div>
                  <div className="text-xs text-gray-500">Badges</div>
                </div>
              </div>
            </div>

            {/* Language Progress and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Languages Progress */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Language Progress</h2>
                  <Code className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-6">
                  {Object.entries(stats.languageStats).map(([language, data]) => {
                    const progressPercentage = (data.completed / data.total) * 100;
                    const proficiencyColors = {
                      'beginner': 'text-green-600 bg-green-100',
                      'intermediate': 'text-blue-600 bg-blue-100',
                      'advanced': 'text-purple-600 bg-purple-100'
                    };
                    return (
                      <div key={language} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 capitalize">{language}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${proficiencyColors[data.proficiencyLevel] || 'text-gray-600 bg-gray-100'}`}>
                              {data.proficiencyLevel}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {data.completed}/{data.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 group-hover:opacity-80"
                            style={{ width: `${progressPercentage}%` }}
                          >
                            <div className="h-full w-full bg-white opacity-20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                          <span>⭐ {Math.floor(data.completed * 50)} points</span>
                          <span>📚 {data.total - data.completed} remaining</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {Object.keys(stats.languageStats).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No language progress yet. Start learning!</p>
                )}
              </div>

              {/* Recent Activity Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {stats.recentAssessments.length > 0 ? (
                    <>
                      {stats.recentAssessments.slice(0, 3).map((assessment, idx) => {
                        const performance = getPerformanceLevel(assessment.percentage);
                        return (
                          <div key={idx} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900 capitalize">{assessment.language}</h3>
                                  <span className={`text-xs px-2 py-1 rounded-full ${performance.bg} ${performance.color}`}>
                                    {performance.label}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(assessment.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-bold text-gray-900">{assessment.percentage}%</span>
                                <p className="text-xs text-gray-500">{assessment.score}/{assessment.totalQuestions} correct</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  assessment.percentage >= 70 ? 'bg-green-500' :
                                  assessment.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${assessment.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {stats.recentAssessments.length > 3 && (
                        <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2">
                          View all {stats.recentAssessments.length} assessments →
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No assessments taken yet</p>
                      <p className="text-xs text-gray-400 mt-1">Complete your first assessment to see progress!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Topic Mastery Breakdown */}
            {stats.recentAssessments.length > 0 && stats.recentAssessments[0].topicBreakdown && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Topic Mastery</h2>
                    <p className="text-sm text-gray-600">Latest assessment breakdown</p>
                  </div>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.recentAssessments[0].topicBreakdown).map(([topic, data]) => {
                    const percentage = Math.round((data.correct / data.total) * 100);
                    const masteryLevel = percentage >= 80 ? 'Mastered' : percentage >= 60 ? 'Proficient' : 'Needs Practice';
                    const masteryColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-blue-600' : 'text-orange-600';
                    const bgColor = percentage >= 80 ? 'bg-green-50' : percentage >= 60 ? 'bg-blue-50' : 'bg-orange-50';
                    
                    return (
                      <div key={topic} className={`border border-gray-100 rounded-lg p-4 ${bgColor} hover:shadow-md transition-all`}>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900">{topic}</h3>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${masteryColor}`}>{percentage}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-gray-600">
                              <span className="font-semibold">{data.correct}</span> of {data.total} correct
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{masteryLevel}</p>
                          </div>
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-gray-200"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className={`${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-blue-500' : 'text-orange-500'}`}
                                strokeDasharray={`${(percentage / 100) * 175.9} 175.9`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold">{percentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            {stats.recentAssessments.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Personalized Recommendations</h3>
                    <p className="text-gray-700 mb-3">
                      Based on your performance, focus on these topics to level up:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.recentAssessments[0].topicBreakdown || {})
                        .filter(([_, data]) => (data.correct / data.total) * 100 < 60)
                        .slice(0, 3)
                        .map(([topic, _]) => (
                          <span key={topic} className="px-3 py-1 bg-white rounded-full text-sm text-purple-600 font-medium shadow-sm">
                            {topic}
                          </span>
                        ))}
                      {Object.entries(stats.recentAssessments[0].topicBreakdown || {}).filter(([_, data]) => (data.correct / data.total) * 100 < 60).length === 0 && (
                        <span className="text-gray-600">Great job! You're mastering all topics! 🎉</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Footer */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.stats.totalTasksUnlocked}</p>
                <p className="text-xs text-gray-500">Tasks Unlocked</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.stats.streakDays}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Trophy className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.stats.totalBadgesEarned}</p>
                <p className="text-xs text-gray-500">Badges Earned</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Brain className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.stats.averageAssessmentScore}%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}