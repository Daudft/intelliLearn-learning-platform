import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChartNoAxesColumn,
  ClipboardList,
  Code2,
  Flame,
  Layers,
  Lock,
  LogOut,
  Plus,
  Play,
  X,
  Search,
  Trophy,
} from "lucide-react";
import assessmentService from "../../services/assessmentService";
import authService from "../../services/authService";
import learningPathService from "../../services/learningPathService";

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

function getInitials(name) {
  if (!name) return "IL";
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "IL";
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getLanguageLabel(language) {
  const labels = {
    python: "Python",
    java: "Java",
    c: "C Language",
  };

  return labels[language] || language;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [status, setStatus] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPathLanguage, setSelectedPathLanguage] = useState("");
  const [taskActionLoading, setTaskActionLoading] = useState(false);
  const [taskGuide, setTaskGuide] = useState(null);
  const [taskGuideError, setTaskGuideError] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const [taskEditorCode, setTaskEditorCode] = useState("");
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [draftSaveState, setDraftSaveState] = useState("idle");
  const draftTimerRef = useRef(null);

  const courseCards = useMemo(
    () => [
      {
        title: "Python",
        description: "Learn Python programming from basics to advanced.",
        level: "Beginner Friendly",
        topics: ["Syntax", "OOP", "Data Science", "Web Dev"],
      },
      {
        title: "Java",
        description: "Master OOP and enterprise-level development.",
        level: "Intermediate",
        topics: ["Classes", "Threads", "Spring", "Microservices"],
      },
      {
        title: "C Language",
        description: "Understand memory, pointers, and low-level programming.",
        level: "Core Foundations",
        topics: ["Pointers", "Memory", "Algorithms", "Systems"],
      },
    ],
    []
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", Icon: BarChart3 },
    { id: "learningPath", label: "Learning Path", Icon: Layers },
    { id: "courses", label: "Courses", Icon: BookOpen },
    { id: "assessments", label: "Assessments", Icon: ClipboardList },
    { id: "progress", label: "Progress", Icon: ChartNoAxesColumn },
    { id: "achievements", label: "Achievements", Icon: Trophy },
  ];

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
        const [statusResponse, attemptsResponse, pathResponse] = await Promise.allSettled([
          assessmentService.checkStatus(userId),
          assessmentService.getAllAttempts(userId),
          learningPathService.getLearningPath(userId),
        ]);

        if (statusResponse.status === "fulfilled") {
          setStatus(statusResponse.value || null);
        }

        if (attemptsResponse.status === "fulfilled") {
          setAttempts(
            Array.isArray(attemptsResponse.value?.attempts)
              ? attemptsResponse.value.attempts
              : []
          );
        }

        if (pathResponse.status === "fulfilled") {
          const paths = Array.isArray(pathResponse.value?.paths) ? pathResponse.value.paths : [];
          setLearningPaths(paths);
          if (paths[0]?.language) {
            setSelectedPathLanguage(paths[0].language);
          }
        }
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

  const attemptsAfterInitial = useMemo(
    () => attempts.filter((item) => Number(item?.attemptNumber || 0) > 1),
    [attempts]
  );

  const hasOnlyInitialAttempt = attempts.length === 1;

  const displayAttempts = useMemo(() => attemptsAfterInitial.slice(0, 6), [attemptsAfterInitial]);

  const selectedPath = useMemo(() => {
    if (!learningPaths.length) return null;
    return (
      learningPaths.find((path) => path.language === selectedPathLanguage) || learningPaths[0]
    );
  }, [learningPaths, selectedPathLanguage]);

  const availableLanguagesToAdd = useMemo(() => {
    const allLanguages = ["python", "java", "c"];
    const added = new Set(learningPaths.map((path) => path.language));
    return allLanguages.filter((language) => !added.has(language));
  }, [learningPaths]);

  const userId = user?.id || user?._id;

  const stats = useMemo(() => {
    const source = attemptsAfterInitial.length ? attemptsAfterInitial : [];

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

    const latest = attemptsAfterInitial[0] || null;

    return {
      totalAttempts: attemptsAfterInitial.length,
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
  }, [attemptsAfterInitial, status]);

  const topicRows = useMemo(() => {
    const latest = attemptsAfterInitial[0] || null;
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
  }, [attemptsAfterInitial]);

  const activityCells = useMemo(() => {
    const total = 84;
    const values = attemptsAfterInitial.map((item) => Number(item?.percentage || 0));

    return Array.from({ length: total }, (_, index) => {
      const value = values.length ? values[index % values.length] : 0;
      if (value >= 80) return "bg-[#6be800]";
      if (value >= 60) return "bg-[#a7f35c]";
      if (value >= 40) return "bg-[#d4f9a8]";
      if (value > 0) return "bg-[#ecf8dc]";
      return "bg-[#eef1e9]";
    });
  }, [attemptsAfterInitial]);

  const currentStreak = useMemo(() => {
    if (!attemptsAfterInitial.length) return 0;

    const uniqueDays = new Set(
      attemptsAfterInitial
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
  }, [attemptsAfterInitial]);

  const handleAddLanguagePath = async (language) => {
    if (!userId || !language) return;

    setTaskActionLoading(true);
    setTaskGuide(null);
    setTaskGuideError("");

    try {
      const proficiencyLevel = status?.proficiencyLevel || "Beginner";
      const response = await learningPathService.addLanguagePath({
        userId,
        language,
        proficiencyLevel,
      });

      const paths = Array.isArray(response?.paths) ? response.paths : [];
      setLearningPaths(paths);
      setSelectedPathLanguage(language);
      setActiveTab("learningPath");
    } catch (err) {
      setTaskGuideError(err?.response?.data?.message || "Could not add language path right now.");
    } finally {
      setTaskActionLoading(false);
    }
  };

  const handleGetTaskGuide = async (taskId, language) => {
    if (!userId || !taskId || !language) return;

    setTaskGuide(null);
    setTaskGuideError("");

    try {
      const response = await learningPathService.getTaskExplanation(userId, language, taskId);
      setTaskGuide(response || null);
    } catch (err) {
      setTaskGuideError(err?.response?.data?.message || "Could not load task guide.");
    }
  };

  const openTaskWorkspace = async (task, language) => {
    if (!task || task.status === "locked") return;

    setActiveTask({ ...task, language });
    setTaskEditorCode(task.draftCode || task.starterCode || "");
    setAiFeedback(null);
    setDraftSaveState("saved");

    await handleGetTaskGuide(task.taskId, language);
  };

  const closeTaskWorkspace = () => {
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }
    setActiveTask(null);
    setTaskEditorCode("");
    setAiFeedback(null);
    setDraftSaveState("idle");
  };

  useEffect(() => {
    if (!activeTask || !userId) return undefined;

    const originalCode = activeTask.draftCode || activeTask.starterCode || "";
    if (taskEditorCode === originalCode) {
      return undefined;
    }

    setDraftSaveState("saving");

    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }

    draftTimerRef.current = setTimeout(async () => {
      try {
        await learningPathService.saveTaskDraft({
          userId,
          language: activeTask.language,
          taskId: activeTask.taskId,
          code: taskEditorCode,
        });
        setDraftSaveState("saved");
      } catch {
        setDraftSaveState("error");
      }
    }, 700);

    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }
    };
  }, [activeTask, taskEditorCode, userId]);

  const handleGetAiFeedback = async () => {
    if (!activeTask || !taskEditorCode.trim()) return;

    setAiFeedbackLoading(true);

    try {
      const response = await learningPathService.getTaskCodeFeedback({
        language: activeTask.language,
        taskTitle: activeTask.title,
        taskDescription: activeTask.description,
        code: taskEditorCode,
        proficiencyLevel: selectedPath?.proficiencyLevel || "Beginner",
      });

      setAiFeedback(response || null);
    } catch (err) {
      setAiFeedback({
        feedback: err?.response?.data?.message || "Could not get AI feedback right now.",
        suggestions: [],
        qualityScore: 0,
      });
    } finally {
      setAiFeedbackLoading(false);
    }
  };

  const handleCompleteFromWorkspace = async () => {
    if (!activeTask || !taskEditorCode.trim()) return;

    setAiFeedbackLoading(true);

    try {
      const response = await learningPathService.submitTaskSolution({
        userId,
        language: activeTask.language,
        taskId: activeTask.taskId,
        code: taskEditorCode,
      });

      const paths = Array.isArray(response?.paths) ? response.paths : [];
      setLearningPaths(paths);

      setAiFeedback({
        feedback: response?.feedback || "Submission reviewed.",
        suggestions: Array.isArray(response?.suggestions) ? response.suggestions : [],
        qualityScore: Number(response?.qualityScore || 0),
        passScore: Number(response?.passScore || 7),
        passed: !!response?.passed,
      });

      if (response?.passed) {
        closeTaskWorkspace();
      }
    } catch (err) {
      setAiFeedback({
        feedback: err?.response?.data?.message || "Could not submit solution.",
        suggestions: [],
        qualityScore: 0,
        passScore: 7,
        passed: false,
      });
    } finally {
      setAiFeedbackLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // continue with local cleanup fallback
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
              {navItems.map(({ id, label, Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-[#eef9df] border border-[#e0f3bf] text-gray-900 font-semibold"
                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-[#5acd00]" : ""} />
                    {label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2 px-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-white hover:text-gray-900 transition-all"
              >
                <LogOut size={18} />
                Logout
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
              </div>
            </header>

            <div className="p-4 md:p-7 space-y-5">
              {activeTab === "dashboard" && (
                <>
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
                          Your current learning level is <span className="font-semibold text-gray-900">{stats.proficiency}</span> in {stats.latestLanguage}.
                        </p>
                      </div>
                    </div>

                    {hasOnlyInitialAttempt && (
                      <div className="mt-5 rounded-2xl border border-[#e7efcf] bg-[#f7fce9] p-4">
                        <p className="text-sm font-semibold text-gray-900">Initial assessment captured.</p>
                        <p className="text-xs text-gray-600 mt-1">
                          We only use your first assessment to start your learning path. Continue with tasks to unlock deeper progress analytics.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="grid xl:grid-cols-[2fr_1fr] gap-5">
                    <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 md:p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-black text-gray-900">Learning Activity</h2>
                          <p className="text-sm text-gray-500">Intensity from attempts after your initial placement test.</p>
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
                          <p className="text-xs uppercase tracking-wider text-gray-500">Learning Attempts</p>
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
                        <h3 className="text-sm font-bold tracking-[0.14em] text-[#5acd00] uppercase mb-4">Learning Path Tasks</h3>
                        {selectedPath ? (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              Active language: <span className="font-semibold text-gray-900">{getLanguageLabel(selectedPath.language)}</span>
                            </p>
                            {selectedPath.tasks
                              ?.filter((task) => task.status !== "locked")
                              .slice(0, 2)
                              .map((task) => (
                                <div key={task.taskId} className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                                  <p className="font-semibold text-gray-900 text-sm">{task.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                </div>
                              ))}

                            <button
                              onClick={() => setActiveTab("learningPath")}
                              className="w-full py-2.5 rounded-xl border border-[#dceaa6] bg-[#f8fde9] text-sm font-semibold text-gray-900"
                            >
                              Open Full Learning Path
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                            <p className="text-sm text-gray-600">Complete your first assessment to generate tasks.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="grid xl:grid-cols-1 gap-5">
                    <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <h3 className="text-xl font-black text-gray-900 mb-4">Quick Access</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab("assessments")}
                      className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4 hover:border-[#dceaa6] hover:bg-[#f8fde9] transition-all"
                    >
                      <ClipboardList className="h-5 w-5 text-[#5acd00] mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Assessments</p>
                    </button>
                    <button
                      onClick={() => setActiveTab("learningPath")}
                      className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4 hover:border-[#dceaa6] hover:bg-[#f8fde9] transition-all"
                    >
                      <Layers className="h-5 w-5 text-[#5acd00] mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Learning Path</p>
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4 hover:border-[#dceaa6] hover:bg-[#f8fde9] transition-all"
                    >
                      <BookOpen className="h-5 w-5 text-[#5acd00] mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Landing</p>
                    </button>
                    <button
                      onClick={() => setActiveTab("progress")}
                      className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4 hover:border-[#dceaa6] hover:bg-[#f8fde9] transition-all"
                    >
                      <ChartNoAxesColumn className="h-5 w-5 text-[#5acd00] mb-2" />
                      <p className="text-sm font-semibold text-gray-900">Progress</p>
                    </button>
                  </div>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "learningPath" && (
                <section className="space-y-5">
                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 md:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Your Learning Path</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Complete unlocked tasks to automatically unlock the next task.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {availableLanguagesToAdd.map((language) => (
                          <button
                            key={language}
                            onClick={() => handleAddLanguagePath(language)}
                            disabled={taskActionLoading}
                            className="px-3 py-2 rounded-xl border border-[#d9e0cb] bg-[#f8fde9] text-sm font-semibold text-gray-900 flex items-center gap-1.5 disabled:opacity-60"
                          >
                            <Plus size={14} />
                            Add {getLanguageLabel(language)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!!taskGuideError && (
                      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {taskGuideError}
                      </div>
                    )}

                    {!learningPaths.length && (
                      <div className="mt-5 rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-4">
                        <p className="text-sm text-gray-600">
                          No learning path yet. Complete an initial assessment to auto-generate tasks.
                        </p>
                        <button
                          onClick={() => navigate("/assessment")}
                          className="mt-3 px-4 py-2 rounded-xl bg-linear-to-r from-[#E6FF03] to-[#d7ee00] text-sm font-semibold text-gray-900"
                        >
                          Start Assessment
                        </button>
                      </div>
                    )}

                    {learningPaths.length > 0 && (
                      <div className="mt-5 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {learningPaths.map((path) => (
                            <button
                              key={path.language}
                              onClick={() => setSelectedPathLanguage(path.language)}
                              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                                selectedPath?.language === path.language
                                  ? "border-[#dceaa6] bg-[#f8fde9] text-gray-900"
                                  : "border-[#e7e9ef] bg-white text-gray-600"
                              }`}
                            >
                              {getLanguageLabel(path.language)}
                            </button>
                          ))}
                        </div>

                        <div className="grid xl:grid-cols-[2fr_1fr] gap-5">
                          <div className="space-y-3">
                            {selectedPath?.tasks?.map((task) => (
                              <div
                                key={task.taskId}
                                className="rounded-2xl border border-[#e8ebf0] bg-[#fbfcff] p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">{task.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                  </div>

                                  <span
                                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border ${
                                      task.status === "completed"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : task.status === "unlocked"
                                        ? "border-[#dceaa6] bg-[#f8fde9] text-gray-700"
                                        : "border-gray-200 bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {task.status === "completed" && <CheckCircle2 size={12} />}
                                    {task.status === "locked" && <Lock size={12} />}
                                    {task.status.toUpperCase()}
                                  </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    onClick={() => openTaskWorkspace(task, selectedPath.language)}
                                    disabled={task.status === "locked"}
                                    className="px-3 py-2 rounded-xl border border-[#d9e0cb] text-xs font-semibold text-gray-700 disabled:opacity-50 flex items-center gap-1.5"
                                  >
                                    <Code2 size={13} />
                                    Open Coding Window
                                  </button>

                                  <button
                                    onClick={() => handleGetTaskGuide(task.taskId, selectedPath.language)}
                                    disabled={task.status === "locked"}
                                    className="px-3 py-2 rounded-xl border border-[#d9e0cb] text-xs font-semibold text-gray-700 disabled:opacity-50 flex items-center gap-1.5"
                                  >
                                    <Code2 size={13} />
                                    Get Task Guide (API)
                                  </button>

                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-2xl border border-[#e8ebf0] bg-white p-4">
                            <h3 className="text-base font-black text-gray-900">Task Guide Panel</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Fetch explanation from API, then solve in the coding window and submit.
                            </p>

                            {!taskGuide && (
                              <p className="text-sm text-gray-500 mt-5">
                                Select any unlocked task and click "Get Task Guide (API)".
                              </p>
                            )}

                            {taskGuide && (
                              <div className="mt-4 space-y-3">
                                <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                                  <p className="text-xs text-gray-500">Task</p>
                                  <p className="text-sm font-semibold text-gray-900 mt-1">{taskGuide.taskTitle}</p>
                                </div>

                                <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                                  <p className="text-xs text-gray-500">Explanation</p>
                                  <p className="text-sm text-gray-700 mt-1">{taskGuide.explanation}</p>
                                </div>

                                <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                                  <p className="text-xs text-gray-500">Starter Code</p>
                                  <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">{taskGuide.starterCode}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "courses" && (
                <section className="bg-white rounded-3xl border border-[#e7e9ef] p-5 md:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Course Library</h2>
                      <p className="text-sm text-gray-500 mt-1">Explore modules without leaving your dashboard.</p>
                    </div>
                    <button
                      onClick={() => navigate("/courses")}
                      className="px-4 py-2 rounded-xl border border-[#d9e0cb] text-sm font-semibold text-gray-700 hover:bg-[#f7fbe8]"
                    >
                      Open Full Courses Page
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {courseCards.map((course) => (
                      <div key={course.title} className="rounded-2xl border border-[#e8ebf0] bg-[#fbfcff] p-4">
                        <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <p className="text-xs font-semibold text-[#5acd00] uppercase tracking-wide mt-3">{course.level}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {course.topics.map((topic) => (
                            <span key={topic} className="px-2.5 py-1 rounded-full bg-white border border-[#e7e9ef] text-xs text-gray-600">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === "assessments" && (
                <section className="grid lg:grid-cols-[2fr_1fr] gap-5">
                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 md:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h2 className="text-2xl font-black text-gray-900">Assessments</h2>
                    <p className="text-sm text-gray-500 mt-1">Start a new test when you are ready.</p>

                    <div className="grid sm:grid-cols-3 gap-3 mt-6">
                      {["Python", "Java", "C"].map((language) => (
                        <div key={language} className="rounded-2xl border border-[#e8ebf0] bg-[#fbfcff] p-4">
                          <p className="text-sm text-gray-500">Language</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">{language}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate("/assessment")}
                      className="mt-6 px-5 py-3 rounded-xl bg-linear-to-r from-[#E6FF03] to-[#d7ee00] text-gray-900 font-semibold"
                    >
                      Choose Language And Start
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h3 className="text-lg font-black text-gray-900">Latest Attempt</h3>
                    <p className="text-sm text-gray-500 mt-1">Snapshot from attempts after initial placement.</p>

                    <div className="mt-5 space-y-3">
                      <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                        <p className="text-xs text-gray-500">Language</p>
                        <p className="font-semibold text-gray-900 mt-1">{stats.latestLanguage}</p>
                      </div>
                      <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="font-semibold text-gray-900 mt-1">{stats.latestScore}/{stats.latestTotal}</p>
                      </div>
                      <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                        <p className="text-xs text-gray-500">Proficiency</p>
                        <p className="font-semibold text-[#5acd00] mt-1">{stats.proficiency}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "progress" && (
                <section className="grid xl:grid-cols-[1.3fr_1fr] gap-5">
                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 md:p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h2 className="text-2xl font-black text-gray-900">Topic Progress</h2>
                    <p className="text-sm text-gray-500 mt-1">Performance by topic from your latest result.</p>

                    {topicRows.length === 0 ? (
                      <p className="text-sm text-gray-500 mt-5">No topic data available yet.</p>
                    ) : (
                      <div className="space-y-3 mt-5">
                        {topicRows.map((row) => (
                          <div key={row.topic} className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{row.topic}</p>
                              <p className="text-sm font-semibold text-[#5acd00]">{row.percentage}%</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{row.correct} correct out of {row.total}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h3 className="text-lg font-black text-gray-900">Progress Summary</h3>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                        <p className="text-xs text-gray-500">Average Score</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.averagePercentage}%</p>
                      </div>
                      <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                        <p className="text-xs text-gray-500">Best Score</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.bestPercentage}%</p>
                      </div>
                      <div className="rounded-xl border border-[#e8ebf0] bg-[#fbfcff] p-3">
                        <p className="text-xs text-gray-500">Current Streak</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{currentStreak} days</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "achievements" && (
                <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h3 className="text-lg font-black text-gray-900">Consistency</h3>
                    <p className="text-sm text-gray-500 mt-1">Earn this by keeping your streak alive.</p>
                    <p className="text-3xl font-black text-gray-900 mt-4">{currentStreak} / 7</p>
                    <p className="text-xs text-[#5acd00] font-semibold mt-2">{currentStreak >= 7 ? "Unlocked" : "In progress"}</p>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <h3 className="text-lg font-black text-gray-900">High Scorer</h3>
                    <p className="text-sm text-gray-500 mt-1">Reach at least 80% in an assessment.</p>
                    <p className="text-3xl font-black text-gray-900 mt-4">{stats.bestPercentage}%</p>
                    <p className="text-xs text-[#5acd00] font-semibold mt-2">{stats.bestPercentage >= 80 ? "Unlocked" : "Keep practicing"}</p>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#e7e9ef] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:col-span-2 xl:col-span-1">
                    <h3 className="text-lg font-black text-gray-900">Assessment Explorer</h3>
                    <p className="text-sm text-gray-500 mt-1">Complete 3 assessment attempts.</p>
                    <p className="text-3xl font-black text-gray-900 mt-4">{stats.totalAttempts} / 3</p>
                    <p className="text-xs text-[#5acd00] font-semibold mt-2">{stats.totalAttempts >= 3 ? "Unlocked" : "In progress"}</p>
                  </div>
                </section>
              )}
            </div>

            {activeTask && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end md:items-center justify-center p-3 md:p-6">
                <div className="w-full max-w-6xl max-h-[95vh] overflow-auto rounded-3xl border border-[#dfe4eb] bg-white shadow-2xl">
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#edf0f5] px-4 md:px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">In-App Coding Workspace</p>
                      <h3 className="text-lg md:text-xl font-black text-gray-900 mt-1">{activeTask.title}</h3>
                    </div>
                    <button
                      onClick={closeTaskWorkspace}
                      className="h-10 w-10 rounded-xl border border-[#e6e8ee] grid place-items-center text-gray-600 hover:text-gray-900"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 p-4 md:p-6">
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-[#e8ebf0] bg-[#fbfcff] p-4">
                        <p className="text-xs text-gray-500">Task Description</p>
                        <p className="text-sm text-gray-700 mt-1">{activeTask.description}</p>
                        {taskGuide?.explanation && (
                          <>
                            <p className="text-xs text-gray-500 mt-3">Task Explanation</p>
                            <p className="text-sm text-gray-700 mt-1">{taskGuide.explanation}</p>
                          </>
                        )}
                      </div>

                      <div className="rounded-2xl border border-[#1f2937] bg-[#0f172a] p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-300">Code Editor</p>
                          <p className="text-xs text-slate-400">
                            {getLanguageLabel(activeTask.language)} • {draftSaveState === "saving" ? "Saving draft..." : draftSaveState === "saved" ? "Draft saved" : draftSaveState === "error" ? "Draft save failed" : ""}
                          </p>
                        </div>
                        <textarea
                          value={taskEditorCode}
                          onChange={(event) => setTaskEditorCode(event.target.value)}
                          spellCheck={false}
                          className="w-full min-h-[340px] bg-[#020617] text-[#d1fae5] border border-slate-700 rounded-xl p-3 font-mono text-sm outline-none focus:border-[#84cc16]"
                          placeholder="Write your code here..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleGetAiFeedback}
                          disabled={aiFeedbackLoading || !taskEditorCode.trim()}
                          className="px-4 py-2.5 rounded-xl border border-[#d9e0cb] text-sm font-semibold text-gray-700 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Play size={14} />
                          {aiFeedbackLoading ? "Getting AI Feedback..." : "Get AI Feedback"}
                        </button>

                        <button
                          onClick={handleCompleteFromWorkspace}
                          disabled={activeTask.status !== "unlocked" || taskActionLoading || !taskEditorCode.trim()}
                          className="px-4 py-2.5 rounded-xl bg-linear-to-r from-[#E6FF03] to-[#d7ee00] text-sm font-semibold text-gray-900 disabled:opacity-50"
                        >
                          Submit Solution (AI Review)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-[#e8ebf0] bg-[#fbfcff] p-4">
                        <h4 className="text-sm font-black text-gray-900">AI Mentor Feedback</h4>

                        {!aiFeedback && (
                          <p className="text-sm text-gray-500 mt-2">
                            Click "Get AI Feedback" to review code quality, suggestions, and score.
                          </p>
                        )}

                        {aiFeedback && (
                          <div className="mt-3 space-y-3">
                            <div className="rounded-xl border border-[#e8ebf0] bg-white p-3">
                              <p className="text-xs text-gray-500">Feedback</p>
                              <p className="text-sm text-gray-700 mt-1">{aiFeedback.feedback}</p>
                            </div>

                            <div className="rounded-xl border border-[#e8ebf0] bg-white p-3">
                              <p className="text-xs text-gray-500">Quality Score</p>
                              <p className="text-2xl font-black text-gray-900 mt-1">{aiFeedback.qualityScore || 0}/10</p>
                              {aiFeedback.passScore ? (
                                <p className="text-xs text-gray-500 mt-1">Pass score: {aiFeedback.passScore}/10</p>
                              ) : null}
                              {typeof aiFeedback.passed === "boolean" ? (
                                <p className={`text-xs font-semibold mt-1 ${aiFeedback.passed ? "text-emerald-600" : "text-amber-600"}`}>
                                  {aiFeedback.passed ? "Passed. Next task unlocked." : "Not passed yet. Improve and resubmit."}
                                </p>
                              ) : null}
                            </div>

                            <div className="rounded-xl border border-[#e8ebf0] bg-white p-3">
                              <p className="text-xs text-gray-500">Suggestions</p>
                              <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc pl-5">
                                {(aiFeedback.suggestions || []).map((item, index) => (
                                  <li key={`${item}-${index}`}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
