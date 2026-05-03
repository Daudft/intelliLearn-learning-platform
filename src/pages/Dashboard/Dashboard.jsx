import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ClipboardList, Flame, Layers,
  LayoutDashboard, LogOut, Target, TrendingUp,
  BookOpen, CheckCircle2, Lock, Circle, ChevronRight, Play,
  Award, BarChart3, Sparkles, Star, Trophy, Zap,
  Brain, Rocket, Mountain, Compass, Crown
} from "lucide-react";
import assessmentService from "../../services/assessmentService";
import authService from "../../services/authService";
import learningPathService from "../../services/learningPathService";

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

function getLangColor(l) {
  return ({ python: "#3b82f6", java: "#f59e0b", c: "#8b5cf6" })[l?.toLowerCase()] || "#a3e635";
}

/* ─── Proficiency Level Configuration ─── */
const PROFICIENCY_CONFIG = {
  beginner: {
    name: "Beginner",
    icon: Compass,
    color: "#3b82f6",
    bgGradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
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
    color: "#f59e0b",
    bgGradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
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
    color: "#8b5cf6",
    bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
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
    color: "#ec4899",
    bgGradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
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
    color: "#fbbf24",
    bgGradient: "linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)",
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
    completed: { bg:"rgba(52,211,153,0.15)", color:"#059669", icon: <CheckCircle2 size={10} /> },
    unlocked:  { bg:"rgba(163,230,53,0.15)", color:"#7c3aed", icon: <Circle size={10} /> },
    locked:    { bg:"rgba(0,0,0,0.06)", color:"rgba(0,0,0,0.4)", icon: <Lock size={10} /> },
  };
  const { bg, color, icon } = map[status] || map.locked;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px",
      borderRadius:99, fontSize:11, fontWeight:700, background: bg, color }}>
      {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── Glass card ─── */
function Glass({ children, className = "", style = {} }) {
  return (
    <div className={className} style={{
      background:"rgba(255,255,255,0.7)",
      backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
      borderRadius:20, padding:24, border:"1px solid rgba(163,230,53,0.1)", ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Circular progress ring ─── */
function Ring({ pct = 0, size = 52, stroke = 4, color = "#a3e635" }) {
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
        <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700 }}>{xp} / {nextLevelXP} XP</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          borderRadius: 99,
          width: `${progress}%`,
          background: "linear-gradient(90deg, #a3e635, #34d399)",
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
];

const DAYS = ["M","T","W","T","F","S","S"];

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

  const pageBg = `#f5f5f4`;

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background: pageBg }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid rgba(163,230,53,0.5)",
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
        <p style={{ margin:0, color:"#0a1a0a", fontWeight:800, fontSize:18, fontFamily:"system-ui" }}>Something went wrong</p>
        <p style={{ margin:"10px 0 0", color:"rgba(0,0,0,0.5)", fontSize:13, fontFamily:"system-ui" }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop:24, padding:"11px 28px",
          borderRadius:12, background:"#a3e635", fontWeight:800, fontSize:13, color:"#0a1a0a", border:"none", cursor:"pointer" }}>
          Try again
        </button>
      </div>
    </div>
  );

  const initial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div style={{ minHeight:"100vh", display:"flex", background: pageBg,
      fontFamily:"'DM Sans', system-ui, sans-serif", position:"relative" }}>

      {/* Ambient orbs */}
      <div style={{ position:"fixed", top:-140, left:180, width:520, height:520, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(163,230,53,0.05) 0%, transparent 68%)",
        pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:-100, right:60, width:440, height:440, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(52,211,153,0.03) 0%, transparent 68%)",
        pointerEvents:"none", zIndex:0 }} />

      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(163,230,53,0.4);border-radius:4px}
        .nav-item{transition:all .2s ease}
        .nav-item:hover{background:rgba(163,230,53,0.1)!important;transform:translateX(4px)}
        .stat-card{transition:transform .2s,box-shadow .2s}
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.5)!important}
        .task-row{transition:all .2s ease}
        .task-row:hover{transform:translateX(8px);background:rgba(163,230,53,0.08)!important}
        .continue-btn{transition:transform .15s, box-shadow .15s}
        .continue-btn:hover{transform:translateY(-1px);box-shadow:0 12px 32px rgba(163,230,53,0.35)!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .38s ease both}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes glow{0%,100%{box-shadow:0 0 5px rgba(163,230,53,0.2)}50%{box-shadow:0 0 20px rgba(163,230,53,0.4)}}
        .glow-animation{animation:glow 2s ease-in-out infinite}
      `}</style>

      {/* ══ SIDEBAR ══ */}
      <aside style={{
        position:"fixed", left:0, top:0, width:260, height:"100vh",
        display:"flex", flexDirection:"column", zIndex:20,
        background:"rgba(255,255,255,0.85)",
        backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
        boxShadow:"1px 0 0 rgba(0,0,0,0.05), 12px 0 48px rgba(0,0,0,0.08)",
      }}>
        <div style={{ padding:"30px 24px 26px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:"#a3e635",
              display:"grid", placeItems:"center", flexShrink:0,
              boxShadow:"0 4px 14px rgba(163,230,53,0.35)" }}>
              <BookOpen size={17} color="#0a1a0a" />
            </div>
            <span style={{ color:"#0a1a0a", fontWeight:900, fontSize:17, letterSpacing:"-0.025em" }}>IntelliLearn</span>
          </div>
        </div>

        <nav style={{ flex:1, padding:"4px 12px", display:"flex", flexDirection:"column", gap:2 }}>
          <p style={{ color:"rgba(0,0,0,0.4)", fontSize:10, fontWeight:700,
            letterSpacing:"0.18em", textTransform:"uppercase", padding:"0 12px", margin:"0 0 10px" }}>Menu</p>
          {NAV.map(({ id, label, Icon, description }) => {
            const active = activeView === id;
            return (
              <button key={id} className="nav-item" onClick={() => setActiveView(id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:11,
                padding:"11px 14px", borderRadius:13, border:"none", cursor:"pointer", textAlign:"left",
                background: active ? "rgba(163,230,53,0.2)" : "transparent",
                color: active ? "#7c3aed" : "rgba(0,0,0,0.5)",
                fontWeight: active ? 700 : 500, fontSize:14,
                boxShadow: active ? "inset 0 0 0 1px rgba(163,230,53,0.3)" : "none",
              }}>
                <Icon size={16} />
                <div style={{ flex:1, textAlign:"left" }}>
                  <div>{label}</div>
                  <div style={{ fontSize:10, opacity:0.6 }}>{description}</div>
                </div>
                {active && <ChevronRight size={13} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"16px 12px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 14px", marginBottom:4 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"#a3e635",
              display:"grid", placeItems:"center", fontWeight:900, fontSize:14,
              color:"#0a1a0a", flexShrink:0, boxShadow:"0 4px 12px rgba(163,230,53,0.3)" }}>
              {initial}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, color:"#0a1a0a", fontWeight:700, fontSize:13,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.name || "Learner"}
              </p>
              <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{
            width:"100%", display:"flex", alignItems:"center", gap:11,
            padding:"11px 14px", borderRadius:13, border:"none", cursor:"pointer",
            background:"transparent", color:"rgba(0,0,0,0.4)", fontWeight:500, fontSize:14,
          }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ marginLeft:260, flex:1, minHeight:"100vh",
        padding:"44px 52px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>

          {/* ── DASHBOARD ── */}
          {activeView === "dashboard" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* ══ HERO: Profile card + Streak card side by side ══ */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr", gap:16 }}>

                {/* Profile Card - Premium Design */}
                <Glass style={{ 
                  display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", padding:"28px 24px", textAlign:"center", position:"relative",
                  overflow: "hidden",
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%),
                               linear-gradient(45deg, ${s.levelConfig.color}08, ${s.levelConfig.color}04)`,
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)"
                }}>
                  {/* Animated background orbs */}
                  <div style={{ 
                    position:"absolute", top:-40, right:-40, width:160, height:160, 
                    borderRadius:"50%", background:`radial-gradient(circle, ${s.levelConfig.color}20, transparent)`,
                    animation: "pulse 4s ease-in-out infinite", pointerEvents: "none"
                  }} />
                  <div style={{ 
                    position:"absolute", bottom:-60, left:-60, width:140, height:140, 
                    borderRadius:"50%", background:`radial-gradient(circle, ${s.levelConfig.color}10, transparent)`,
                    animation: "pulse 5s ease-in-out infinite 0.5s", pointerEvents: "none"
                  }} />

                  {/* Badge - Level */}
                  <div style={{ 
                    position:"absolute", top:16, right:16, 
                    fontSize:28, animation: "pulse 2s ease-in-out infinite"
                  }}>
                    {s.levelConfig.badge}
                  </div>

                  {/* Avatar */}
                  <div style={{ marginBottom:16, position:"relative", zIndex: 1 }}>
                    <div style={{
                      width:90,
                      height:90,
                      borderRadius:"50%",
                      background: s.levelConfig.bgGradient,
                      display:"grid",
                      placeItems:"center",
                      fontSize:40,
                      fontWeight:900,
                      color:"white",
                      boxShadow: `0 12px 40px ${s.levelConfig.color}60, inset 0 2px 8px rgba(255,255,255,0.3)`,
                      position:"relative",
                      border: "2px solid rgba(255,255,255,0.8)",
                      animation: "float 3s ease-in-out infinite"
                    }}>
                      {initial}
                      <div style={{ 
                        position: "absolute", 
                        inset: 0, 
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)`,
                        pointerEvents: "none"
                      }} />
                    </div>
                  </div>

                  {/* Welcome Text */}
                  <div style={{ marginBottom:10, position:"relative", zIndex: 1 }}>
                    <p style={{ 
                      margin:0, 
                      color:"#0a1a0a", 
                      fontWeight:900, 
                      fontSize:20,
                      letterSpacing:"-0.02em",
                      background: `linear-gradient(135deg, ${s.levelConfig.color}, #7c3aed)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}>
                      Hi, {user?.name?.split(" ")[0] || "Learner"}! 👋
                    </p>
                  </div>

                  {/* Proficiency Badge */}
                  <div style={{ 
                    marginBottom:12, 
                    padding:"6px 14px", 
                    borderRadius:50,
                    background: `linear-gradient(135deg, ${s.levelConfig.color}20, ${s.levelConfig.color}10)`,
                    border: `1.5px solid ${s.levelConfig.color}40`,
                    display:"inline-flex", 
                    alignItems:"center", 
                    gap:6,
                    boxShadow: `0 4px 16px ${s.levelConfig.color}15`,
                    animation: "fadeUp 0.6s ease 0.3s both"
                  }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${s.levelConfig.color}, ${s.levelConfig.color}dd)`,
                      display: "grid",
                      placeItems: "center",
                      color: "white",
                      fontWeight: 800,
                      fontSize: 11
                    }}>
                      {s.levelConfig.badge}
                    </div>
                    <span style={{ 
                      color:s.levelConfig.color, 
                      fontWeight:800, 
                      fontSize:11, 
                      textTransform:"uppercase",
                      letterSpacing:"0.12em"
                    }}>
                      {s.levelConfig.name}
                    </span>
                  </div>

                  {/* Language Info */}
                  <div style={{
                    marginBottom: 14,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(0,0,0,0.03)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    position:"relative", zIndex: 1
                  }}>
                    <p style={{ margin:"0 0 3px", color:"rgba(0,0,0,0.4)", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                      Current Language
                    </p>
                    <p style={{ margin:0, color:"#0a1a0a", fontWeight:800, fontSize:13, letterSpacing:"-0.01em" }}>
                      {s.langEmoji} {s.langLabel}
                    </p>
                  </div>

                  {/* Description */}
                  <p style={{ 
                    margin:"0 0 12px", 
                    color:"rgba(0,0,0,0.55)", 
                    fontSize:11,
                    lineHeight: 1.4,
                    fontWeight: 500,
                    maxWidth: 220,
                    position:"relative", zIndex: 1
                  }}>
                    {s.levelConfig.description}
                  </p>
                  
                  {/* XP Progress - Enhanced */}
                  <div style={{ 
                    marginBottom: 12, 
                    width: "100%",
                    padding: "0 12px",
                    position:"relative", zIndex: 1
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "rgba(0,0,0,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        XP Progress
                      </span>
                      <span style={{ 
                        fontSize: 11, 
                        color: s.levelConfig.color, 
                        fontWeight: 800,
                        background: `${s.levelConfig.color}15`,
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 10
                      }}>
                        {s.xp} / {s.nextLevelXP}
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 50, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        borderRadius: 50,
                        width: `${(s.xp / s.nextLevelXP) * 100}%`,
                        background: `linear-gradient(90deg, ${s.levelConfig.color}, #34d399)`,
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: `0 0 12px ${s.levelConfig.color}60`
                      }} />
                    </div>
                  </div>
                  
                  {/* Next level info - Enhanced */}
                  {s.nextLevelConfig && (
                    <div style={{ 
                      padding: 10, 
                      borderRadius: 12, 
                      background: `linear-gradient(135deg, ${s.nextLevelConfig.color}10, ${s.nextLevelConfig.color}05)`,
                      border: `1px solid ${s.nextLevelConfig.color}20`,
                      width: "100%",
                      position:"relative", zIndex: 1
                    }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: 10, 
                        color: s.nextLevelConfig.color,
                        fontWeight: 700,
                        lineHeight: 1.3
                      }}>
                        🎯 <strong>Next:</strong> {s.nextLevelConfig.name}
                      </p>
                      <p style={{ 
                        margin: "3px 0 0", 
                        fontSize: 9, 
                        color: "rgba(0,0,0,0.4)",
                        lineHeight: 1.2
                      }}>
                        {s.nextLevelConfig.requirements}
                      </p>
                    </div>
                  )}

                  <style>{`
                    @keyframes float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-8px); }
                    }
                  `}</style>
                </Glass>

                {/* Enhanced Streak Card - Premium Design */}
                <Glass style={{ 
                  padding:"24px 28px", 
                  position:"relative", 
                  overflow:"hidden",
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%),
                               linear-gradient(45deg, rgba(251,146,60,0.08), rgba(251,146,60,0.02))`,
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)"
                }}>
                  {/* Animated background flame */}
                  <div style={{ 
                    position:"absolute", 
                    top: -40, right: -40, 
                    width:200, height:200, 
                    borderRadius:"50%", 
                    background:"radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)",
                    animation: "pulse 4s ease-in-out infinite", 
                    pointerEvents: "none",
                    zIndex: 0
                  }} />

                  {/* Content */}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    {/* Top row - Icon and Title */}
                    <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18 }}>
                      <div style={{ 
                        width:52, height:52, 
                        borderRadius:14, 
                        flexShrink:0,
                        background: "linear-gradient(135deg, rgba(251,146,60,0.2), rgba(251,146,60,0.1))",
                        border: "1.5px solid rgba(251,146,60,0.3)",
                        display:"grid", 
                        placeItems:"center",
                        boxShadow: "0 8px 24px rgba(251,146,60,0.15)",
                        position: "relative"
                      }}>
                        <Flame size={24} color="#fb923c" />
                        <div style={{ 
                          position: "absolute", 
                          inset: 0, 
                          borderRadius: 16,
                          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)",
                          pointerEvents: "none"
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          margin:0, 
                          color:"rgba(0,0,0,0.5)", 
                          fontSize:9, 
                          fontWeight:700,
                          textTransform:"uppercase", 
                          letterSpacing:"0.12em"
                        }}>Learning Streak</p>
                        <p style={{ 
                          margin:"4px 0 0", 
                          color:"#fb923c", 
                          fontWeight:900, 
                          fontSize:28,
                          letterSpacing:"-0.02em",
                          lineHeight: 1
                        }}>
                          {s.streak} day{s.streak !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div style={{ 
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: "rgba(251,146,60,0.1)",
                        border: "1px solid rgba(251,146,60,0.2)"
                      }}>
                        <p style={{ margin: 0, fontSize: 9, color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>to perfect</p>
                        <p style={{ 
                          margin: "2px 0 0", 
                          fontSize: 12, 
                          color: "#fb923c", 
                          fontWeight: 900,
                          letterSpacing: "-0.01em"
                        }}>
                          {7 - s.streak}
                        </p>
                      </div>
                    </div>

                    {/* Day bubbles with enhanced styling */}
                    <div style={{ 
                      display:"flex", 
                      justifyContent:"space-between", 
                      alignItems:"center", 
                      gap:5,
                      marginBottom: 14,
                      padding: "12px 10px",
                      borderRadius: 12,
                      background: "rgba(0,0,0,0.02)",
                      border: "1px solid rgba(0,0,0,0.04)"
                    }}>
                      {DAYS.map((d, i) => {
                        const isToday = i === s.todayDayIndex;
                        const isLit = i < s.todayDayIndex ? true : (i === s.todayDayIndex ? true : false);
                        const inStreak = i >= (s.todayDayIndex - s.streak + 1) && i <= s.todayDayIndex;
                        
                        return (
                          <div key={i} style={{
                            width:36, height:36, 
                            borderRadius:"50%",
                            display:"grid", 
                            placeItems:"center",
                            background: inStreak ? "#fb923c"
                              : "rgba(0,0,0,0.06)",
                            border: isToday ? "2px solid rgba(255,255,255,0.6)" : "none",
                            boxShadow: isToday ? "0 5px 16px rgba(251,146,60,0.3), inset 0 1px 3px rgba(255,255,255,0.3)" : "none",
                            transition:"all .3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            flexShrink: 0,
                            position: "relative",
                            cursor: "default"
                          }}>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 800,
                              color: inStreak ? "#fff" : "rgba(0,0,0,0.2)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em"
                            }}>
                              {d}
                            </span>
                            {isToday && (
                              <div style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "50%",
                                background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent)",
                                pointerEvents: "none"
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Motivation message with enhanced styling */}
                    <div style={{ 
                      padding:"12px 14px", 
                      borderRadius:12, 
                      background: s.streak === 7 
                        ? "linear-gradient(135deg, rgba(251,146,60,0.15), rgba(251,146,60,0.08))"
                        : "rgba(0,0,0,0.03)",
                      border: s.streak === 7
                        ? "1.5px solid rgba(251,146,60,0.3)"
                        : "1px solid rgba(0,0,0,0.06)",
                      textAlign: "center"
                    }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: 12, 
                        fontWeight: 600,
                        color: s.streak === 7 ? "#fb923c" : "rgba(0,0,0,0.55)",
                        lineHeight: 1.4
                      }}>
                        {s.streak === 1 ? "🚀 Every journey starts with a single step! Keep it up!" 
                          : s.streak === 2 ? "⚡ Consistency is key. You're on your way!"
                          : s.streak === 3 ? "🔥 Three days strong! Momentum is building!"
                          : s.streak === 4 ? "💪 Halfway there! Don't stop now!"
                          : s.streak === 5 ? "🎯 Five days in! You're crushing it!"
                          : s.streak === 6 ? "🌟 One more day to perfection!"
                          : s.streak === 7 ? "🏆 PERFECT WEEK! You're absolutely unstoppable!"
                          : "📚 Keep learning every single day!"}
                      </p>
                    </div>
                  </div>
                </Glass>
              </div>

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
                              background: "rgba(163,230,53,0.15)",
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center",
                              transition: "all 0.2s ease",
                              boxShadow: "inset 0 0 0 1px rgba(163,230,53,0.2)"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "rgba(163,230,53,0.25)";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "rgba(163,230,53,0.15)";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            <ChevronRight size={20} color="#7c3aed" style={{ transform: "rotate(180deg)" }} />
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
                                  <p style={{ margin:0, color:"#0a1a0a", fontWeight:800, fontSize:18,
                                    letterSpacing:"-0.02em" }}>{langLabel}</p>
                                  <span style={{ padding:"2px 10px", borderRadius:99, fontSize:10, fontWeight:700,
                                    background:"rgba(163,230,53,0.15)", color:"#7c3aed",
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
                                    background:`linear-gradient(90deg, ${langColor}, #34d399)`,
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
                                  <span style={{ color:"#0a1a0a", fontWeight:800, fontSize:13, position:"relative" }}>
                                    {pct}%
                                  </span>
                                </div>

                                <button className="continue-btn" onClick={() => navigate("/learning-path")} style={{
                                  padding:"12px 22px", borderRadius:12, border:"none", cursor:"pointer",
                                  background:`linear-gradient(135deg, #a3e635, #84cc16)`,
                                  color:"#0a1a0a", fontWeight:800, fontSize:14,
                                  display:"inline-flex", alignItems:"center", gap:8,
                                  boxShadow:"0 8px 24px rgba(163,230,53,0.3)",
                                  whiteSpace:"nowrap",
                                }}>
                                  <Play size={14} fill="#0a1a0a" /> Continue Learning
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
                              background: "rgba(163,230,53,0.15)",
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center",
                              transition: "all 0.2s ease",
                              boxShadow: "inset 0 0 0 1px rgba(163,230,53,0.2)"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "rgba(163,230,53,0.25)";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "rgba(163,230,53,0.15)";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            <ChevronRight size={20} color="#7c3aed" />
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
                                background: currentLearningIndex === index ? "#a3e635" : "rgba(0,0,0,0.15)",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: currentLearningIndex === index ? "0 4px 12px rgba(163,230,53,0.3)" : "none"
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
                            <div style={{ width:8, height:8, borderRadius:"50%", background:"#a3e635",
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

              {/* ══ 3 STAT CARDS ══ */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                {[
                  { label:"Quiz Mastery", value: s.quizzes,    sub:`Latest: ${s.score}`,                accent:"#60a5fa", glow:"rgba(96,165,250,0.10)",  Icon: TrendingUp, description: "Attempts to improve" },
                  { label:"Tasks Completed",   value: s.totalTasks, sub:`${s.unlocked} unlocked`,             accent:"#a3e635", glow:"rgba(163,230,53,0.10)",  Icon: CheckCircle2, description: `${s.done} of ${s.totalTasks} done` },
                  { label:"XP Earned",    value:`${s.xp}`,   sub:`${s.nextLevelXP - s.xp} XP to next level`, accent:"#34d399", glow:"rgba(52,211,153,0.10)", Icon: Award, description: "Total experience points" },
                ].map(({ label, value, sub, accent, glow, Icon, description }) => (
                  <Glass key={label} className="stat-card" style={{ padding:22 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                      <div>
                        <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700,
                          textTransform:"uppercase", letterSpacing:"0.14em" }}>{label}</p>
                        <p style={{ margin:"2px 0 0", fontSize:10, color: "rgba(0,0,0,0.4)" }}>{description}</p>
                      </div>
                      <div style={{ width:33, height:33, borderRadius:10, background: glow,
                        display:"grid", placeItems:"center" }}>
                        <Icon size={15} color={accent} />
                      </div>
                    </div>
                    <p style={{ margin:0, color:"#0a1a0a", fontSize:36, fontWeight:900,
                      letterSpacing:"-0.03em", lineHeight:1 }}>{value}</p>
                    <p style={{ margin:"8px 0 0", color:"rgba(0,0,0,0.4)", fontSize:12 }}>{sub}</p>
                  </Glass>
                ))}
              </div>

              {/* Proficiency Achievement Banner */}
              <Glass style={{ background: `linear-gradient(135deg, ${s.levelConfig.color}15, rgba(255,255,255,0.7))`, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 48 }}>{s.levelConfig.badge}</div>
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
                        background: s.levelConfig.bgGradient,
                        color: "white",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8
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
              <div style={{ marginBottom:4 }}>
                <h2 style={{ margin:0, color:"#0a1a0a", fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>Progress Dashboard</h2>
                <p style={{ margin:"6px 0 0", color:"rgba(0,0,0,0.5)", fontSize:14 }}>Track your learning journey and achievements.</p>
              </div>
              
              {/* Proficiency Level Overview */}
              <Glass>
                <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                  <ProficiencyBadge level={s.level} size="lg" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{s.levelConfig.name} Level</h3>
                    <p style={{ margin: "5px 0 0", color: "rgba(0,0,0,0.6)" }}>{s.levelConfig.description}</p>
                    <XPProgressBar xp={s.xp} nextLevelXP={s.nextLevelXP} />
                  </div>
                </div>
              </Glass>
              
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                {[
                  { label:"Total XP",    value: s.xp,     Icon: Award,   accent:"#fbbf24", glow:"rgba(251,191,36,0.10)", suffix: " XP" },
                  { label:"Tasks", value: `${s.done}/${s.totalTasks}`,  Icon: CheckCircle2, accent:"#a3e635", glow:"rgba(163,230,53,0.10)", suffix: "" },
                  { label:"Streak",  value:s.streak, Icon: Flame,         accent:"#fb923c", glow:"rgba(251,146,60,0.10)", suffix: " days" },
                ].map(({ label, value, Icon, accent, glow, suffix }) => (
                  <Glass key={label} className="stat-card" style={{ padding:28, textAlign:"center" }}>
                    <div style={{ width:46, height:46, borderRadius:13, background: glow,
                      display:"grid", placeItems:"center", margin:"0 auto 18px" }}>
                      <Icon size={21} color={accent} />
                    </div>
                    <p style={{ margin:0, color:"#0a1a0a", fontSize:38, fontWeight:900, letterSpacing:"-0.03em" }}>{value}{suffix}</p>
                    <p style={{ margin:"7px 0 0", color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700,
                      textTransform:"uppercase", letterSpacing:"0.14em" }}>{label}</p>
                  </Glass>
                ))}
              </div>
              <Glass>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <p style={{ margin:0, color:"#0a1a0a", fontWeight:700, fontSize:15 }}>Course Completion</p>
                  <p style={{ margin:0, color:"#7c3aed", fontWeight:900, fontSize:15 }}>{s.pct}%</p>
                </div>
                <div style={{ height:8, borderRadius:99, background:"rgba(0,0,0,0.08)", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:99, width:`${s.pct}%`,
                    background:"linear-gradient(90deg, #a3e635, #34d399)" }} />
                </div>
                <p style={{ margin:"10px 0 0", color:"rgba(0,0,0,0.4)", fontSize:13 }}>
                  {s.done} of {s.totalTasks} tasks completed
                </p>
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
                <div style={{ marginBottom:4 }}>
                  <h2 style={{ margin:0, color:"#0a1a0a", fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>Skill Assessment</h2>
                  <p style={{ margin:"6px 0 0", color:"rgba(0,0,0,0.5)", fontSize:14 }}>Test your knowledge and advance your proficiency level.</p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                  {/* Last Score Card */}
                  <Glass className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ margin:0, color:"rgba(0,0,0,0.4)", fontSize:10, fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.16em" }}>Last Score</p>
                      <span style={{ fontSize: 20 }}>📊</span>
                    </div>
                    <p style={{ margin:0, color:"#60a5fa", fontSize:28, fontWeight:900, letterSpacing:"-0.03em" }}>
                      {lastScore}/{totalQuestions}
                    </p>
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: lastPercentage >= 80 ? "#22c55e" : lastPercentage >= 60 ? "#fb923c" : "#ef4444"
                      }} />
                      <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:12, fontWeight: 600 }}>
                        {lastPercentage}%
                      </p>
                    </div>
                  </Glass>

                  {/* Best Score Card */}
                  <Glass className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ margin:0, color:"rgba(0,0,0,0.4)", fontSize:10, fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.16em" }}>Best Score</p>
                      <span style={{ fontSize: 20 }}>🏆</span>
                    </div>
                    <p style={{ margin:0, color:"#34d399", fontSize:28, fontWeight:900, letterSpacing:"-0.03em" }}>
                      {bestScore}/{totalQuestions}
                    </p>
                    <p style={{ margin:"8px 0 0", color:"rgba(0,0,0,0.5)", fontSize:12, fontWeight: 600 }}>
                      {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
                    </p>
                  </Glass>

                  {/* Current Level Based on Last Score Card */}
                  <Glass className="stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ margin:0, color:"rgba(0,0,0,0.4)", fontSize:10, fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.16em" }}>Current Level</p>
                      <span style={{ fontSize: 20 }}>{lastScoreConfig.badge}</span>
                    </div>
                    <p style={{ margin:0, color: lastScoreConfig.color, fontSize:28, fontWeight:900, letterSpacing:"-0.03em" }}>
                      {lastScoreConfig.name}
                    </p>
                    <p style={{ margin:"8px 0 0", color:"rgba(0,0,0,0.5)", fontSize:12, fontWeight: 600 }}>
                      {lastScoreConfig.description}
                    </p>
                  </Glass>
                </div>

                {/* Action Card */}
                <Glass>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin:"0 0 4px", color:"#0a1a0a", fontWeight:800, fontSize:17 }}>Assessment History</h3>
                      <p style={{ margin: 0, color: "rgba(0,0,0,0.5)", fontSize: 12 }}>Track all your assessment attempts</p>
                    </div>
                    {attempts.length > 0 && (
                      <button onClick={() => setShowAssessmentModal(true)} style={{
                        padding: "10px 18px",
                        borderRadius: 10,
                        border: "1px solid rgba(163,230,53,0.3)",
                        background: "rgba(163,230,53,0.1)",
                        color: "#7c3aed",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(163,230,53,0.15)";
                        e.target.style.boxShadow = "0 4px 12px rgba(163,230,53,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(163,230,53,0.1)";
                        e.target.style.boxShadow = "none";
                      }}>
                        See All Details
                      </button>
                    )}
                  </div>
                </Glass>

                {/* Readiness Card */}
                <Glass>
                  <h3 style={{ margin:"0 0 8px", color:"#0a1a0a", fontWeight:800, fontSize:17 }}>Ready to level up?</h3>
                  <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:14, lineHeight:1.65 }}>
                    Taking assessments helps us gauge your proficiency and unlock more challenging content tailored to your skill level.
                  </p>
                  <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: "rgba(163,230,53,0.1)" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#7c3aed", fontWeight: 600 }}>
                      💡 Tip: Score 80% or higher to advance to the next proficiency level!
                    </p>
                  </div>
                  <button onClick={() => navigate("/assessment")} style={{
                    marginTop:22, padding:"12px 26px", borderRadius:12, border:"none",
                    background:"linear-gradient(135deg, #a3e635, #84cc16)",
                    color:"#0a1a0a", fontWeight:800, fontSize:14,
                    cursor:"pointer", display:"inline-flex", alignItems:"center", gap:9,
                    boxShadow:"0 8px 24px rgba(163,230,53,0.28)",
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
                      <h2 style={{ margin: 0, color: "#0a1a0a", fontSize: 22, fontWeight: 900 }}>
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
                              background: "linear-gradient(135deg, rgba(163,230,53,0.08), rgba(163,230,53,0.02))",
                              border: "1px solid rgba(163,230,53,0.2)",
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(163,230,53,0.15), rgba(163,230,53,0.05))";
                              e.currentTarget.style.boxShadow = "0 8px 20px rgba(163,230,53,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(163,230,53,0.08), rgba(163,230,53,0.02))";
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
                                <p style={{ margin: 0, color: "#0a1a0a", fontWeight: 700, fontSize: 14 }}>
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
                                  background: percentage >= 80 ? "rgba(34,197,94,0.15)" : percentage >= 60 ? "rgba(251,146,60,0.15)" : "rgba(239,68,68,0.15)",
                                  display: "inline-block"
                                }}>
                                  <p style={{ margin: 0, color: percentage >= 80 ? "#22c55e" : percentage >= 60 ? "#fb923c" : "#ef4444", fontWeight: 900, fontSize: 16 }}>
                                    {score}/{total}
                                  </p>
                                  <p style={{ margin: "2px 0 0", color: percentage >= 80 ? "#22c55e" : percentage >= 60 ? "#fb923c" : "#ef4444", fontWeight: 700, fontSize: 10 }}>
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
                          <p style={{ margin: "6px 0 0", color: "#a3e635", fontWeight: 900, fontSize: 20 }}>{attempts.length}</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, color: "rgba(0,0,0,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Best</p>
                          <p style={{ margin: "6px 0 0", color: "#34d399", fontWeight: 900, fontSize: 20 }}>
                            {Math.max(...attempts.map(a => a.score || 0))}/{attempts[0]?.totalQuestions || 0}
                          </p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, color: "rgba(0,0,0,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Avg</p>
                          <p style={{ margin: "6px 0 0", color: "#60a5fa", fontWeight: 900, fontSize: 20 }}>
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
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                <div>
                  <h2 style={{ margin:0, color:"#0a1a0a", fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>Learning Path</h2>
                  <p style={{ margin:"6px 0 0", color:"rgba(0,0,0,0.5)", fontSize:14 }}>
                    {s.langLabel} • {s.done}/{s.totalTasks} tasks complete • {s.levelConfig.name} Level
                  </p>
                </div>
                <button onClick={() => navigate("/learning-path")} style={{
                  padding:"10px 20px", borderRadius:12, border:"none", cursor:"pointer",
                  background:"rgba(163,230,53,0.15)", color:"#7c3aed", fontWeight:700, fontSize:13,
                  display:"inline-flex", alignItems:"center", gap:8,
                  boxShadow:"inset 0 0 0 1px rgba(163,230,53,0.2)",
                }}>
                  Full View <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ height:6, borderRadius:99, background:"rgba(0,0,0,0.08)", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:99, width:`${s.pct}%`,
                  background:"linear-gradient(90deg, #a3e635, #34d399)" }} />
              </div>

              {!learningPaths.length ? (
                <Glass style={{ textAlign:"center", padding:52 }}>
                  <Layers size={30} color="rgba(0,0,0,0.2)" style={{ margin:"0 auto 14px" }} />
                  <p style={{ margin:0, color:"rgba(0,0,0,0.6)", fontWeight:600, fontSize:15 }}>No learning path yet</p>
                  <p style={{ margin:"7px 0 0", color:"rgba(0,0,0,0.4)", fontSize:13 }}>Complete an assessment to generate your personalized learning path.</p>
                  <button onClick={() => setActiveView("assessment")} style={{
                    marginTop:22, padding:"11px 26px", borderRadius:12, border:"none",
                    background:"linear-gradient(135deg, #a3e635, #84cc16)",
                    color:"#0a1a0a", fontWeight:800, fontSize:13, cursor:"pointer",
                    boxShadow:"0 8px 24px rgba(163,230,53,0.28)",
                  }}>
                    Take Assessment
                  </button>
                </Glass>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {s.tasks.slice(0, 8).map((task, i) => (
                    <div key={task.taskId} className="task-row" style={{
                      borderRadius:14, padding:"15px 20px",
                      display:"flex", alignItems:"center", gap:16,
                      opacity: task.status === "locked" ? 0.42 : 1,
                      background:"rgba(0,0,0,0.04)",
                      backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
                      boxShadow:"inset 0 1px 0 rgba(0,0,0,0.05)",
                    }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0,
                        display:"grid", placeItems:"center", fontWeight:900, fontSize:13,
                        background: task.status === "completed" ? "rgba(52,211,153,0.15)"
                          : task.status === "unlocked" ? "rgba(163,230,53,0.15)"
                          : "rgba(0,0,0,0.08)",
                        color: task.status === "completed" ? "#059669"
                          : task.status === "unlocked" ? "#7c3aed"
                          : "rgba(0,0,0,0.3)" }}>
                        {task.status === "completed" ? <CheckCircle2 size={16} /> : i + 1}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, color:"#0a1a0a", fontWeight:700, fontSize:14,
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
                        color: "#7c3aed",
                        fontWeight: 600,
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

        </div>
      </main>
    </div>
  );
}