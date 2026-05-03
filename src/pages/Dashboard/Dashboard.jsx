import { useEffect, useMemo, useState } from "react";
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

  const s = useMemo(() => {
    const latest    = later[0] || null;
    const path      = learningPaths[0] || null;
    const tasks     = path?.tasks || [];
    const done      = tasks.filter(t => t.status === "completed").length;
    const unlocked  = tasks.filter(t => t.status !== "locked").length;
    const daily     = tasks.find(t => t.status === "unlocked") || tasks[0] || null;
    const streak    = Math.max(1, Math.min(7, later.length + done + 1));
    const langKey   = (path?.language || status?.assessmentLanguage || "python").toLowerCase();
    const proficiencyLevel = status?.proficiencyLevel || "beginner";
    const config = PROFICIENCY_CONFIG[proficiencyLevel?.toLowerCase()] || PROFICIENCY_CONFIG.beginner;
    const nextLevelConfig = config.nextLevel ? PROFICIENCY_CONFIG[config.nextLevel?.toLowerCase()] : null;
    
    return {
      streak, streakPct: Math.min(100, Math.round((streak / 7) * 100)),
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
  }, [later, status, learningPaths, xp]);

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
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:16 }}>

                {/* Profile Card with Proficiency */}
                <Glass style={{ display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", padding:"28px 24px", textAlign:"center", position:"relative" }}>
                  <div style={{ position:"absolute", top: -10, right: -10 }}>
                    <div style={{ fontSize: 32 }}>{s.levelConfig.badge}</div>
                  </div>
                  {/* Avatar circle with proficiency ring */}
                  <div style={{ marginBottom:14, position:"relative" }}>
                    <div style={{
                      width:84,
                      height:84,
                      borderRadius:"50%",
                      background: s.levelConfig.bgGradient,
                      display:"grid",
                      placeItems:"center",
                      fontSize:34,
                      fontWeight:900,
                      color:"white",
                      boxShadow: `0 8px 28px ${s.levelConfig.color}60`,
                      position:"relative"
                    }}>
                      {initial}
                    </div>
                  </div>
                  <p style={{ margin:0, color:"#0a1a0a", fontWeight:800, fontSize:18, letterSpacing:"-0.01em" }}>
                    Hi, {user?.name?.split(" ")[0] || "Learner"}!
                  </p>
                  <div style={{ marginTop:8, padding:"4px 16px", borderRadius:99,
                    background: "rgba(163,230,53,0.15)", display:"inline-flex", alignItems:"center", gap: 6 }}>
                    <Brain size={12} color="#7c3aed" />
                    <span style={{ color:"#7c3aed", fontWeight:700, fontSize:11, textTransform:"uppercase",
                      letterSpacing:"0.1em" }}>{s.levelConfig.name}</span>
                  </div>
                  <p style={{ margin:"12px 0 4px", color:"rgba(0,0,0,0.55)", fontSize:13 }}>
                    {s.langEmoji} {s.langLabel}
                  </p>
                  <p style={{ margin:0, color:"rgba(0,0,0,0.4)", fontSize:10 }}>
                    {s.levelConfig.description}
                  </p>
                  
                  {/* XP Progress */}
                  <XPProgressBar xp={s.xp} nextLevelXP={s.nextLevelXP} />
                  
                  {/* Next level info */}
                  {s.nextLevelConfig && (
                    <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.04)", width: "100%" }}>
                      <p style={{ margin: 0, fontSize: 10, color: "rgba(0,0,0,0.5)" }}>
                        🎯 Next: {s.nextLevelConfig.name} • {s.nextLevelConfig.requirements}
                      </p>
                    </div>
                  )}
                </Glass>

                {/* Enhanced Streak Card with motivation */}
                <Glass style={{ padding:"26px 28px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top: -20, right: -20, opacity: 0.1 }}>
                    <Flame size={120} color="#fb923c" />
                  </div>
                  {/* Top row */}
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22 }}>
                    <div style={{ width:48, height:48, borderRadius:14, flexShrink:0,
                      background:"rgba(251,146,60,0.15)", display:"grid", placeItems:"center",
                      boxShadow:"0 0 24px rgba(251,146,60,0.18)" }}>
                      <Flame size={22} color="#fb923c" />
                    </div>
                    <div>
                      <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.14em" }}>Learning Streak</p>
                      <p style={{ margin:"3px 0 0", color:"#fb923c", fontWeight:900, fontSize:26,
                        letterSpacing:"-0.02em" }}>{s.streak} days</p>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                      {s.streak === 7 ? "🔥 Perfect week!" : `${7 - s.streak} days to perfect week`}
                    </div>
                  </div>

                  {/* Day bubbles */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
                    {DAYS.map((d, i) => {
                      const lit = i < s.streak;
                      const today = i === s.streak - 1;
                      return (
                        <div key={i} style={{
                          width:32, height:32, borderRadius:"50%",
                          display:"grid", placeItems:"center",
                          background: today ? "#fb923c"
                            : lit ? "rgba(251,146,60,0.25)"
                            : "rgba(0,0,0,0.08)",
                          boxShadow: today ? "0 4px 16px rgba(251,146,60,0.4)" : "none",
                          transition:"all .2s",
                          flexShrink: 0
                        }}>
                          <Flame size={14}
                            color={today ? "#fff" : lit ? "#fb923c" : "rgba(0,0,0,0.2)"}
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Motivation text */}
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                      {s.streak === 1 ? "🚀 Every journey starts with a single step!" 
                        : s.streak === 3 ? "⚡ You're building momentum!"
                        : s.streak === 5 ? "💪 Almost there! Keep pushing!"
                        : s.streak === 7 ? "🏆 Legendary streak! You're unstoppable!"
                        : "📚 Consistency is key. Keep going!"}
                    </p>
                  </div>
                </Glass>
              </div>

              {/* ══ CONTINUE LEARNING CARD ══ */}
              <Glass style={{ padding:0, overflow:"hidden" }}>
                {/* Header strip */}
                <div style={{ padding:"14px 24px 12px", borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:11, fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.18em" }}>My Learning</p>
                </div>

                <div style={{ padding:"20px 24px 24px", display:"flex", alignItems:"center", gap:24 }}>
                  {/* Lang badge */}
                  <div style={{ width:80, height:80, borderRadius:18, flexShrink:0,
                    background: s.langColor,
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    boxShadow:`0 12px 32px ${s.langColor}55`, gap:2 }}>
                    <span style={{ fontSize:28, lineHeight:1 }}>{s.langEmoji}</span>
                    <span style={{ color:"#fff", fontSize:9, fontWeight:800,
                      textTransform:"uppercase", letterSpacing:"0.06em", opacity:0.85 }}>
                      {s.langLabel.substring(0, 6)}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                      <p style={{ margin:0, color:"#0a1a0a", fontWeight:800, fontSize:18,
                        letterSpacing:"-0.02em" }}>{s.langLabel}</p>
                      <span style={{ padding:"2px 10px", borderRadius:99, fontSize:10, fontWeight:700,
                        background:"rgba(163,230,53,0.15)", color:"#7c3aed",
                        textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.levelConfig.name}</span>
                      <span style={{ fontSize: 12 }}>{s.levelConfig.badge}</span>
                    </div>
                    <p style={{ margin:"0 0 14px", color:"rgba(0,0,0,0.5)", fontSize:13 }}>
                      {s.done} of {s.totalTasks} tasks completed • {s.pct}% complete
                    </p>

                    {/* Progress bar */}
                    <div style={{ height:6, borderRadius:99, background:"rgba(0,0,0,0.08)",
                      overflow:"hidden", maxWidth:320 }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${s.pct}%`,
                        background:`linear-gradient(90deg, ${s.langColor}, #34d399)`,
                        transition:"width 1s cubic-bezier(.4,0,.2,1)" }} />
                    </div>
                  </div>

                  {/* Ring + Continue button */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, flexShrink:0 }}>
                    <div style={{ position:"relative", width:60, height:60,
                      display:"grid", placeItems:"center" }}>
                      <div style={{ position:"absolute", inset:0 }}>
                        <Ring pct={s.pct} size={60} stroke={5} color={s.langColor} />
                      </div>
                      <span style={{ color:"#0a1a0a", fontWeight:800, fontSize:13, position:"relative" }}>
                        {s.pct}%
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

                {/* Current task hint */}
                {s.daily && (
                  <div style={{ margin:"0 24px 20px", padding:"12px 16px", borderRadius:12,
                    background:"rgba(0,0,0,0.04)",
                    display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#a3e635",
                      flexShrink:0, animation:"pulse 2s ease-in-out infinite" }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, color:"rgba(0,0,0,0.5)", fontSize:10, fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.12em" }}>Up next</p>
                      <p style={{ margin:"2px 0 0", color:"rgba(0,0,0,0.7)", fontSize:13, fontWeight:600,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {s.daily.title}
                      </p>
                    </div>
                    <StatusPill status={s.daily.status} />
                  </div>
                )}
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

          {/* ── ASSESSMENT (Enhanced) ── */}
          {activeView === "assessment" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ marginBottom:4 }}>
                <h2 style={{ margin:0, color:"#0a1a0a", fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>Skill Assessment</h2>
                <p style={{ margin:"6px 0 0", color:"rgba(0,0,0,0.5)", fontSize:14 }}>Test your knowledge and advance your proficiency level.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Glass className="stat-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ margin:0, color:"rgba(0,0,0,0.4)", fontSize:10, fontWeight:700,
                      textTransform:"uppercase", letterSpacing:"0.16em" }}>Current Level</p>
                    <span style={{ fontSize: 24 }}>{s.levelConfig.badge}</span>
                  </div>
                  <p style={{ margin:0, color: s.levelConfig.color, fontSize:30, fontWeight:900, letterSpacing:"-0.03em" }}>{s.levelConfig.name}</p>
                  <p style={{ margin:"8px 0 0", color:"rgba(0,0,0,0.5)", fontSize:13 }}>
                    Language: <span style={{ color:"#0a1a0a", fontWeight:600 }}>{s.displayLang}</span>
                  </p>
                </Glass>
                <Glass className="stat-card">
                  <p style={{ margin:"0 0 12px", color:"rgba(0,0,0,0.4)", fontSize:10, fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.16em" }}>Best Score</p>
                  <p style={{ margin:0, color:"#0a1a0a", fontSize:30, fontWeight:900, letterSpacing:"-0.03em" }}>{s.score}</p>
                  <p style={{ margin:"8px 0 0", color:"rgba(0,0,0,0.5)", fontSize:13 }}>
                    {s.quizzes} assessment{s.quizzes !== 1 ? "s" : ""} completed
                  </p>
                </Glass>
              </div>
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
            </div>
          )}

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