import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ChartNoAxesColumn,
  ClipboardList,
  Compass,
  Flame,
  Layers,
  LogOut,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import assessmentService from "../../services/assessmentService";
import authService from "../../services/authService";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "IL";
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "IL";
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const [status, setStatus] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const bootstrap = async () => {
      const currentUser = getStoredUser();
      if (!currentUser) {
        navigate("/signin", { replace: true });
        return;
      }

      setUser(currentUser);
      const userId = currentUser.id || currentUser._id;

      if (!userId) {
        navigate("/signin", { replace: true });
        return;
      }

      try {
        const [statusData, resultData, attemptsData] = await Promise.all([
          assessmentService.checkStatus(userId),
          assessmentService.getUserResult(userId),
          assessmentService.getAllAttempts(userId),
        ]);

        setStatus(statusData || null);
        setLatestResult(resultData?.result || null);
        setAttempts(Array.isArray(attemptsData?.attempts) ? attemptsData.attempts : []);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          "Could not load dashboard right now. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [navigate]);

  const displayAttempts = useMemo(() => attempts.slice(0, 6), [attempts]);

  const stats = useMemo(() => {
    const source = attempts.length ? attempts : latestResult ? [latestResult] : [];

    const bestPercentage = source.reduce((max, item) => {
      const p = Number(item?.percentage || 0);
      return p > max ? p : max;
    }, 0);

    const averagePercentage =
      source.length > 0
        ? Math.round(
            source.reduce((sum, item) => sum + Number(item?.percentage || 0), 0) /
              source.length
          )
        : 0;

    const latest = attempts[0] || latestResult;

    return {
      totalAttempts: attempts.length,
      latestScore: latest?.score ?? 0,
      latestTotal: latest?.totalQuestions ?? 0,
      latestPercentage: Math.round(Number(latest?.percentage || 0)),
      bestPercentage: Math.round(bestPercentage),
      averagePercentage,
      latestLanguage:
        (latest?.language || status?.assessmentLanguage || "-").toString().toUpperCase(),
      proficiency:
        latest?.proficiencyLevel || status?.proficiencyLevel || "Not Available",
    };
  }, [attempts, latestResult, status]);

  const topicRows = useMemo(() => {
    const latest = attempts[0] || latestResult;
    const topicBreakdown = latest?.topicBreakdown;

    if (!topicBreakdown || typeof topicBreakdown !== "object") return [];

    return Object.entries(topicBreakdown)
      .map(([topic, values]) => {
        const total = Number(values?.total || 0);
        const correct = Number(values?.correct || 0);
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        return {
          topic,
          correct,
          total,
          percentage,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [attempts, latestResult]);

  const activityCells = useMemo(() => {
    const total = 84;
    const values = attempts.map((item) => Number(item?.percentage || 0));

    return Array.from({ length: total }, (_, index) => {
      const value = values.length ? values[index % values.length] : 0;
      if (value >= 80) return "bg-[#6be800]";
      if (value >= 60) return "bg-[#a7f35c]";
      if (value >= 40) return "bg-[#d4f9a8]";
      if (value > 0) return "bg-[#ecf8dc]";
      return "bg-[#eef1e9]";
    });
  }, [attempts]);

  const currentStreak = useMemo(() => {
    if (!attempts.length) return 0;

    const uniqueDays = new Set(
      attempts
        .map((item) => {
          if (!item?.completedAt) return null;
          const date = new Date(item.completedAt);
          if (Number.isNaN(date.getTime())) return null;
          return date.toDateString();
        })
        .filter(Boolean)
    );

    let streak = 0;
    const cursor = new Date();

    while (uniqueDays.has(cursor.toDateString())) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [attempts]);

  const weakTopics = useMemo(() => topicRows.slice().sort((a, b) => a.percentage - b.percentage).slice(0, 3), [topicRows]);

  const recentTasks = useMemo(() => {
    if (!weakTopics.length) {
      return [
        { label: "Take your first assessment", due: "Start now", priority: "High" },
        { label: "Explore course modules", due: "Today", priority: "Medium" },
      ];
    }

    return weakTopics.map((topic, index) => ({
      label: `${topic.topic} practice set`,
      due: index === 0 ? "Today" : index === 1 ? "Tomorrow" : "This week",
      priority: topic.percentage < 40 ? "High" : "Medium",
    }));
  }, [weakTopics]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // proceed with local cleanup fallback
    } finally {
      localStorage.removeItem("user");
      navigate("/signin");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F2F4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block" aria-hidden>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#E6FF03] absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F2F4] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/assessment")}
              className="w-full py-3 rounded-xl border-2 border-gray-300 font-semibold hover:bg-gray-50"
            >
              Take Assessment
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-linear-to-r from-[#E6FF03] to-[#d7ee00] font-semibold text-gray-900"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F2F4] p-3 md:p-5">
      <div className="mx-auto max-w-[1440px] rounded-[28px] border border-[#e8eaef] bg-[#f7f8fb] shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="grid lg:grid-cols-[240px_1fr] min-h-[calc(100vh-2.5rem)]">
          <aside className="border-r border-[#e7e9ef] bg-[#f6f7fa] px-4 py-6 hidden lg:flex lg:flex-col">
            <div className="px-3 mb-8">
              <h2 className="text-[22px] font-black tracking-tight text-gray-900">IntelliLearn</h2>
              <p className="text-[11px] font-semibold tracking-[0.24em] text-gray-500 uppercase mt-1">
                Learning Hub
              </p>
            </div>

            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#eef9df] border border-[#e0f3bf] text-gray-900 font-semibold">
                <BarChart3 size={18} className="text-[#5acd00]" />
                Dashboard
              </button>
              <button
                onClick={() => navigate("/courses")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
              >
                <BookOpen size={18} />
                Courses
              </button>
              <button
                onClick={() => navigate("/assessment")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
              >
                <ClipboardList size={18} />
                Assessments
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-white hover:text-gray-900 transition-all">
                <ChartNoAxesColumn size={18} />
                Progress
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-white hover:text-gray-900 transition-all">
                <Trophy size={18} />
                Achievements
              </button>
            </nav>

            <div className="mt-auto space-y-2 px-1">
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-white hover:text-gray-900 transition-all">
                <Compass size={18} />
                Support
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-white hover:text-gray-900 transition-all"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>

          <main className="bg-[#f8f9fc]">
            <header className="h-auto lg:h-20 border-b border-[#e7e9ef] bg-white/80 backdrop-blur px-4 md:px-7 py-4 lg:py-0 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative w-full lg:max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search modules, topics, attempts..."
                  className="w-full h-11 rounded-xl border border-[#e6e8ee] bg-[#fbfcff] pl-11 pr-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#d7ee00]"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-11 min-w-[150px] rounded-xl bg-[#f6f7fb] border border-[#e6e8ee] px-4 flex items-center gap-2">
                  <Flame size={16} className="text-[#5acd00]" />
                  <span className="text-sm text-gray-600">Streak</span>
                  <span className="text-sm font-bold text-gray-900 ml-auto">{currentStreak} days</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="h-11 px-4 rounded-xl bg-linear-to-r from-[#E6FF03] to-[#d7ee00] text-gray-900 font-semibold hover:from-[#d7ee00] hover:to-[#c8e003] transition-all"
                >
                  Sign Out
                </button>
              </div>
            </header>

            <div className="p-4 md:p-7 space-y-5">
              <section className="bg-white rounded-3xl border border-[#e7e9ef] shadow-[0_8px_30px_rgba(15,23,42,0.05)] p-5 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#ebf7dd] border border-[#d7efbb] flex items-center justify-center text-gray-900 font-black">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
                      Welcome Back, <span className="text-[#5acd00]">{user?.name || "Learner"}</span>
                    </h1>
                    <p className="text-gray-600 mt-1">
                      You are currently at <span className="font-semibold text-gray-900">{stats.proficiency}</span> level in {stats.latestLanguage}.
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid xl:grid-cols-[2fr_1fr] gap-5">
                <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 md:p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Learning Activity</h2>
                      <p className="text-sm text-gray-500">Intensity from your recent attempts</p>
                    </div>
                    <div className="text-xs font-semibold tracking-wider text-gray-500">
                      LESS <span className="mx-1">•</span> MORE
                    </div>
                  </div>

                  <div className="grid grid-cols-14 gap-1.5 mb-6">
                    {activityCells.map((cell, index) => (
                      <div key={index} className={`h-3 rounded-sm ${cell}`} />
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-[#e8ebf0] bg-[#fbfcff] px-4 py-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">Total Attempts</p>
                      <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalAttempts}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e8ebf0] bg-[#fbfcff] px-4 py-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">Best Score</p>
                      <p className="text-3xl font-black text-gray-900 mt-1">{stats.bestPercentage}%</p>
                    </div>
                    <div className="rounded-2xl border border-[#e8ebf0] bg-[#fbfcff] px-4 py-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">Average Score</p>
                      <p className="text-3xl font-black text-gray-900 mt-1">{stats.averagePercentage}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h3 className="text-sm font-bold tracking-[0.14em] text-[#5acd00] uppercase mb-4">Upcoming Tasks</h3>
                    <div className="space-y-3">
                      {recentTasks.map((task, index) => (
                        <div key={task.label + index} className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                          <p className="font-semibold text-gray-900 text-sm">{task.label}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.due} • {task.priority} priority
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h3 className="text-sm font-bold tracking-[0.14em] text-gray-500 uppercase mb-4">Recommended</h3>
                    <div className="rounded-2xl border border-[#e1f4c1] bg-[#f5fce9] p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#5bcb00] bg-white rounded-full px-2.5 py-1 border border-[#d9efb9]">
                        <Sparkles size={12} />
                        New Module
                      </span>
                      <p className="mt-3 font-bold text-gray-900">Master {weakTopics[0]?.topic || "Core Programming"}</p>
                      <p className="text-xs text-gray-600 mt-1">Based on your latest assessment performance.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid xl:grid-cols-3 gap-5">
                <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-gray-900">Recent Attempts</h3>
                    <button
                      onClick={() => navigate("/assessment")}
                      className="text-xs font-semibold text-[#5acd00] hover:text-[#4bb000]"
                    >
                      New Attempt
                    </button>
                  </div>

                  <div className="space-y-3">
                    {displayAttempts.length === 0 ? (
                      <p className="text-sm text-gray-500">No attempts yet.</p>
                    ) : (
                      displayAttempts.slice(0, 3).map((attempt) => (
                        <div key={attempt._id} className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 uppercase">{attempt.language}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(attempt.completedAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{attempt.score}/{attempt.totalQuestions}</p>
                            <p className="text-xs text-[#5acd00] font-semibold">{attempt.percentage}%</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <h3 className="text-xl font-black text-gray-900 mb-4">Quiz Performance</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 rounded-full bg-[#f2f5ee] grid place-items-center border border-[#e6ebdc]">
                      <div
                        className="absolute inset-1 rounded-full"
                        style={{
                          background: `conic-gradient(#5acd00 ${stats.latestPercentage * 3.6}deg, #e9efdd 0deg)`,
                        }}
                      />
                      <div className="relative h-16 w-16 rounded-full bg-white grid place-items-center border border-[#e6ebdc]">
                        <span className="font-black text-gray-900">{stats.latestPercentage}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Latest Grade</p>
                      <p className="text-lg font-black text-gray-900">{stats.proficiency}</p>
                      <p className="text-sm text-[#5acd00] font-semibold mt-1">Average: {stats.averagePercentage}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <h3 className="text-xl font-black text-gray-900 mb-4">Quick Access</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate("/assessment")}
                      className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4 hover:border-[#dceaa6] hover:bg-[#f8fde9] transition-all"
                    >
                      <ClipboardList className="h-5 w-5 text-[#5acd00] mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Assessments</p>
                    </button>
                    <button
                      onClick={() => navigate("/courses")}
                      className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4 hover:border-[#dceaa6] hover:bg-[#f8fde9] transition-all"
                    >
                      <Layers className="h-5 w-5 text-[#5acd00] mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Resources</p>
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4 hover:border-[#dceaa6] hover:bg-[#f8fde9] transition-all"
                    >
                      <BookOpen className="h-5 w-5 text-[#5acd00] mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Landing</p>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4 hover:border-[#dceaa6] hover:bg-[#f8fde9] transition-all"
                    >
                      <LogOut className="h-5 w-5 text-[#5acd00] mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Logout</p>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
