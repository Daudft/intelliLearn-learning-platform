import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { Loader, AlertCircle, ChevronRight, Calendar } from 'lucide-react';

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (userId) {
      fetchActivities();
      fetchSummary();
    }
  }, [userId, filter, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const type = filter === 'all' ? null : filter;
      const skip = (page - 1) * 50;
      const data = await userService.getActivityHistory(userId, 50, skip, type);
      setActivities(data.activities);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await userService.getActivitySummary(userId);
      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      task_completed: '✅',
      task_started: '🚀',
      assessment_taken: '📝',
      badge_earned: '🏆',
      milestone_unlocked: '🎯',
      login: '🔐',
      profile_updated: '👤',
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colors = {
      task_completed: 'bg-green-100 text-green-800 border-green-300',
      task_started: 'bg-blue-100 text-blue-800 border-blue-300',
      assessment_taken: 'bg-purple-100 text-purple-800 border-purple-300',
      badge_earned: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      milestone_unlocked: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      login: 'bg-gray-100 text-gray-800 border-gray-300',
      profile_updated: 'bg-pink-100 text-pink-800 border-pink-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Activity History</h1>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalActivities}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{summary.activitiesLast7Days}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{summary.completedTasks}</p>
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'task_completed', 'assessment_taken', 'badge_earned'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
              }`}
            >
              {f === 'all' ? 'All Activities' : f.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Activity timeline */}
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity._id}
                className={`border-l-4 rounded-lg p-4 bg-white shadow hover:shadow-md transition ${getActivityColor(activity.activityType)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <span className="text-2xl mr-4">{getActivityIcon(activity.activityType)}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{activity.title}</h3>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      )}
                      {activity.language && (
                        <p className="text-xs font-medium mt-2">
                          Language: <span className="font-bold">{activity.language.toUpperCase()}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                    {activity.score !== null && (
                      <p className="text-sm font-bold text-blue-600 mt-2">Score: {activity.score}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg">No activities found</p>
              <p className="text-gray-500 text-sm mt-2">Start completing tasks to see your activity history</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {(activities.length > 0 || hasMore) && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Previous
            </button>
            <p className="text-gray-600">Page {page}</p>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
