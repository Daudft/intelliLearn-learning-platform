import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ClipboardList, Flame, Layers,
  LayoutDashboard, LogOut, Target, TrendingUp,
  BookOpen, CheckCircle2, Lock, Circle, ChevronRight, Play,
  Award, BarChart3, Sparkles, Star, Trophy, Zap,
  Brain, Rocket, Mountain, Compass, Crown, Medal, Users
} from "lucide-react";
import assessmentService from "../../services/assessmentService";
import authService from "../../services/authService";
import learningPathService from "../../services/learningPathService";
import userService from "../../services/userService";
import QuizModal from "../../components/QuizModal/QuizModal";

/* ─── helpers ─── */
function getStoredUser() {
  try { const r = localStorage.getItem("user"); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

function getLanguageLabel(l) {
  return ({ python: "Python", java: "Java", c: "C Language" })[l] || l;
}

function getLangEmoji(l) {
  return ({ python: "🐍", java: "☕", c: "⚙️" })[l?.toLowerCase()] || "💻";
}

function getLangColor() {
  // Brand blue accent used across the learning cards.
  return "#2f6bff";
}

/* ─── Proficiency Level Configuration ─── */
const MONO_COLOR = "#111111";
const MONO_GRADIENT = "linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%)";

const PROFICIENCY_CONFIG = {
  beginner: {
    name: "Beginner",
    icon: Compass,
    color: MONO_COLOR,
    bgGradient: MONO_GRADIENT,
    description: "Starting your coding journey",
    minXP: 0,
    maxXP: 1000,
    badge: "🌱",
    nextLevel: "Intermediate",
    requirements: "Complete 5 tasks and score 60%+ on assessment"
  },
  intermediate: {
    name: "Intermediate",
    icon: Rocket,
    color: MONO_COLOR,
    bgGradient: MONO_GRADIENT,
    description: "Building solid foundations",
    minXP: 1000,
    maxXP: 3000,
    badge: "⚡",
    nextLevel: "Advanced",
    requirements: "Score 70%+ on assessment and complete 15 tasks"
  },
  advanced: {
    name: "Advanced",
    icon: Mountain,
    color: MONO_COLOR,
    bgGradient: MONO_GRADIENT,
    description: "Mastering complex concepts",
    minXP: 3000,
    maxXP: 6000,
    badge: "🏔️",
    nextLevel: "Expert",
    requirements: "Score 85%+ on assessment and complete 30 tasks"
  },
  expert: {
    name: "Expert",
    icon: Crown,
    color: MONO_COLOR,
    bgGradient: MONO_GRADIENT,
    description: "Ready for real-world challenges",
    minXP: 6000,
    maxXP: 10000,
    badge: "👑",
    nextLevel: "Master",
    requirements: "Score 95%+ on assessment and complete 50 tasks"
  },
  master: {
    name: "Master",
    icon: Trophy,
    color: MONO_COLOR,
    bgGradient: MONO_GRADIENT,
    description: "Elite problem solver",
    minXP: 10000,
    maxXP: Infinity,
    badge: "🏆",
    nextLevel: null,
    requirements: "Peak performance achieved!"
  }
};

/* ─── StatusPill ─── */
function StatusPill({ status }) {
  const map = {
    completed: { bg:"#0a0a0a", color:"#ffffff", border:"1px solid #0a0a0a", icon: <CheckCircle2 size={10} /> },
    unlocked:  { bg:"#ffffff", color:"#0a0a0a", border:"1px solid #0a0a0a", icon: <Circle size={10} /> },
    locked:    { bg:"#f2f2f2", color:"rgba(0,0,0,0.4)", border:"1px solid #e6e6e6", icon: <Lock size={10} /> },
  };
  const { bg, color, border, icon } = map[status] || map.locked;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px",
      fontSize:11, fontWeight:700, background: bg, color, border,
      textTransform:"uppercase", letterSpacing:"0.05em" }}>
      {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const DISPLAY_FONT = "'Space Grotesk', system-ui, sans-serif";

/* ─── Accent palette (matching-color icons) ─── */
const C = {
  blue:   { solid:"#2f6bff", grad:"linear-gradient(135deg,#2f6bff,#4da2ff)", soft:"#eaf0ff" },
  flame:  { solid:"#ff6b35", grad:"linear-gradient(135deg,#ff6b35,#ff9d4d)", soft:"#fff1ea" },
  violet: { solid:"#7c5cff", grad:"linear-gradient(135deg,#7c5cff,#9d86ff)", soft:"#f0ecff" },
  green:  { solid:"#12b76a", grad:"linear-gradient(135deg,#12b76a,#3ddc97)", soft:"#e6f7ef" },
  amber:  { solid:"#f79009", grad:"linear-gradient(135deg,#f79009,#fdb022)", soft:"#fef3e2" },
};

/* ─── Card (sharp, white, hairline border) ─── */
function Glass({ children, className = "", style = {} }) {
  return (
    <div className={className} style={{
      background:"#ffffff",
      boxShadow:"0 1px 2px rgba(0,0,0,0.04)",
      border:"1px solid #e6e6e6",
      padding:24, ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Circular progress ring ─── */
function Ring({ pct = 0, size = 52, stroke = 4, color = "#0a0a0a" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`} />
    </svg>
  );
}

/* ─── Proficiency Badge Component ─── */
function ProficiencyBadge({ level, size = "md", showIcon = true }) {
  const config = PROFICIENCY_CONFIG[level?.toLowerCase()] || PROFICIENCY_CONFIG.beginner;
  const Icon = config.icon;
  const dimensions = size === "sm" ? { width: 40, height: 40, iconSize: 20, fontSize: 11 }
    : size === "lg" ? { width: 80, height: 80, iconSize: 40, fontSize: 20 }
    : { width: 56, height: 56, iconSize: 28, fontSize: 14 };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: "50%",
        background: config.bgGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        boxShadow: `0 8px 20px ${config.color}40`,
        position: "relative"
      }}>
        {showIcon && <Icon size={dimensions.iconSize} color="white" />}
      </div>
      <div style={{
        marginTop: dimensions.width === 40 ? 6 : 10,
        fontSize: dimensions.fontSize,
        fontWeight: 700,
        color: config.color
      }}>
        {config.name}
      </div>
    </div>
  );
}

/* ─── XP Progress Bar ─── */
function XPProgressBar({ xp, nextLevelXP }) {
  const progress = Math.min((xp / nextLevelXP) * 100, 100);
  
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>XP Progress</span>
        <span style={{ fontSize: 11, color: "#111111", fontWeight: 700 }}>{xp} / {nextLevelXP} XP</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          borderRadius: 99,
          width: `${progress}%`,
          background: "linear-gradient(90deg, #0a0a0a, #111111)",
          transition: "width 0.5s ease"
        }} />
      </div>
    </div>
  );
}

const NAV = [
  { id:"dashboard",    label:"Dashboard",    Icon: LayoutDashboard, description: "Overview" },
  { id:"progress",     label:"Progress",     Icon: Target, description: "Track your journey" },
  { id:"assessment",   label:"Assessment",   Icon: ClipboardList, description: "Test skills" },
  { id:"learningPath", label:"Learning Path", Icon: Layers, description: "Your roadmap" },
  { id:"leaderboard",  label:"Leaderboard",  Icon: Trophy, description: "Compete & rank" },
];

const DAYS = ["M","T","W","T","F","S","S"];

/* ─── Leaderboard styling ─── */
const RANK = {
  1: { grad:"linear-gradient(135deg,#ffd93b,#ff9500)", ring:"#ffb300", glow:"rgba(255,180,0,0.5)",  emoji:"🥇" },
  2: { grad:"linear-gradient(135deg,#cfd8e3,#94a3b8)", ring:"#94a3b8", glow:"rgba(148,163,184,0.5)", emoji:"🥈" },
  3: { grad:"linear-gradient(135deg,#f0a868,#c2703c)", ring:"#c2703c", glow:"rgba(194,112,60,0.5)",  emoji:"🥉" },
};
function avatarGrad(name) {
  const g = [
    "linear-gradient(135deg,#2f6bff,#4da2ff)",
    "linear-gradient(135deg,#7c5cff,#b06bff)",
    "linear-gradient(135deg,#ff6b9d,#ff8f5e)",
    "linear-gradient(135deg,#12b76a,#3ddc97)",
    "linear-gradient(135deg,#ff6b35,#ffb020)",
    "linear-gradient(135deg,#06b6d4,#22d3ee)",
  ];
  let h = 0; const s = String(name || "U");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
  return g[h % g.length];
}

/* ════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [activeView, setActiveView]       = useState("dashboard");
  const [user, setUser]                   = useState(null);
  const [status, setStatus]               = useState(null);
  const [attempts, setAttempts]           = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [xp, setXP]                       = useState(0);
  const [currentLearningIndex, setCurrentLearningIndex] = useState(0);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizLang, setQuizLang] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [rankCelebration, setRankCelebration] = useState(null);
  const prevRankRef = useRef(null);
  const rankConfetti = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    left: `${Math.round(Math.random() * 100)}%`,
    size: 7 + Math.round(Math.random() * 9),
    color: ['#ffd93b','#2f6bff','#ff6b9d','#12b76a','#7c5cff','#ff6b35','#22e39b'][i % 7],
    dur: 1.8 + Math.random() * 1.4,
    delay: Math.random() * 0.6,
    round: Math.random() > 0.5,
  })), []);

  useEffect(() => {
    const boot = async () => {
      const cu = getStoredUser();
      if (!cu) { navigate("/signin", { replace: true }); return; }
      const uid = cu.id || cu._id;
      if (!uid) { navigate("/signin", { replace: true }); return; }
      setUser(cu);
      try {
        const [sr, ar, pr] = await Promise.allSettled([
          assessmentService.checkStatus(uid),
          assessmentService.getAllAttempts(uid),
          learningPathService.waitForLearningPath(uid),
        ]);
        if (sr.status === "fulfilled") setStatus(sr.value || null);
        if (ar.status === "fulfilled") setAttempts(Array.isArray(ar.value?.attempts) ? ar.value.attempts : []);
        if (pr.status === "fulfilled") setLearningPaths(Array.isArray(pr.value?.learningPath?.paths) ? pr.value.learningPath.paths : []);
        
        // Calculate XP based on completed tasks and assessment scores
        const paths = pr.status === "fulfilled" ? (pr.value?.learningPath?.paths || []) : [];
        const completedTasks = paths.reduce((sum, path) => 
          sum + (path.tasks?.filter(t => t.status === "completed").length || 0), 0);
        const bestScore = ar.status === "fulfilled" ? Math.max(...(ar.value?.attempts || []).map(a => a.score || 0), 0) : 0;
        const calculatedXP = (completedTasks * 50) + (bestScore * 5);
        setXP(calculatedXP);
        
      } catch (e) {
        setError(e?.response?.data?.message || "Could not load dashboard.");
      } finally { setLoading(false); }
    };
    boot();
  }, [navigate]);

  // Real-time leaderboard — refresh on open + poll every 15s while viewing
  const refreshLeaderboard = useCallback(async () => {
    try {
      const lr = await userService.getLeaderboard();
      const rows = Array.isArray(lr?.leaderboard) ? lr.leaderboard : [];
      setLeaderboard(rows);
      const cu = getStoredUser();
      const myId = String(cu?.id || cu?._id || "");
      const newRank = rows.find(r => String(r.userId) === myId)?.rank ?? null;
      if (prevRankRef.current != null && newRank != null && newRank < prevRankRef.current) {
        setRankCelebration({ from: prevRankRef.current, to: newRank });
      }
      if (newRank != null) prevRankRef.current = newRank;
    } catch { /* ignore */ } finally { setLbLoading(false); }
  }, []);

  useEffect(() => {
    if (activeView !== "leaderboard") return;
    refreshLeaderboard();
    const id = setInterval(refreshLeaderboard, 15000);
    return () => clearInterval(id);
  }, [activeView, refreshLeaderboard]);

  useEffect(() => {
    if (!rankCelebration) return;
    const t = setTimeout(() => setRankCelebration(null), 3800);
    return () => clearTimeout(t);
  }, [rankCelebration]);

  const later = useMemo(() => attempts.filter(a => Number(a?.attemptNumber || 0) > 1), [attempts]);

  // Calculate proper daily streak with day-of-week tracking
  const calculateStreak = useCallback(() => {
    if (!status?.lastSignIn) return 1;
    
    const lastSignIn = new Date(status.lastSignIn);
    const today = new Date();
    
    // Get midnight times for accurate day comparison
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastSignInMidnight = new Date(lastSignIn.getFullYear(), lastSignIn.getMonth(), lastSignIn.getDate());
    
    const daysDifference = Math.floor((todayMidnight - lastSignInMidnight) / (1000 * 60 * 60 * 24));
    
    // If signed in today, keep the same streak
    if (daysDifference === 0) {
      return status?.streak || 1;
    }
    
    // If signed in yesterday, increment streak
    if (daysDifference === 1) {
      return (status?.streak || 1) + 1;
    }
    
    // If more than 1 day has passed, reset streak to 1
    if (daysDifference > 1) {
      return 1;
    }
    
    return status?.streak || 1;
  }, [status?.lastSignIn, status?.streak]);

  // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
  const getTodayDayIndex = useCallback(() => {
    const today = new Date();
    let dayIndex = today.getDay(); // 0 = Sunday, 6 = Saturday
    // Adjust so Monday = 0 (matching DAYS array: ["M","T","W","T","F","S","S"])
    dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return dayIndex;
  }, []);

  const s = useMemo(() => {
    const latest    = later[0] || null;
    const path      = learningPaths[0] || null;
    const tasks     = path?.tasks || [];
    const done      = tasks.filter(t => t.status === "completed").length;
    const unlocked  = tasks.filter(t => t.status !== "locked").length;
    const daily     = tasks.find(t => t.status === "unlocked") || tasks[0] || null;
    const streak    = calculateStreak();
    const langKey   = (path?.language || status?.assessmentLanguage || "python").toLowerCase();
    const proficiencyLevel = status?.proficiencyLevel || "beginner";
    const config = PROFICIENCY_CONFIG[proficiencyLevel?.toLowerCase()] || PROFICIENCY_CONFIG.beginner;
    const nextLevelConfig = config.nextLevel ? PROFICIENCY_CONFIG[config.nextLevel?.toLowerCase()] : null;
    
    return {
      streak, streakPct: Math.min(100, Math.round((streak / 7) * 100)),
      todayDayIndex: getTodayDayIndex(),
      lang:       langKey,
      langLabel:  getLanguageLabel(langKey),
      langEmoji:  getLangEmoji(langKey),
      langColor:  getLangColor(langKey),
      displayLang:(latest?.language || status?.assessmentLanguage || "-").toString().toUpperCase(),
      level:      proficiencyLevel,
      levelConfig: config,
      nextLevelConfig,
      xp,
      nextLevelXP: nextLevelConfig?.minXP || config.maxXP,
      quizzes:    later.length,
      score:      latest ? `${latest.score}/${latest.totalQuestions}` : "—",
      totalTasks: tasks.length, done, unlocked, daily,
      pct:        tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      tasks,
    };
  }, [later, status, learningPaths, xp, calculateStreak, getTodayDayIndex]);

  const logout = async () => { try { await authService.logout(); } finally { navigate("/signin", { replace: true }); } };

  const reloadLearningPaths = async () => {
    const uid = user?.id || user?._id;
    if (!uid) return;
    try {
      const pr = await learningPathService.waitForLearningPath(uid);
      setLearningPaths(Array.isArray(pr?.learningPath?.paths) ? pr.learningPath.paths : []);
    } catch { /* ignore */ }
  };

  const handleAdvanceCycle = async (lang) => {
    const uid = user?.id || user?._id;
    if (!uid || !lang) return;
    try {
      setAdvancing(true);
      await learningPathService.advanceCycle({ userId: uid, language: lang });
      await reloadLearningPaths();
    } catch { /* ignore */ } finally {
      setAdvancing(false);
    }
  };

  const pageBg = `#f5f5f4`;

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background: pageBg }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid rgba(0,0,0,0.5)",
          borderTopColor:"transparent", animation:"spin .8s linear infinite", margin:"0 auto" }} />
        <p style={{ marginTop:16, color:"rgba(0,0,0,0.4)", fontSize:13, fontFamily:"system-ui" }}>Loading your learning journey...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", padding:24, background: pageBg }}>
      <div style={{ maxWidth:360, width:"100%", borderRadius:24, padding:36, textAlign:"center",
        background:"rgba(255,255,255,0.8)", backdropFilter:"blur(24px)",
        boxShadow:"0 12px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
        <p style={{ margin:0, color:"#0a0a0a", fontWeight:800, fontSize:18, fontFamily:"system-ui" }}>Something went wrong</p>
        <p style={{ margin:"10px 0 0", color:"rgba(0,0,0,0.5)", fontSize:13, fontFamily:"system-ui" }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop:24, padding:"11px 28px",
          borderRadius:12, background:"#0a0a0a", fontWeight:800, fontSize:13, color:"#ffffff", border:"none", cursor:"pointer" }}>
          Try again
        </button>
      </div>
    </div>
  );

  const initial = (user?.name || "U").charAt(0).toUpperCase();
  const LevelIcon = s.levelConfig.icon;

  return (
    <div style={{ minHeight:"100vh", display:"flex", background: pageBg,
      fontFamily:"'Inter', system-ui, sans-serif", position:"relative" }}>

      {/* Ambient orbs */}
      <div style={{ position:"fixed", top:-140, left:180, width:520, height:520, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 68%)",
        pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:-100, right:60, width:440, height:440, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 68%)",
        pointerEvents:"none", zIndex:0 }} />

      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.4);border-radius:4px}
        .side-item{transition:all .18s ease}
        .stat-card{transition:transform .2s,border-color .2s,box-shadow .2s}
        .stat-card:hover{transform:translateY(-3px);border-color:#0a0a0a!important;box-shadow:0 14px 30px rgba(0,0,0,0.10)!important}
        .task-row{transition:all .18s ease}
        .task-row:hover{border-color:#0a0a0a!important}
        .continue-btn{transition:transform .15s, box-shadow .15s}
        .continue-btn:hover{transform:translateY(-1px);box-shadow:0 12px 32px rgba(0,0,0,0.35)!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .38s ease both}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes glow{0%,100%{box-shadow:0 0 5px rgba(0,0,0,0.2)}50%{box-shadow:0 0 20px rgba(0,0,0,0.4)}}
        .glow-animation{animation:glow 2s ease-in-out infinite}
      `}</style>

      {/* ══ SIDEBAR (solid black) ══ */}
      <aside style={{
        position:"fixed", left:0, top:0, width:264, height:"100vh",
        display:"flex", flexDirection:"column", zIndex:20,
        background:"#0a0a0a", color:"#fff",
      }}>
        <div style={{ padding:"32px 24px 28px" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:0 }}>
            <span style={{ color:"#fff", fontWeight:700, fontSize:20, letterSpacing:"-0.02em", fontFamily:DISPLAY_FONT }}>Intelli</span>
            <span style={{ color:"rgba(255,255,255,0.55)", fontWeight:600, fontSize:20, letterSpacing:"-0.02em", fontFamily:DISPLAY_FONT }}>Learn</span>
          </div>
        </div>

        <nav style={{ flex:1, padding:"4px 14px", display:"flex", flexDirection:"column", gap:4 }}>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:700,
            letterSpacing:"0.22em", textTransform:"uppercase", padding:"0 14px", margin:"0 0 12px" }}>Menu</p>
          {NAV.map(({ id, label, Icon, description }) => {
            const active = activeView === id;
            return (
              <button key={id} className="side-item" onClick={() => setActiveView(id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:12,
                padding:"12px 14px", border:"none", cursor:"pointer", textAlign:"left",
                background: active ? "#ffffff" : "transparent",
                color: active ? "#0a0a0a" : "rgba(255,255,255,0.6)",
                fontWeight: active ? 700 : 500, fontSize:14, transition:"all .18s ease",
              }}>
                <Icon size={17} />
                <div style={{ flex:1, textAlign:"left" }}>
                  <div style={{ fontFamily: active ? DISPLAY_FONT : "inherit" }}>{label}</div>
                  <div style={{ fontSize:10, opacity:0.6 }}>{description}</div>
                </div>
                {active && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"16px 14px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11, padding:"12px 14px", marginBottom:6,
            border:"1px solid rgba(255,255,255,0.12)" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"#fff",
              display:"grid", placeItems:"center", fontWeight:800, fontSize:14,
              color:"#0a0a0a", flexShrink:0 }}>
              {initial}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:13,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.name || "Learner"}
              </p>
              <p style={{ margin:0, color:"rgba(255,255,255,0.5)", fontSize:11,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button className="side-item" onClick={logout} style={{
            width:"100%", display:"flex", alignItems:"center", gap:12,
            padding:"12px 14px", border:"none", cursor:"pointer",
            background:"transparent", color:"rgba(255,255,255,0.5)", fontWeight:500, fontSize:14,
          }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ marginLeft:264, flex:1, minHeight:"100vh",
        padding:"40px 52px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>

          {/* ── TOP GREETING BAR (dashboard only) ── */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between",
            gap:16, marginBottom:28, flexWrap:"wrap" }}>
            <div>
              <p style={{ margin:0, color:"rgba(0,0,0,0.45)", fontSize:12, fontWeight:600,
                textTransform:"uppercase", letterSpacing:"0.18em" }}>
                {activeView === "dashboard" ? "Overview" : activeView === "learningPath" ? "Your roadmap" : activeView === "progress" ? "Your journey" : activeView === "leaderboard" ? "Compete & rank" : "Test skills"}
              </p>
              <h1 style={{ margin:"6px 0 0", color:"#0a0a0a", fontSize:32, fontWeight:700,
                letterSpacing:"-0.03em", fontFamily:DISPLAY_FONT, lineHeight:1 }}>
                {activeView === "dashboard" ? `Welcome back, ${user?.name?.split(" ")[0] || "Learner"}` :
                 activeView === "progress" ? "Progress" :
                 activeView === "assessment" ? "Skill Assessment" :
                 activeView === "leaderboard" ? "Leaderboard" : "Learning Path"}
              </h1>
            </div>
          </div>


          {/* ── DASHBOARD ── */}
          {activeView === "dashboard" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* ══ HERO: Profile banner (blue membership card) ══ */}
              <Glass style={{ padding:0, overflow:"hidden", position:"relative", border:"none",
                background:"linear-gradient(120deg,#1e5cff 0%,#2f6bff 45%,#4da2ff 100%)",
                boxShadow:"0 16px 40px rgba(47,107,255,0.28)" }}>
                {/* decorative glow */}
                <div style={{ position:"absolute", top:-70, right:-20, width:230, height:230, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.20),transparent 70%)", pointerEvents:"none" }} />
                <div style={{ position:"absolute", bottom:-90, right:150, width:210, height:210, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.10),transparent 70%)", pointerEvents:"none" }} />
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 10% 15%, rgba(255,255,255,0.14), transparent 45%)", pointerEvents:"none" }} />

                <div style={{ position:"relative", display:"flex", alignItems:"center", gap:24, padding:"24px 30px", flexWrap:"wrap" }}>

                  {/* Identity */}
                  <div style={{ display:"flex", alignItems:"center", gap:18, flex:1, minWidth:260 }}>
                    <div style={{ position:"relative", flexShrink:0 }}>
                      <div style={{
                        width:70, height:70, borderRadius:"50%",
                        background:"#fff", color:C.blue.solid, display:"grid", placeItems:"center",
                        fontSize:28, fontWeight:800, fontFamily:DISPLAY_FONT,
                        boxShadow:"0 10px 24px rgba(0,0,0,0.22)",
                      }}>{initial}</div>
                      <div style={{ position:"absolute", right:2, bottom:2, width:16, height:16, borderRadius:"50%", background:"#22e39b", border:"3px solid #2f6bff" }} />
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9, flexWrap:"wrap" }}>
                        <h3 style={{ margin:0, fontSize:22, fontWeight:700, fontFamily:DISPLAY_FONT, letterSpacing:"-0.02em", color:"#fff" }}>
                          {user?.name || "Learner"}
                        </h3>
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:6, padding:"4px 11px",
                          borderRadius:99, background:"rgba(255,255,255,0.2)", color:"#fff",
                          fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em",
                        }}>
                          <LevelIcon size={12} color="#fff" /> {s.levelConfig.name}
                        </span>
                      </div>
                      <p style={{ margin:"4px 0 0", fontSize:12.5, color:"rgba(255,255,255,0.78)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {user?.email || ""}
                      </p>
                      <div style={{ marginTop:11, display:"inline-flex", alignItems:"center", gap:8, padding:"6px 12px", borderRadius:10, background:"rgba(255,255,255,0.16)", border:"1px solid rgba(255,255,255,0.22)" }}>
                        <span style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.72)", textTransform:"uppercase", letterSpacing:"0.1em" }}>Learning</span>
                        <span style={{ fontSize:12.5, fontWeight:800, color:"#fff" }}>{s.langEmoji} {s.langLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* XP / next level */}
                  <div style={{ width:300, maxWidth:"100%", flexShrink:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.78)", textTransform:"uppercase", letterSpacing:"0.1em" }}>XP Progress</span>
                      <span style={{ fontSize:11, fontWeight:800, color:C.blue.solid, background:"#fff", padding:"2px 9px", borderRadius:5, fontFamily:DISPLAY_FONT }}>{s.xp} / {s.nextLevelXP}</span>
                    </div>
                    <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,0.25)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${Math.min(100,(s.xp/s.nextLevelXP)*100)}%`, background:"#fff", boxShadow:"0 0 12px rgba(255,255,255,0.7)", transition:"width .8s cubic-bezier(.4,0,.2,1)" }} />
                    </div>
                    {s.nextLevelConfig && (
                      <div style={{ marginTop:11, display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:10, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.2)" }}>
                        <Target size={14} color="#fff" style={{ flexShrink:0 }} />
                        <p style={{ margin:0, fontSize:10.5, color:"rgba(255,255,255,0.85)", lineHeight:1.35 }}>
                          <strong style={{ color:"#fff" }}>Next: {s.nextLevelConfig.name}</strong> — {s.nextLevelConfig.requirements}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Glass>

              {/* ══ HERO: Streak banner ══ */}
              <Glass style={{ padding:"22px 28px", position:"relative", overflow:"hidden" }}>
                {/* faded flame watermark */}
                <div style={{ position:"absolute", top:-34, right:-16, opacity:0.06, pointerEvents:"none", transform:"rotate(8deg)" }}>
                  <Flame size={168} color={C.flame.solid} fill={C.flame.solid} />
                </div>

                <div style={{ position:"relative", display:"flex", alignItems:"center", gap:26, flexWrap:"wrap" }}>

                  {/* Flame + days */}
                  <div style={{ display:"flex", alignItems:"center", gap:15, flexShrink:0 }}>
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute", inset:-7, borderRadius:20, background:C.flame.solid, opacity:0.20, filter:"blur(11px)" }} />
                      <div style={{ position:"relative", width:58, height:58, borderRadius:16, background:C.flame.grad, display:"grid", placeItems:"center", boxShadow:"0 8px 22px rgba(255,107,53,0.42)" }}>
                        <Flame size={27} color="#fff" fill="#fff" />
                      </div>
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:9, fontWeight:700, color:"rgba(0,0,0,0.45)", textTransform:"uppercase", letterSpacing:"0.12em" }}>Learning Streak</p>
                      <div style={{ display:"flex", alignItems:"baseline", gap:5, marginTop:3 }}>
                        <span style={{ fontSize:36, fontWeight:900, color:"#0a0a0a", fontFamily:DISPLAY_FONT, letterSpacing:"-0.02em", lineHeight:1 }}>{s.streak}</span>
                        <span style={{ fontSize:14, fontWeight:700, color:"rgba(0,0,0,0.4)" }}>day{s.streak !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  {/* Day chain on a connecting track (center, grows) */}
                  <div style={{ flex:1, minWidth:250, position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 8px" }}>
                    <div style={{ position:"absolute", left:24, right:24, top:"50%", height:3, background:"rgba(0,0,0,0.07)", transform:"translateY(-50%)", borderRadius:99 }} />
                    {DAYS.map((d, i) => {
                      const isToday = i === s.todayDayIndex;
                      const inStreak = i >= (s.todayDayIndex - s.streak + 1) && i <= s.todayDayIndex;
                      return (
                        <div key={i} style={{
                          position:"relative",
                          width:38, height:38, borderRadius:"50%", display:"grid", placeItems:"center",
                          background: inStreak ? C.flame.grad : "#fff",
                          border: inStreak ? "none" : "2px solid rgba(0,0,0,0.1)",
                          boxShadow: isToday ? `0 0 0 3px #fff, 0 0 0 5px ${C.flame.solid}` : inStreak ? "0 4px 10px rgba(255,107,53,0.35)" : "none",
                          transition:"all .3s cubic-bezier(0.34,1.56,0.64,1)", flexShrink:0,
                        }}>
                          {inStreak
                            ? <Flame size={15} color="#fff" fill="#fff" />
                            : <span style={{ fontSize:10, fontWeight:800, color:"rgba(0,0,0,0.3)" }}>{d}</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* This-week ring (right) */}
                  <div style={{ display:"flex", alignItems:"center", gap:13, flexShrink:0 }}>
                    <div style={{ position:"relative", width:66, height:66, display:"grid", placeItems:"center" }}>
                      <div style={{ position:"absolute", inset:0 }}>
                        <Ring pct={Math.min(100, Math.round(Math.min(s.streak,7)/7*100))} size={66} stroke={6} color={C.flame.solid} />
                      </div>
                      <div style={{ fontSize:16, fontWeight:900, color:"#0a0a0a", fontFamily:DISPLAY_FONT, lineHeight:1 }}>
                        {Math.min(s.streak,7)}<span style={{ fontSize:10, fontWeight:700, color:"rgba(0,0,0,0.4)" }}>/7</span>
                      </div>
                    </div>
                    <div style={{ maxWidth:140 }}>
                      <p style={{ margin:0, fontSize:10, fontWeight:700, color:"rgba(0,0,0,0.45)", textTransform:"uppercase", letterSpacing:"0.1em" }}>This Week</p>
                      <p style={{ margin:"4px 0 0", fontSize:11, fontWeight:600, color:"rgba(0,0,0,0.55)", lineHeight:1.35 }}>
                        {s.streak >= 7 ? "Perfect week! 🏆" : `${7 - s.streak} more to a perfect week 🔥`}
                      </p>
                    </div>
                  </div>
                </div>
              </Glass>

              {/* ══ CONTINUE LEARNING CARD (WITH CAROUSEL) ══ */}
              <Glass style={{ padding:0, overflow:"hidden" }}>
                {/* Header strip */}
                <div style={{ padding:"14px 24px 12px", borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.18em" }}>My Learning</p>
                </div>

                {/* Carousel Container */}
                <div style={{ padding:"20px 24px 24px", position:"relative" }}>
                  {learningPaths && learningPaths.length > 0 ? (
                    <>
                      {/* Carousel */}
                      <div style={{ display:"flex", alignItems:"center", gap:24 }}>
                        {/* Left Arrow */}
                        {learningPaths.length > 1 && (
                          <button
                            onClick={() => setCurrentLearningIndex((prev) => (prev - 1 + learningPaths.length) % learningPaths.length)}
                            style={{
                              flexShrink: 0,
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: "none",
                              background: "rgba(0,0,0,0.15)",
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center",
                              transition: "all 0.2s ease",
                              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "rgba(0,0,0,0.25)";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "rgba(0,0,0,0.15)";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            <ChevronRight size={20} color="#111111" style={{ transform: "rotate(180deg)" }} />
                          </button>
                        )}

                        {/* Card Content */}
                        {(() => {
                          const currentPath = learningPaths[currentLearningIndex];
                          const tasks = currentPath?.tasks || [];
                          const done = tasks.filter(t => t.status === "completed").length;
                          const totalTasks = tasks.length;
                          const pct = totalTasks ? Math.round((done / totalTasks) * 100) : 0;
                          const langKey = (currentPath?.language || "python").toLowerCase();
                          const langLabel = getLanguageLabel(langKey);
                          const langEmoji = getLangEmoji(langKey);
                          const langColor = getLangColor(langKey);
                          const latestAttempt = attempts.find(a => a.language?.toLowerCase() === langKey);
                          const proficiencyLevel = latestAttempt?.proficiencyLevel || status?.proficiencyLevel || "beginner";
                          const levelConfig = PROFICIENCY_CONFIG[proficiencyLevel?.toLowerCase()] || PROFICIENCY_CONFIG.beginner;

                          return (
                            <div style={{ flex:1, display:"flex", alignItems:"center", gap:24, animation: "fadeUp 0.3s ease" }}>
                              {/* Lang badge */}
                              <div style={{ width:80, height:80, borderRadius:18, flexShrink:0,
                                background: langColor,
                                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                                boxShadow:`0 12px 32px ${langColor}55`, gap:2 }}>
                                <span style={{ fontSize:28, lineHeight:1 }}>{langEmoji}</span>
                                <span style={{ color:"#fff", fontSize:9, fontWeight:800,
                                  textTransform:"uppercase", letterSpacing:"0.06em", opacity:0.85 }}>
                                  {langLabel.substring(0, 6)}
                                </span>
                              </div>

                              {/* Info */}
                              <div style={{ flex:1 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                                  <p style={{ margin:0, color:"#0a0a0a", fontWeight:800, fontSize:18,
                                    letterSpacing:"-0.02em" }}>{langLabel}</p>
                                  <span style={{ padding:"2px 10px", borderRadius:99, fontSize:10, fontWeight:700,
                                    background:"rgba(0,0,0,0.15)", color:"#111111",
                                    textTransform:"uppercase", letterSpacing:"0.08em" }}>{levelConfig.name}</span>
                                  <span style={{ fontSize: 12 }}>{levelConfig.badge}</span>
                                </div>
                                <p style={{ margin:"0 0 14px", color:"rgba(0,0,0,0.5)", fontSize:13 }}>
                                  {done} of {totalTasks} tasks completed • {pct}% complete
                                </p>

                                {/* Progress bar */}
                                <div style={{ height:6, borderRadius:99, background:"rgba(0,0,0,0.08)",
                                  overflow:"hidden", maxWidth:320 }}>
                                  <div style={{ height:"100%", borderRadius:99, width:`${pct}%`,
                                    background:C.blue.grad,
                                    transition:"width 1s cubic-bezier(.4,0,.2,1)" }} />
                                </div>
                              </div>

                              {/* Ring + Continue button */}
                              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, flexShrink:0 }}>
                                <div style={{ position:"relative", width:60, height:60,
                                  display:"grid", placeItems:"center" }}>
                                  <div style={{ position:"absolute", inset:0 }}>
                                    <Ring pct={pct} size={60} stroke={5} color={langColor} />
                                  </div>
                                  <span style={{ color:"#0a0a0a", fontWeight:800, fontSize:13, position:"relative" }}>
                                    {pct}%
                                  </span>
                                </div>

                                <button className="continue-btn" onClick={() => navigate("/learning-path")} style={{
                                  padding:"12px 22px", borderRadius:12, border:"none", cursor:"pointer",
                                  background:`linear-gradient(135deg, #2f6bff, #4da2ff)`,
                                  color:"#ffffff", fontWeight:800, fontSize:14,
                                  display:"inline-flex", alignItems:"center", gap:8,
                                  boxShadow:"0 8px 24px rgba(0,0,0,0.3)",
                                  whiteSpace:"nowrap",
                                }}>
                                  <Play size={14} fill="#ffffff" /> Continue Learning
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Right Arrow */}
                        {learningPaths.length > 1 && (
                          <button
                            onClick={() => setCurrentLearningIndex((prev) => (prev + 1) % learningPaths.length)}
                            style={{
                              flexShrink: 0,
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: "none",
                              background: "rgba(0,0,0,0.15)",
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center",
                              transition: "all 0.2s ease",
                              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "rgba(0,0,0,0.25)";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "rgba(0,0,0,0.15)";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            <ChevronRight size={20} color="#111111" />
                          </button>
                        )}
                      </div>

                      {/* Carousel Indicator */}
                      {learningPaths.length > 1 && (
                        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 8 }}>
                          {learningPaths.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentLearningIndex(index)}
                              style={{
                                width: currentLearningIndex === index ? 28 : 8,
                                height: 8,
                                borderRadius: 4,
                                border: "none",
                                background: currentLearningIndex === index ? "#0a0a0a" : "rgba(0,0,0,0.15)",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: currentLearningIndex === index ? "0 4px 12px rgba(0,0,0,0.3)" : "none"
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Current task hint */}
                      {(() => {
                        const currentPath = learningPaths[currentLearningIndex];
                        const tasks = currentPath?.tasks || [];
                        const daily = tasks.find(t => t.status === "unlocked") || tasks[0] || null;
                        return daily ? (
                          <div style={{ margin:"20px 0 0", padding:"12px 16px", borderRadius:12,
                            background:"rgba(0,0,0,0.04)",
                            display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:"#0a0a0a",
                              flexShrink:0, animation:"pulse 2s ease-in-out infinite" }} />
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:10, fontWeight:700,
                                textTransform:"uppercase", letterSpacing:"0.12em" }}>Up next</p>
                              <p style={{ margin:"2px 0 0", color:"rgba(0,0,0,0.7)", fontSize:13, fontWeight:600,
                                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {daily.title}
                              </p>
                            </div>
                            <StatusPill status={daily.status} />
                          </div>
                        ) : null;
                      })()}
                    </>
                  ) : (
                    <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(0,0,0,0.5)" }}>
                      <p style={{ margin:0, fontWeight:600, fontSize:14 }}>No learning paths yet</p>
                      <p style={{ margin:"8px 0 0", fontSize:12 }}>Take an assessment to start learning</p>
                    </div>
                  )}
                </div>
              </Glass>

              {/* ══ CYCLE QUIZ CARD ══ */}
              {(() => {
                const qp = learningPaths[currentLearningIndex];
                if (!qp) return null;
                const qTasks = qp.tasks || [];
                const qTotal = qTasks.length;
                const qDone = qTasks.filter((t) => t.status === "completed").length;
                const qAllDone = qTotal > 0 && qDone === qTotal;
                const passed = qp.quiz?.status === "passed";
                const qScore = qp.quiz?.lastScore;
                const qLang = qp.language;
                const qLabel = getLanguageLabel(qLang);
                const pct = qTotal ? Math.round((qDone / qTotal) * 100) : 0;
                const btnStyle = {
                  padding: "11px 22px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #2f6bff, #4da2ff)", color: "#ffffff",
                  fontWeight: 800, fontSize: 13, whiteSpace: "nowrap",
                };

                return (
                  <Glass style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: qAllDone ? C.blue.grad : "rgba(0,0,0,0.05)",
                        display: "grid", placeItems: "center",
                        boxShadow: qAllDone ? "0 8px 22px rgba(47,107,255,0.30)" : "none",
                      }}>
                        {qAllDone ? <Award size={24} color="#ffffff" /> : <Lock size={22} color="rgba(0,0,0,0.35)" />}
                      </div>

                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#0a0a0a" }}>Cycle Quiz</p>
                          <span style={{
                            padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                            background: "rgba(0,0,0,0.15)", color: "#111111", textTransform: "uppercase", letterSpacing: "0.06em",
                          }}>{qLabel}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "rgba(0,0,0,0.55)", lineHeight: 1.45 }}>
                          {passed
                            ? `Passed with ${qScore}/100 — start the next cycle for a fresh set of questions.`
                            : qAllDone
                              ? "All tasks done! Take the quiz: 7 MCQs + 3 coding challenges. Score 80% to advance."
                              : `Complete all ${qTotal} tasks to unlock the quiz — ${qDone}/${qTotal} done.`}
                        </p>
                        {!qAllDone && (
                          <div style={{ height: 6, borderRadius: 99, background: "rgba(0,0,0,0.08)", overflow: "hidden", marginTop: 10, maxWidth: 360 }}>
                            <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: C.blue.grad }} />
                          </div>
                        )}
                      </div>

                      <div style={{ flexShrink: 0 }}>
                        {!qAllDone ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px",
                            borderRadius: 10, background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.4)", fontWeight: 700, fontSize: 13,
                          }}>
                            <Lock size={14} /> Locked
                          </span>
                        ) : passed ? (
                          <button style={btnStyle} disabled={advancing} onClick={() => handleAdvanceCycle(qLang)}>
                            {advancing ? "Generating…" : "Start Next Cycle"}
                          </button>
                        ) : (
                          <button style={btnStyle} onClick={() => { setQuizLang(qLang); setShowQuiz(true); }}>
                            Take Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  </Glass>
                );
              })()}

              {/* ══ 3 STAT CARDS ══ */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                {[
                  { label:"Quiz Mastery",    value: s.quizzes,    sub:`Latest: ${s.score}`,                        c: C.violet, Icon: TrendingUp,   description: "Attempts to improve" },
                  { label:"Tasks Completed", value: s.totalTasks, sub:`${s.unlocked} unlocked`,                     c: C.green,  Icon: CheckCircle2, description: `${s.done} of ${s.totalTasks} done` },
                  { label:"XP Earned",       value:`${s.xp}`,     sub:`${s.nextLevelXP - s.xp} XP to next level`,  c: C.amber,  Icon: Award,        description: "Total experience points" },
                ].map(({ label, value, sub, c, Icon, description }) => (
                  <Glass key={label} className="stat-card" style={{ padding:0, overflow:"hidden" }}>
                    <div style={{ height:3, background:c.grad }} />
                    <div style={{ padding:22 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                        <div>
                          <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700,
                            textTransform:"uppercase", letterSpacing:"0.14em" }}>{label}</p>
                          <p style={{ margin:"2px 0 0", fontSize:10, color: "rgba(0,0,0,0.4)" }}>{description}</p>
                        </div>
                        <div style={{ width:38, height:38, borderRadius:11, background: c.soft,
                          display:"grid", placeItems:"center" }}>
                          <Icon size={17} color={c.solid} />
                        </div>
                      </div>
                      <p style={{ margin:0, color:"#0a0a0a", fontSize:36, fontWeight:900,
                        letterSpacing:"-0.03em", lineHeight:1, fontFamily:DISPLAY_FONT }}>{value}</p>
                      <p style={{ margin:"8px 0 0", color:"rgba(0,0,0,0.4)", fontSize:12 }}>{sub}</p>
                    </div>
                  </Glass>
                ))}
              </div>

              {/* Proficiency Achievement Banner */}
              <Glass style={{ background: "linear-gradient(135deg, #f7f7f7, #ffffff)", padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:C.blue.grad, display:"grid", placeItems:"center", flexShrink:0, boxShadow:"0 8px 22px rgba(47,107,255,0.30)" }}>
                    <LevelIcon size={26} color="#ffffff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Sparkles size={16} color={s.levelConfig.color} />
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: s.levelConfig.color }}>
                        {s.levelConfig.name} Level Achievements
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(0,0,0,0.6)" }}>
                      {s.level === "beginner" && "🎯 Complete more tasks and assessments to level up your skills!"}
                      {s.level === "intermediate" && "⚡ Great progress! You're mastering the fundamentals!"}
                      {s.level === "advanced" && "🚀 Exceptional work! Complex concepts are becoming clear!"}
                      {s.level === "expert" && "🏆 Outstanding! You're ready for advanced challenges!"}
                      {s.level === "master" && "👑 Legendary! You've reached the highest mastery level!"}
                    </p>
                  </div>
                  {s.nextLevelConfig && (
                    <button 
                      onClick={() => setActiveView("assessment")}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 12,
                        border: "none",
                        background: C.blue.grad,
                        color: "white",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 8px 22px rgba(47,107,255,0.30)"
                      }}
                    >
                      Level Up <Zap size={14} />
                    </button>
                  )}
                </div>
              </Glass>
            </div>
          )}

          {/* ── PROGRESS (Enhanced) ── */}
          {activeView === "progress" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Proficiency overview — blue banner */}
              <Glass style={{ padding:0, overflow:"hidden", position:"relative", border:"none",
                background:"linear-gradient(120deg,#1e5cff 0%,#2f6bff 45%,#4da2ff 100%)",
                boxShadow:"0 16px 40px rgba(47,107,255,0.28)" }}>
                <div style={{ position:"absolute", top:-70, right:-20, width:230, height:230, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.20),transparent 70%)", pointerEvents:"none" }} />
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 10% 15%, rgba(255,255,255,0.14), transparent 45%)", pointerEvents:"none" }} />
                <div style={{ position:"relative", display:"flex", alignItems:"center", gap:22, padding:"26px 30px", flexWrap:"wrap" }}>
                  <div style={{ width:68, height:68, borderRadius:18, background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.3)", display:"grid", placeItems:"center", flexShrink:0 }}>
                    <LevelIcon size={31} color="#fff" />
                  </div>
                  <div style={{ flex:1, minWidth:250 }}>
                    <p style={{ margin:0, fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.75)", textTransform:"uppercase", letterSpacing:"0.14em" }}>Current Level</p>
                    <h3 style={{ margin:"3px 0 0", fontSize:24, fontWeight:700, color:"#fff", fontFamily:DISPLAY_FONT, letterSpacing:"-0.02em" }}>{s.levelConfig.name}</h3>
                    <p style={{ margin:"4px 0 13px", fontSize:12.5, color:"rgba(255,255,255,0.8)" }}>{s.levelConfig.description}</p>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.75)", textTransform:"uppercase", letterSpacing:"0.1em" }}>XP Progress</span>
                      <span style={{ fontSize:11, fontWeight:800, color:C.blue.solid, background:"#fff", padding:"2px 9px", borderRadius:5, fontFamily:DISPLAY_FONT }}>{s.xp} / {s.nextLevelXP}</span>
                    </div>
                    <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,0.25)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${Math.min(100,(s.xp/s.nextLevelXP)*100)}%`, background:"#fff", boxShadow:"0 0 12px rgba(255,255,255,0.7)", transition:"width .8s cubic-bezier(.4,0,.2,1)" }} />
                    </div>
                  </div>
                </div>
              </Glass>

              {/* Colored stat cards */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                {[
                  { label:"Total XP",   value:`${s.xp}`,                  c:C.blue,  Icon:Award,        description:"Experience earned" },
                  { label:"Tasks Done", value:`${s.done}/${s.totalTasks}`, c:C.green, Icon:CheckCircle2, description:"Across all paths" },
                  { label:"Day Streak", value:`${s.streak}`,              c:C.flame, Icon:Flame,        description:"Keep it going" },
                ].map(({ label, value, c, Icon, description }) => (
                  <Glass key={label} className="stat-card" style={{ padding:0, overflow:"hidden" }}>
                    <div style={{ height:3, background:c.grad }} />
                    <div style={{ padding:22 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                        <div>
                          <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em" }}>{label}</p>
                          <p style={{ margin:"2px 0 0", fontSize:10, color:"rgba(0,0,0,0.4)" }}>{description}</p>
                        </div>
                        <div style={{ width:38, height:38, borderRadius:11, background:c.soft, display:"grid", placeItems:"center" }}>
                          <Icon size={17} color={c.solid} />
                        </div>
                      </div>
                      <p style={{ margin:0, color:"#0a0a0a", fontSize:36, fontWeight:900, letterSpacing:"-0.03em", lineHeight:1, fontFamily:DISPLAY_FONT }}>{value}</p>
                    </div>
                  </Glass>
                ))}
              </div>

              {/* Course completion */}
              <Glass>
                <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
                  <div style={{ position:"relative", width:90, height:90, display:"grid", placeItems:"center", flexShrink:0 }}>
                    <div style={{ position:"absolute", inset:0 }}>
                      <Ring pct={s.pct} size={90} stroke={8} color={C.blue.solid} />
                    </div>
                    <div style={{ fontSize:21, fontWeight:900, color:"#0a0a0a", fontFamily:DISPLAY_FONT }}>{s.pct}%</div>
                  </div>
                  <div style={{ flex:1, minWidth:220 }}>
                    <p style={{ margin:0, color:"#0a0a0a", fontWeight:700, fontSize:16, fontFamily:DISPLAY_FONT }}>Course Completion</p>
                    <p style={{ margin:"4px 0 14px", color:"rgba(0,0,0,0.5)", fontSize:13 }}>{s.done} of {s.totalTasks} tasks completed</p>
                    <div style={{ height:8, borderRadius:99, background:"rgba(0,0,0,0.08)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${s.pct}%`, background:C.blue.grad, transition:"width .8s cubic-bezier(.4,0,.2,1)" }} />
                    </div>
                  </div>
                </div>
              </Glass>
            </div>
          )}

          {/* ── ASSESSMENT (Enhanced with Modal) ── */}
          {activeView === "assessment" && (() => {
            // Calculate last and best scores
            const lastAttempt = attempts.length > 0 ? attempts[0] : null;
            const lastScore = lastAttempt?.score || 0;
            const totalQuestions = lastAttempt?.totalQuestions || 15;
            const lastPercentage = totalQuestions > 0 ? Math.round((lastScore / totalQuestions) * 100) : 0;
            const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0;
            
            // Determine level based on last score percentage
            const getLevelFromScore = (percentage) => {
              if (percentage >= 85) return PROFICIENCY_CONFIG.advanced;
              if (percentage >= 70) return PROFICIENCY_CONFIG.intermediate;
              return PROFICIENCY_CONFIG.beginner;
            };
            
            const lastScoreConfig = getLevelFromScore(lastPercentage);

            return (
              <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                  {/* Last Score */}
                  <Glass className="stat-card" style={{ padding:0, overflow:"hidden" }}>
                    <div style={{ height:3, background:C.blue.grad }} />
                    <div style={{ padding:22 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                        <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em" }}>Last Score</p>
                        <div style={{ width:38, height:38, borderRadius:11, background:C.blue.soft, display:"grid", placeItems:"center" }}><BarChart3 size={17} color={C.blue.solid} /></div>
                      </div>
                      <p style={{ margin:0, color:"#0a0a0a", fontSize:32, fontWeight:900, letterSpacing:"-0.03em", lineHeight:1, fontFamily:DISPLAY_FONT }}>{lastScore}/{totalQuestions}</p>
                      <div style={{ marginTop:11, display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:99, background:C.blue.soft }}>
                        <span style={{ fontSize:11, fontWeight:800, color:C.blue.solid }}>{lastPercentage}%</span>
                      </div>
                    </div>
                  </Glass>

                  {/* Best Score */}
                  <Glass className="stat-card" style={{ padding:0, overflow:"hidden" }}>
                    <div style={{ height:3, background:C.amber.grad }} />
                    <div style={{ padding:22 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                        <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em" }}>Best Score</p>
                        <div style={{ width:38, height:38, borderRadius:11, background:C.amber.soft, display:"grid", placeItems:"center" }}><Trophy size={17} color={C.amber.solid} /></div>
                      </div>
                      <p style={{ margin:0, color:"#0a0a0a", fontSize:32, fontWeight:900, letterSpacing:"-0.03em", lineHeight:1, fontFamily:DISPLAY_FONT }}>{bestScore}/{totalQuestions}</p>
                      <p style={{ margin:"11px 0 0", color:"rgba(0,0,0,0.45)", fontSize:12, fontWeight:600 }}>{attempts.length} attempt{attempts.length !== 1 ? "s" : ""}</p>
                    </div>
                  </Glass>

                  {/* Current Level */}
                  <Glass className="stat-card" style={{ padding:0, overflow:"hidden" }}>
                    <div style={{ height:3, background:C.violet.grad }} />
                    <div style={{ padding:22 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                        <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em" }}>Current Level</p>
                        <div style={{ width:38, height:38, borderRadius:11, background:C.violet.soft, display:"grid", placeItems:"center" }}><Star size={17} color={C.violet.solid} /></div>
                      </div>
                      <p style={{ margin:0, color:"#0a0a0a", fontSize:24, fontWeight:900, letterSpacing:"-0.02em", lineHeight:1, fontFamily:DISPLAY_FONT }}>{lastScoreConfig.name}</p>
                      <p style={{ margin:"9px 0 0", color:"rgba(0,0,0,0.45)", fontSize:12, fontWeight:600, lineHeight:1.4 }}>{lastScoreConfig.description}</p>
                    </div>
                  </Glass>
                </div>

                {/* Action Card */}
                <Glass>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:C.blue.soft, display:"grid", placeItems:"center", flexShrink:0 }}><BarChart3 size={20} color={C.blue.solid} /></div>
                      <div>
                        <h3 style={{ margin:"0 0 3px", color:"#0a0a0a", fontWeight:800, fontSize:16, fontFamily:DISPLAY_FONT }}>Assessment History</h3>
                        <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:12.5 }}>Track all your assessment attempts</p>
                      </div>
                    </div>
                    {attempts.length > 0 && (
                      <button onClick={() => setShowAssessmentModal(true)} style={{
                        padding:"10px 18px", borderRadius:10, border:`1px solid ${C.blue.solid}33`,
                        background:C.blue.soft, color:C.blue.solid, fontWeight:700, fontSize:12,
                        cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.06em",
                      }}>
                        See All Details
                      </button>
                    )}
                  </div>
                </Glass>

                {/* Readiness Card */}
                <Glass>
                  <h3 style={{ margin:"0 0 8px", color:"#0a0a0a", fontWeight:800, fontSize:17, fontFamily:DISPLAY_FONT }}>Ready to level up?</h3>
                  <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:14, lineHeight:1.65 }}>
                    Taking assessments helps us gauge your proficiency and unlock more challenging content tailored to your skill level.
                  </p>
                  <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, background:C.blue.soft, border:`1px solid ${C.blue.solid}22` }}>
                    <Sparkles size={16} color={C.blue.solid} style={{ flexShrink:0 }} />
                    <p style={{ margin:0, fontSize:12.5, color:"rgba(0,0,0,0.6)", fontWeight:600 }}>
                      Tip: Score 80% or higher to advance to the next proficiency level!
                    </p>
                  </div>
                  <button onClick={() => navigate("/assessment")} style={{
                    marginTop:22, padding:"12px 26px", borderRadius:12, border:"none",
                    background:"linear-gradient(135deg, #2f6bff, #4da2ff)",
                    color:"#ffffff", fontWeight:800, fontSize:14,
                    cursor:"pointer", display:"inline-flex", alignItems:"center", gap:9,
                    boxShadow:"0 8px 24px rgba(47,107,255,0.3)",
                  }}>
                    Start Assessment <ArrowRight size={15} />
                  </button>
                </Glass>

              {/* Assessment History Modal */}
              {showAssessmentModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  background: "transparent",
                  display: "grid",
                  placeItems: "center",
                  zIndex: 100,
                  padding: "20px"
                }}>
                  <div style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 32,
                    maxWidth: 600,
                    width: "100%",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)",
                    animation: "fadeUp 0.3s ease"
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                      <h2 style={{ margin: 0, color: "#0a0a0a", fontSize: 22, fontWeight: 900 }}>
                        Assessment History
                      </h2>
                      <button onClick={() => setShowAssessmentModal(false)} style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 18,
                        color: "rgba(0,0,0,0.4)",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(0,0,0,0.05)";
                      }}>
                        ✕
                      </button>
                    </div>

                    {/* Assessment List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {attempts.length > 0 ? (
                        attempts.map((attempt, index) => {
                          const score = attempt.score || 0;
                          const total = attempt.totalQuestions || 0;
                          const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                          const language = attempt.language || "Unknown";
                          const dateAttempted = new Date(attempt.createdAt || new Date());
                          const langEmoji = getLangEmoji(language.toLowerCase());
                          
                          return (
                            <div key={index} style={{
                              padding: 16,
                              borderRadius: 14,
                              background: "linear-gradient(135deg, rgba(0,0,0,0.08), rgba(0,0,0,0.02))",
                              border: "1px solid rgba(0,0,0,0.2)",
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,0,0,0.15), rgba(0,0,0,0.05))";
                              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,0,0,0.08), rgba(0,0,0,0.02))";
                              e.currentTarget.style.boxShadow = "none";
                            }}>
                              {/* Language & Number */}
                              <div style={{
                                width: 50,
                                height: 50,
                                borderRadius: 12,
                                background: getLangColor(language.toLowerCase()),
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 2,
                                flexShrink: 0,
                                color: "white",
                                fontWeight: 800,
                                fontSize: 12
                              }}>
                                <span style={{ fontSize: 18 }}>{langEmoji}</span>
                                <span style={{ fontSize: 9, opacity: 0.8 }}>#{attempts.length - index}</span>
                              </div>

                              {/* Info */}
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, color: "#0a0a0a", fontWeight: 700, fontSize: 14 }}>
                                  {language.toUpperCase()}
                                </p>
                                <p style={{ margin: "2px 0 0", color: "rgba(0,0,0,0.5)", fontSize: 11 }}>
                                  {dateAttempted.toLocaleDateString()} at {dateAttempted.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>

                              {/* Score */}
                              <div style={{ textAlign: "center" }}>
                                <div style={{
                                  padding: "8px 14px",
                                  borderRadius: 10,
                                  background: percentage >= 80 ? "rgba(0,0,0,0.15)" : percentage >= 60 ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.15)",
                                  display: "inline-block"
                                }}>
                                  <p style={{ margin: 0, color: percentage >= 80 ? "#111111" : percentage >= 60 ? "#111111" : "#555555", fontWeight: 900, fontSize: 16 }}>
                                    {score}/{total}
                                  </p>
                                  <p style={{ margin: "2px 0 0", color: percentage >= 80 ? "#111111" : percentage >= 60 ? "#111111" : "#555555", fontWeight: 700, fontSize: 10 }}>
                                    {percentage}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ textAlign: "center", padding: 40, color: "rgba(0,0,0,0.4)" }}>
                          <p style={{ margin: 0, fontSize: 14 }}>No assessments completed yet</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Stats */}
                    {attempts.length > 0 && (
                      <div style={{
                        marginTop: 24,
                        paddingTop: 20,
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 12
                      }}>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, color: "rgba(0,0,0,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</p>
                          <p style={{ margin: "6px 0 0", color: "#0a0a0a", fontWeight: 900, fontSize: 20 }}>{attempts.length}</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, color: "rgba(0,0,0,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Best</p>
                          <p style={{ margin: "6px 0 0", color: "#111111", fontWeight: 900, fontSize: 20 }}>
                            {Math.max(...attempts.map(a => a.score || 0))}/{attempts[0]?.totalQuestions || 0}
                          </p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, color: "rgba(0,0,0,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Avg</p>
                          <p style={{ margin: "6px 0 0", color: "#111111", fontWeight: 900, fontSize: 20 }}>
                            {Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length || 0)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* ── LEARNING PATH (Enhanced) ── */}
          {activeView === "learningPath" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Roadmap summary header */}
              <Glass style={{ padding:"18px 22px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <div style={{ width:50, height:50, borderRadius:14, background:C.blue.grad, display:"grid", placeItems:"center", flexShrink:0, boxShadow:"0 8px 20px rgba(47,107,255,0.3)", fontSize:23 }}>{s.langEmoji}</div>
                  <div style={{ flex:1, minWidth:180 }}>
                    <p style={{ margin:0, fontSize:16, fontWeight:800, color:"#0a0a0a", fontFamily:DISPLAY_FONT }}>{s.langLabel} Roadmap</p>
                    <p style={{ margin:"3px 0 0", fontSize:12.5, color:"rgba(0,0,0,0.5)" }}>{s.done} of {s.totalTasks} tasks • {s.levelConfig.name} Level</p>
                  </div>
                  <span style={{ fontSize:28, fontWeight:900, color:C.blue.solid, fontFamily:DISPLAY_FONT, flexShrink:0 }}>{s.pct}%</span>
                  <button onClick={() => navigate("/learning-path")} style={{
                    padding:"10px 18px", borderRadius:10, border:`1px solid ${C.blue.solid}33`, cursor:"pointer",
                    background:C.blue.soft, color:C.blue.solid, fontWeight:700, fontSize:13,
                    display:"inline-flex", alignItems:"center", gap:8, flexShrink:0,
                  }}>
                    Full View <ArrowRight size={14} />
                  </button>
                </div>
                <div style={{ marginTop:16, height:7, borderRadius:99, background:"rgba(0,0,0,0.08)", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:99, width:`${s.pct}%`, background:C.blue.grad, transition:"width .8s cubic-bezier(.4,0,.2,1)" }} />
                </div>
              </Glass>

              {!learningPaths.length ? (
                <Glass style={{ textAlign:"center", padding:52 }}>
                  <Layers size={30} color="rgba(0,0,0,0.2)" style={{ margin:"0 auto 14px" }} />
                  <p style={{ margin:0, color:"rgba(0,0,0,0.6)", fontWeight:600, fontSize:15 }}>No learning path yet</p>
                  <p style={{ margin:"7px 0 0", color:"rgba(0,0,0,0.4)", fontSize:13 }}>Complete an assessment to generate your personalized learning path.</p>
                  <button onClick={() => setActiveView("assessment")} style={{
                    marginTop:22, padding:"11px 26px", borderRadius:12, border:"none",
                    background:"linear-gradient(135deg, #2f6bff, #4da2ff)",
                    color:"#ffffff", fontWeight:800, fontSize:13, cursor:"pointer",
                    boxShadow:"0 8px 24px rgba(47,107,255,0.3)",
                  }}>
                    Take Assessment
                  </button>
                </Glass>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {s.tasks.slice(0, 8).map((task, i) => (
                    <div key={task.taskId} className="task-row" style={{
                      padding:"15px 20px",
                      display:"flex", alignItems:"center", gap:16,
                      opacity: task.status === "locked" ? 0.55 : 1,
                      background:"#ffffff", border:"1px solid #e6e6e6",
                      borderLeft: task.status === "unlocked" ? `3px solid ${C.blue.solid}`
                        : task.status === "completed" ? `3px solid ${C.green.solid}`
                        : "1px solid #e6e6e6",
                    }}>
                      <div style={{ width:38, height:38, borderRadius:11, flexShrink:0,
                        display:"grid", placeItems:"center", fontWeight:800, fontSize:13, fontFamily:DISPLAY_FONT,
                        background: task.status === "completed" ? C.green.soft
                          : task.status === "unlocked" ? C.blue.soft
                          : "rgba(0,0,0,0.05)",
                        color: task.status === "completed" ? C.green.solid
                          : task.status === "unlocked" ? C.blue.solid
                          : "rgba(0,0,0,0.3)" }}>
                        {task.status === "completed" ? <CheckCircle2 size={17} /> : i + 1}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, color:"#0a0a0a", fontWeight:700, fontSize:14,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.title}</p>
                        <p style={{ margin:"3px 0 0", color:"rgba(0,0,0,0.45)", fontSize:12,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.description}</p>
                      </div>
                      <StatusPill status={task.status} />
                    </div>
                  ))}
                  {s.tasks.length > 8 && (
                    <div style={{ textAlign: "center", marginTop: 12 }}>
                      <button onClick={() => navigate("/learning-path")} style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: C.blue.solid,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer"
                      }}>
                        + {s.tasks.length - 8} more tasks →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── LEADERBOARD ── */}
          {activeView === "leaderboard" && (() => {
            const rows = leaderboard || [];
            const myId = String(user?.id || user?._id || "");
            const me = rows.find(r => String(r.userId) === myId) || null;
            const top = rows.slice(0, 3);
            const rest = rows.slice(3);
            const maxPoints = rows.length ? Math.max(...rows.map(r => r.points), 1) : 1;
            const podium = [top[1], top[0], top[2]];
            const initialOf = (n) => (n || "U").charAt(0).toUpperCase();

            return (
              <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>

                {/* Hero */}
                <Glass style={{ padding:0, overflow:"hidden", position:"relative", border:"none",
                  background:"linear-gradient(120deg,#7c5cff 0%,#2f6bff 48%,#ff6b9d 100%)",
                  boxShadow:"0 16px 40px rgba(124,92,255,0.32)" }}>
                  <div style={{ position:"absolute", top:-70, right:-20, width:230, height:230, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.22),transparent 70%)", pointerEvents:"none" }} />
                  <div style={{ position:"absolute", bottom:-90, left:120, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,0.12),transparent 70%)", pointerEvents:"none" }} />
                  <div style={{ position:"relative", display:"flex", alignItems:"center", gap:18, padding:"24px 30px", flexWrap:"wrap" }}>
                    <div style={{ width:60, height:60, borderRadius:18, background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)", display:"grid", placeItems:"center", flexShrink:0 }}>
                      <Trophy size={30} color="#fff" />
                    </div>
                    <div style={{ flex:1, minWidth:220 }}>
                      <h2 style={{ margin:0, fontSize:26, fontWeight:800, color:"#fff", fontFamily:DISPLAY_FONT, letterSpacing:"-0.02em" }}>Leaderboard</h2>
                      <p style={{ margin:"4px 0 0", fontSize:13, color:"rgba(255,255,255,0.88)" }}>Earn <strong>+5 points</strong> for every task you complete. Climb the ranks! 🚀</p>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 12px", borderRadius:99, background:"rgba(255,255,255,0.18)", color:"#fff", fontSize:11, fontWeight:800, letterSpacing:"0.08em" }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:"#22e39b", animation:"pulse 1.6s infinite" }} /> LIVE
                      </span>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.92)", fontSize:12, fontWeight:700 }}>
                        <Users size={14} color="#fff" /> {rows.length} player{rows.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Glass>

                {lbLoading && !rows.length ? (
                  <Glass style={{ textAlign:"center", padding:60 }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", border:"3px solid rgba(0,0,0,0.1)", borderTopColor:C.blue.solid, animation:"spin .8s linear infinite", margin:"0 auto" }} />
                    <p style={{ margin:"16px 0 0", color:"rgba(0,0,0,0.45)", fontSize:13 }}>Loading rankings…</p>
                  </Glass>
                ) : !rows.length ? (
                  <Glass style={{ textAlign:"center", padding:56 }}>
                    <div style={{ fontSize:44 }}>🏁</div>
                    <p style={{ margin:"10px 0 0", color:"#0a0a0a", fontWeight:800, fontSize:16, fontFamily:DISPLAY_FONT }}>No players on the board yet</p>
                    <p style={{ margin:"6px 0 0", color:"rgba(0,0,0,0.45)", fontSize:13 }}>Complete a task in your learning path to score your first points!</p>
                  </Glass>
                ) : (
                  <>
                    {/* Podium (top 3) */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, alignItems:"end" }}>
                      {podium.map((p, idx) => {
                        if (!p) return <div key={`empty-${idx}`} />;
                        const rs = RANK[p.rank] || RANK[3];
                        const h = p.rank === 1 ? 150 : p.rank === 2 ? 120 : 104;
                        const av = p.rank === 1 ? 84 : 66;
                        const isMe = String(p.userId) === myId;
                        return (
                          <div key={p.userId} style={{ textAlign:"center" }}>
                            <div style={{ position:"relative", width:av, height:av, margin:"0 auto 10px" }}>
                              {p.rank === 1 && <div style={{ position:"absolute", top:-20, left:"50%", transform:"translateX(-50%)", fontSize:26 }}>👑</div>}
                              <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:avatarGrad(p.name), display:"grid", placeItems:"center", color:"#fff", fontSize:p.rank===1?32:25, fontWeight:800, fontFamily:DISPLAY_FONT, border:`3px solid ${rs.ring}`, boxShadow:`0 8px 24px ${rs.glow}` }}>{initialOf(p.name)}</div>
                              <div style={{ position:"absolute", bottom:-6, right:-4, fontSize:22 }}>{rs.emoji}</div>
                            </div>
                            <p style={{ margin:0, fontSize:14, fontWeight:800, color:"#0a0a0a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {isMe ? "You" : (p.name || "Learner")}
                            </p>
                            <p style={{ margin:"2px 0 0", fontSize:11, color:"rgba(0,0,0,0.45)", fontWeight:600 }}>{p.level}</p>
                            <div style={{ marginTop:10, height:h, borderRadius:"16px 16px 0 0", background:rs.grad, boxShadow:`0 -6px 22px ${rs.glow}`, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:16, position:"relative", overflow:"hidden", outline: isMe ? "3px solid rgba(255,255,255,0.75)" : "none", outlineOffset:-3 }}>
                              <span style={{ fontSize:28, fontWeight:900, color:"#fff", fontFamily:DISPLAY_FONT, lineHeight:1 }}>{p.points}</span>
                              <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.9)", textTransform:"uppercase", letterSpacing:"0.12em", marginTop:3 }}>points</span>
                              <span style={{ position:"absolute", bottom:4, fontSize:34, fontWeight:900, color:"rgba(255,255,255,0.25)", fontFamily:DISPLAY_FONT }}>#{p.rank}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Your rank (if outside top 3) */}
                    {me && me.rank > 3 && (
                      <Glass style={{ padding:"16px 22px", border:`2px solid ${C.blue.solid}`, background:C.blue.soft }}>
                        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                          <span style={{ fontSize:18, fontWeight:900, color:C.blue.solid, fontFamily:DISPLAY_FONT, minWidth:34 }}>#{me.rank}</span>
                          <div style={{ width:44, height:44, borderRadius:"50%", background:avatarGrad(me.name), display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontFamily:DISPLAY_FONT, flexShrink:0 }}>{initialOf(me.name)}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ margin:0, fontWeight:800, fontSize:14, color:"#0a0a0a" }}>You · {me.points} pts</p>
                            <p style={{ margin:"2px 0 0", fontSize:12, color:"rgba(0,0,0,0.5)" }}>
                              {(() => { const above = rows.find(r => r.rank === me.rank - 1); const gap = above ? (above.points - me.points) : 0; return gap > 0 ? `${gap} pts to overtake #${me.rank - 1}` : "You're climbing fast!"; })()}
                            </p>
                          </div>
                          <Zap size={20} color={C.blue.solid} fill={C.blue.solid} />
                        </div>
                      </Glass>
                    )}

                    {/* Full rankings */}
                    {rest.length > 0 && (
                      <Glass style={{ padding:0, overflow:"hidden" }}>
                        <div style={{ padding:"14px 22px", borderBottom:"1px solid rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:8 }}>
                          <Medal size={16} color={C.violet.solid} />
                          <p style={{ margin:0, fontSize:12, fontWeight:800, color:"#0a0a0a", textTransform:"uppercase", letterSpacing:"0.12em" }}>All Rankings</p>
                        </div>
                        {rest.map((p) => {
                          const isMe = String(p.userId) === myId;
                          const barPct = Math.max(4, Math.round((p.points / maxPoints) * 100));
                          return (
                            <div key={p.userId} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 22px", borderBottom:"1px solid rgba(0,0,0,0.04)", background: isMe ? C.blue.soft : "transparent" }}>
                              <span style={{ minWidth:30, fontSize:14, fontWeight:900, color: isMe ? C.blue.solid : "rgba(0,0,0,0.35)", fontFamily:DISPLAY_FONT }}>{p.rank}</span>
                              <div style={{ width:42, height:42, borderRadius:"50%", background:avatarGrad(p.name), display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontSize:16, fontFamily:DISPLAY_FONT, flexShrink:0 }}>{initialOf(p.name)}</div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#0a0a0a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name || "Learner"}</p>
                                  {isMe && <span style={{ fontSize:9, fontWeight:800, color:"#fff", background:C.blue.solid, padding:"2px 7px", borderRadius:99, textTransform:"uppercase", letterSpacing:"0.08em" }}>You</span>}
                                </div>
                                <div style={{ marginTop:6, height:5, borderRadius:99, background:"rgba(0,0,0,0.07)", overflow:"hidden", maxWidth:280 }}>
                                  <div style={{ height:"100%", borderRadius:99, width:`${barPct}%`, background:avatarGrad(p.name) }} />
                                </div>
                              </div>
                              <div style={{ textAlign:"right", flexShrink:0 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:5, justifyContent:"flex-end" }}>
                                  <Zap size={13} color={C.amber.solid} fill={C.amber.solid} />
                                  <span style={{ fontSize:16, fontWeight:900, color:"#0a0a0a", fontFamily:DISPLAY_FONT }}>{p.points}</span>
                                </div>
                                <p style={{ margin:"1px 0 0", fontSize:10, color:"rgba(0,0,0,0.4)", fontWeight:600 }}>{p.tasksCompleted} tasks</p>
                              </div>
                            </div>
                          );
                        })}
                      </Glass>
                    )}

                    {/* How scoring works */}
                    <Glass style={{ padding:"16px 22px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <div style={{ width:40, height:40, borderRadius:11, background:C.amber.soft, display:"grid", placeItems:"center", flexShrink:0 }}><Zap size={19} color={C.amber.solid} fill={C.amber.solid} /></div>
                      <p style={{ margin:0, fontSize:13, color:"rgba(0,0,0,0.6)", flex:1, minWidth:200 }}>
                        <strong style={{ color:"#0a0a0a" }}>How scoring works:</strong> +5 points per completed task, +25 for passing a cycle quiz. Keep learning to climb! 🔥
                      </p>
                      <button onClick={() => setActiveView("learningPath")} style={{
                        padding:"10px 18px", borderRadius:10, border:"none", cursor:"pointer",
                        background:"linear-gradient(135deg, #2f6bff, #4da2ff)", color:"#fff", fontWeight:800, fontSize:13,
                        display:"inline-flex", alignItems:"center", gap:8, boxShadow:"0 8px 22px rgba(47,107,255,0.3)",
                      }}>
                        Earn points <ArrowRight size={14} />
                      </button>
                    </Glass>
                  </>
                )}
              </div>
            );
          })()}

        </div>
      </main>

      {/* Cycle Quiz Modal */}
      {showQuiz && quizLang && (user?.id || user?._id) && (
        <QuizModal
          language={quizLang}
          userId={user?.id || user?._id}
          onClose={() => { setShowQuiz(false); reloadLearningPaths(); }}
          onQuizPassed={() => reloadLearningPaths()}
        />
      )}

      {/* Rank-up celebration */}
      {rankCelebration && (
        <div style={{ position:"fixed", inset:0, zIndex:200, pointerEvents:"none", overflow:"hidden", display:"grid", placeItems:"center" }}>
          <style>{`
            @keyframes ru-pop {0%{transform:scale(0) translateY(20px);opacity:0}55%{transform:scale(1.12);opacity:1}100%{transform:scale(1) translateY(0)}}
            @keyframes ru-fall {0%{transform:translateY(-40px) rotate(0);opacity:1}100%{transform:translateY(108vh) rotate(680deg);opacity:0}}
            @keyframes ru-glow {0%,100%{text-shadow:0 0 26px rgba(47,107,255,0.7)}50%{text-shadow:0 0 52px rgba(124,92,255,1)}}
          `}</style>
          {rankConfetti.map((c, i) => (
            <span key={i} style={{ position:"absolute", left:c.left, top:"-5%", width:c.size, height:c.size, background:c.color, borderRadius:c.round?"50%":2, animation:`ru-fall ${c.dur}s ${c.delay}s ease-in forwards` }} />
          ))}
          <div style={{ animation:"ru-pop .6s cubic-bezier(.34,1.56,.64,1) both", textAlign:"center", padding:"30px 48px", borderRadius:24, background:"linear-gradient(135deg, rgba(20,24,40,0.94), rgba(34,40,66,0.94))", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", boxShadow:"0 24px 70px rgba(47,107,255,0.4)", border:"1px solid rgba(255,255,255,0.12)" }}>
            <div style={{ fontSize:46 }}>🚀</div>
            <div style={{ marginTop:8, fontSize:40, fontWeight:900, fontFamily:DISPLAY_FONT, color:"#fff", letterSpacing:"-0.02em", animation:"ru-glow 1.2s ease-in-out infinite" }}>RANK UP!</div>
            <div style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:12, fontFamily:DISPLAY_FONT, fontWeight:900 }}>
              <span style={{ fontSize:26, color:"rgba(255,255,255,0.4)" }}>#{rankCelebration.from}</span>
              <ArrowRight size={22} color="#22e39b" />
              <span style={{ fontSize:36, color:"#22e39b" }}>#{rankCelebration.to}</span>
            </div>
            <div style={{ marginTop:10, fontSize:13, color:"rgba(255,255,255,0.72)", fontWeight:600 }}>You climbed the leaderboard! 🔥</div>
          </div>
        </div>
      )}
    </div>
  );
}