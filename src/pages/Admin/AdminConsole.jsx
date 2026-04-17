import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { Loader, AlertCircle, Users, Settings, FileText, Activity } from 'lucide-react';

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const userRole = JSON.parse(localStorage.getItem('user'))?.role;

  useEffect(() => {
    if (userRole !== 'admin') {
      setError('You do not have admin access');
      return;
    }

    if (activeTab === 'dashboard') {
      fetchDashboardStats();
      fetchSystemHealth();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'content') {
      fetchQuestions();
    }
  }, [activeTab, userPage, searchTerm]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const data = await adminService.getSystemHealth();
      setSystemHealth(data);
    } catch (err) {
      console.error('Error fetching system health:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllUsers(userPage, 20, null, searchTerm || null);
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllQuestions();
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        await fetchUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You do not have admin permissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Console</h1>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium transition border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Activity className="w-5 h-5 inline mr-2" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition border-b-2 ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" /> Users
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium transition border-b-2 ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" /> Content
          </button>
        </div>

        {loading && activeTab !== 'dashboard' ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div>
                {/* Overview stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.overview.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.overview.totalStudents} students, {stats.overview.totalAdmins} admins
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">Activities (Last 7 Days)</p>
                    <p className="text-3xl font-bold text-white">{stats.overview.activitiesLast7Days}</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">Assessment Avg Score</p>
                    <p className="text-3xl font-bold text-white">{stats.assessmentStats.averageScore.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-2">{stats.assessmentStats.totalAssessmentsTaken} total</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">System Status</p>
                    <p className="text-3xl font-bold text-green-400">Healthy</p>
                    {systemHealth && (
                      <p className="text-xs text-gray-500 mt-2">Database: {systemHealth.database}</p>
                    )}
                  </div>
                </div>

                {/* Language stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Language Performance</h3>
                    <div className="space-y-4">
                      {stats.languageStats.map((lang) => (
                        <div key={lang._id}>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-300 capitalize font-medium">{lang._id}</span>
                            <span className="text-gray-400 text-sm">{lang.avgScore.toFixed(1)}% avg</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${lang.avgScore}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{lang.count} assessments</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Proficiency Distribution</h3>
                    <div className="space-y-4">
                      {stats.proficiencyDistribution.map((prof) => (
                        <div key={prof._id} className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize font-medium">{prof._id || 'Not Set'}</span>
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-700 rounded-full h-2 w-32">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${(prof.count / stats.overview.totalUsers) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-gray-400 text-sm">{prof.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setUserPage(1);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-700 bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-gray-300 font-medium">Name</th>
                        <th className="px-6 py-3 text-gray-300 font-medium">Email</th>
                        <th className="px-6 py-3 text-gray-300 font-medium">Role</th>
                        <th className="px-6 py-3 text-gray-300 font-medium">Level</th>
                        <th className="px-6 py-3 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="px-6 py-4 text-white">{user.name}</td>
                          <td className="px-6 py-4 text-gray-400">{user.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                              className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                            >
                              <option value="student">Student</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-gray-400 capitalize">
                            {user.proficiencyLevel || 'Not set'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-400 hover:text-red-300 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Assessment Questions ({questions.length})</h3>
                <div className="space-y-4">
                  {questions.slice(0, 10).map((q) => (
                    <div key={q._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{q.question.substring(0, 100)}...</h4>
                        <div className="flex gap-2">
                          <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded capitalize">
                            {q.language}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            q.difficulty === 'easy' ? 'bg-green-900 text-green-200' :
                            q.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-red-900 text-red-200'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">Topic: {q.topic}</p>
                      <p className="text-gray-400 text-sm">Type: {q.questionType}</p>
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
