import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import authService from '../../services/authService';
import { Loader, AlertCircle, Users, FileText, Activity, LogOut } from 'lucide-react';

export default function AdminConsole() {
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
      localStorage.removeItem('user');
    } finally {
      navigate('/signin', { replace: true });
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F1F2F4] flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full border border-[#e7e9ef]">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You do not have admin permissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F2F4] p-3 md:p-5">
      <div className="mx-auto max-w-[1440px] rounded-[28px] border border-[#e8eaef] bg-[#f7f8fb] shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden p-6 md:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">Admin Console</h1>
          <button
            onClick={handleLogout}
            className="h-11 px-4 rounded-xl border border-[#e6e8ee] bg-white text-gray-700 font-semibold hover:bg-[#f6f9ee] hover:text-gray-900 transition-all inline-flex items-center gap-2 w-fit"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#eceff4] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#eef9df] border border-[#e0f3bf] text-gray-900'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }`}
          >
            <Activity className="w-5 h-5 inline mr-2" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#eef9df] border border-[#e0f3bf] text-gray-900'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" /> Users
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-[#eef9df] border border-[#e0f3bf] text-gray-900'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" /> Content
          </button>
        </div>

        {loading && activeTab !== 'dashboard' ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-[#5acd00]" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div>
                {/* Overview stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-3xl p-6 border border-[#e7e9ef] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-gray-500 text-sm mb-2">Total Users</p>
                    <p className="text-3xl font-black text-gray-900">{stats.overview.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.overview.totalStudents} students, {stats.overview.totalAdmins} admins
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#e7e9ef] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-gray-500 text-sm mb-2">Activities (Last 7 Days)</p>
                    <p className="text-3xl font-black text-gray-900">{stats.overview.activitiesLast7Days}</p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#e7e9ef] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-gray-500 text-sm mb-2">Assessment Avg Score</p>
                    <p className="text-3xl font-black text-gray-900">{stats.assessmentStats.averageScore.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-2">{stats.assessmentStats.totalAssessmentsTaken} total</p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#e7e9ef] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-gray-500 text-sm mb-2">System Status</p>
                    <p className="text-3xl font-black text-[#5acd00]">Healthy</p>
                    {systemHealth && (
                      <p className="text-xs text-gray-500 mt-2">Database: {systemHealth.database}</p>
                    )}
                  </div>
                </div>

                {/* Language stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-6 border border-[#e7e9ef] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h3 className="text-xl font-black tracking-tight text-gray-900 mb-4">Language Performance</h3>
                    <div className="space-y-4">
                      {stats.languageStats.map((lang) => (
                        <div key={lang._id}>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-700 capitalize font-semibold">{lang._id}</span>
                            <span className="text-gray-500 text-sm">{lang.avgScore.toFixed(1)}% avg</span>
                          </div>
                          <div className="bg-[#ecf0f6] rounded-full h-2">
                            <div
                              className="bg-linear-to-r from-[#E6FF03] to-[#c8e003] h-2 rounded-full"
                              style={{ width: `${lang.avgScore}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{lang.count} assessments</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#e7e9ef] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h3 className="text-xl font-black tracking-tight text-gray-900 mb-4">Proficiency Distribution</h3>
                    <div className="space-y-4">
                      {stats.proficiencyDistribution.map((prof) => (
                        <div key={prof._id} className="flex items-center justify-between">
                          <span className="text-gray-700 capitalize font-semibold">{prof._id || 'Not Set'}</span>
                          <div className="flex items-center gap-2">
                            <div className="bg-[#ecf0f6] rounded-full h-2 w-32">
                              <div
                                className="bg-[#5acd00] h-2 rounded-full"
                                style={{
                                  width: `${(prof.count / stats.overview.totalUsers) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-gray-500 text-sm">{prof.count}</span>
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
                    className="flex-1 h-11 rounded-xl border border-[#e6e8ee] bg-[#fbfcff] px-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#d7ee00]"
                  />
                </div>

                <div className="bg-white border border-[#e7e9ef] rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#eceff4] bg-[#f8f9fc]">
                      <tr>
                        <th className="px-6 py-3 text-gray-700 font-semibold">Name</th>
                        <th className="px-6 py-3 text-gray-700 font-semibold">Email</th>
                        <th className="px-6 py-3 text-gray-700 font-semibold">Role</th>
                        <th className="px-6 py-3 text-gray-700 font-semibold">Level</th>
                        <th className="px-6 py-3 text-gray-700 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-[#f0f2f7] hover:bg-[#f6f9ee]">
                          <td className="px-6 py-4 text-gray-900 font-semibold">{user.name}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                              className="px-3 py-1.5 bg-[#f8f9fc] text-gray-900 rounded-lg border border-[#e2e6ef] text-sm"
                            >
                              <option value="student">Student</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-gray-600 capitalize">
                            {user.proficiencyLevel || 'Not set'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-semibold"
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
                <h3 className="text-xl font-black tracking-tight text-gray-900 mb-4">Assessment Questions ({questions.length})</h3>
                <div className="space-y-4">
                  {questions.slice(0, 10).map((q) => (
                    <div key={q._id} className="bg-white border border-[#e7e9ef] rounded-2xl p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-gray-900 font-semibold">{q.question.substring(0, 100)}...</h4>
                        <div className="flex gap-2">
                          <span className="text-xs bg-[#eef9df] text-gray-900 px-2 py-1 rounded capitalize border border-[#e0f3bf]">
                            {q.language}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            q.difficulty === 'easy' ? 'bg-[#e9f8d8] text-[#2f6f00] border border-[#cdeeb0]' :
                            q.difficulty === 'medium' ? 'bg-[#fff7dc] text-[#8a6400] border border-[#f3e1a3]' :
                            'bg-[#ffe7e7] text-[#9b1c1c] border border-[#f3b8b8]'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">Topic: {q.topic}</p>
                      <p className="text-gray-600 text-sm">Type: {q.questionType}</p>
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
