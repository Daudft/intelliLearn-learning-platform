import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ClipboardList, Flame, Layers,
  LayoutDashboard, LogOut, Target, TrendingUp,
  BookOpen, CheckCircle2, Lock, Circle, ChevronRight, Play,
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

/* ─── StatusPill ─── */
function StatusPill({ status }) {
  const map = {
    completed: { bg:"rgba(52,211,153,0.18)", color:"#34d399", icon: <CheckCircle2 size={10} /> },
    unlocked:  { bg:"rgba(163,230,53,0.18)", color:"#a3e635", icon: <Circle size={10} /> },
    locked:    { bg:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.35)", icon: <Lock size={10} /> },
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
      background:"rgba(255,255,255,0.055)",
      backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.10)",
      borderRadius:20, padding:24, ...style,
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
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`} />
    </svg>
  );
}

const NAV = [
  { id:"dashboard",    label:"Dashboard",    Icon: LayoutDashboard },
  { id:"progress",     label:"Progress",     Icon: Target },
  { id:"assessment",   label:"Assessment",   Icon: ClipboardList },
  { id:"learningPath", label:"Learning Path", Icon: Layers },
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
          learningPathService.getLearningPath(uid),
        ]);
        if (sr.status === "fulfilled") setStatus(sr.value || null);
        if (ar.status === "fulfilled") setAttempts(Array.isArray(ar.value?.attempts) ? ar.value.attempts : []);
        if (pr.status === "fulfilled") setLearningPaths(Array.isArray(pr.value?.paths) ? pr.value.paths : []);
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
    return {
      streak, streakPct: Math.min(100, Math.round((streak / 7) * 100)),
      lang:       langKey,
      langLabel:  getLanguageLabel(langKey),
      langEmoji:  getLangEmoji(langKey),
      langColor:  getLangColor(langKey),
      displayLang:(latest?.language || status?.assessmentLanguage || "-").toString().toUpperCase(),
      level:      latest?.proficiencyLevel || status?.proficiencyLevel || "Beginner",
      quizzes:    later.length,
      score:      latest ? `${latest.score}/${latest.totalQuestions}` : "—",
      totalTasks: tasks.length, done, unlocked, daily,
      pct:        tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      tasks,
    };
  }, [later, status, learningPaths]);

  const logout = async () => { try { await authService.logout(); } finally { navigate("/signin", { replace: true }); } };

  const pageBg = `
    radial-gradient(ellipse 90% 65% at 15% 0%, #1b3320 0%, transparent 55%),
    radial-gradient(ellipse 65% 55% at 88% 105%, #0e2118 0%, transparent 50%),
    linear-gradient(160deg, #0b1a0c 0%, #0d1e0e 45%, #091208 100%)
  `;

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background: pageBg }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid rgba(163,230,53,0.5)",
          borderTopColor:"transparent", animation:"spin .8s linear infinite", margin:"0 auto" }} />
        <p style={{ marginTop:16, color:"rgba(255,255,255,0.35)", fontSize:13, fontFamily:"system-ui" }}>Loading…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", padding:24, background: pageBg }}>
      <div style={{ maxWidth:360, width:"100%", borderRadius:24, padding:36, textAlign:"center",
        background:"rgba(255,255,255,0.06)", backdropFilter:"blur(24px)",
        boxShadow:"0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.09)" }}>
        <p style={{ margin:0, color:"#fff", fontWeight:800, fontSize:18, fontFamily:"system-ui" }}>Something went wrong</p>
        <p style={{ margin:"10px 0 0", color:"rgba(255,255,255,0.4)", fontSize:13, fontFamily:"system-ui" }}>{error}</p>
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
        background:"radial-gradient(circle, rgba(163,230,53,0.10) 0%, transparent 68%)",
        pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:-100, right:60, width:440, height:440, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 68%)",
        pointerEvents:"none", zIndex:0 }} />

      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(163,230,53,0.25);border-radius:4px}
        .nav-item{transition:background .15s,color .15s}
        .nav-item:hover{background:rgba(255,255,255,0.07)!important}
        .stat-card{transition:transform .2s,box-shadow .2s}
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.13)!important}
        .task-row{transition:background .15s}
        .task-row:hover{background:rgba(255,255,255,0.07)!important}
        .continue-btn{transition:transform .15s, box-shadow .15s}
        .continue-btn:hover{transform:translateY(-1px);box-shadow:0 12px 32px rgba(163,230,53,0.35)!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .38s ease both}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
      `}</style>

      {/* ══ SIDEBAR ══ */}
      <aside style={{
        position:"fixed", left:0, top:0, width:232, height:"100vh",
        display:"flex", flexDirection:"column", zIndex:20,
        background:"rgba(255,255,255,0.035)",
        backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
        boxShadow:"1px 0 0 rgba(255,255,255,0.055), 12px 0 48px rgba(0,0,0,0.3)",
      }}>
        <div style={{ padding:"30px 24px 26px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:"#a3e635",
              display:"grid", placeItems:"center", flexShrink:0,
              boxShadow:"0 4px 14px rgba(163,230,53,0.35)" }}>
              <BookOpen size={17} color="#0a1a0a" />
            </div>
            <span style={{ color:"#fff", fontWeight:900, fontSize:17, letterSpacing:"-0.025em" }}>LearnPath</span>
          </div>
        </div>

        <nav style={{ flex:1, padding:"4px 12px", display:"flex", flexDirection:"column", gap:2 }}>
          <p style={{ color:"rgba(255,255,255,0.22)", fontSize:10, fontWeight:700,
            letterSpacing:"0.18em", textTransform:"uppercase", padding:"0 12px", margin:"0 0 10px" }}>Menu</p>
          {NAV.map(({ id, label, Icon }) => {
            const active = activeView === id;
            return (
              <button key={id} className="nav-item" onClick={() => setActiveView(id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:11,
                padding:"11px 14px", borderRadius:13, border:"none", cursor:"pointer", textAlign:"left",
                background: active ? "rgba(163,230,53,0.13)" : "transparent",
                color: active ? "#a3e635" : "rgba(255,255,255,0.5)",
                fontWeight: active ? 700 : 500, fontSize:14,
                boxShadow: active ? "inset 0 0 0 1px rgba(163,230,53,0.22)" : "none",
              }}>
                <Icon size={16} />
                <span style={{ flex:1 }}>{label}</span>
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
              <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:13,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.name || "Learner"}
              </p>
              <p style={{ margin:0, color:"rgba(255,255,255,0.28)", fontSize:11,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{
            width:"100%", display:"flex", alignItems:"center", gap:11,
            padding:"11px 14px", borderRadius:13, border:"none", cursor:"pointer",
            background:"transparent", color:"rgba(255,255,255,0.3)", fontWeight:500, fontSize:14,
          }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ marginLeft:232, flex:1, minHeight:"100vh",
        padding:"44px 52px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>

          {/* ── DASHBOARD ── */}
          {activeView === "dashboard" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* ══ HERO: Profile card + Streak card side by side ══ */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:16 }}>

                {/* Profile Card */}
                <Glass style={{ display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", padding:"28px 24px", textAlign:"center" }}>
                  {/* Avatar circle */}
                  <div style={{ position:"relative", marginBottom:14 }}>
                    <div style={{ width:72, height:72, borderRadius:"50%",
                      background:"linear-gradient(135deg, #a3e635 0%, #34d399 100%)",
                      display:"grid", placeItems:"center",
                      fontSize:30, fontWeight:900, color:"#0a1a0a",
                      boxShadow:"0 8px 28px rgba(163,230,53,0.35)" }}>
                      {initial}
                    </div>
                    {/* Online dot */}
                    <div style={{ position:"absolute", bottom:3, right:3, width:14, height:14,
                      borderRadius:"50%", background:"#a3e635",
                      boxShadow:"0 0 0 2.5px #0d1e0e" }} />
                  </div>
                  <p style={{ margin:0, color:"#fff", fontWeight:800, fontSize:16, letterSpacing:"-0.01em" }}>
                    Hi, {user?.name?.split(" ")[0] || "Learner"}!
                  </p>
                  <div style={{ marginTop:8, padding:"3px 12px", borderRadius:99,
                    background:"rgba(163,230,53,0.15)", display:"inline-block" }}>
                    <span style={{ color:"#a3e635", fontWeight:700, fontSize:11, textTransform:"uppercase",
                      letterSpacing:"0.1em" }}>{s.level}</span>
                  </div>
                  <p style={{ margin:"10px 0 0", color:"rgba(255,255,255,0.3)", fontSize:12 }}>
                    {s.langEmoji} Learning {s.langLabel}
                  </p>
                </Glass>

                {/* Streak Card */}
                <Glass style={{ padding:"26px 28px" }}>
                  {/* Top row */}
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22 }}>
                    <div style={{ width:48, height:48, borderRadius:14, flexShrink:0,
                      background:"rgba(251,146,60,0.15)", display:"grid", placeItems:"center",
                      boxShadow:"0 0 24px rgba(251,146,60,0.18)" }}>
                      <Flame size={22} color="#fb923c" />
                    </div>
                    <div>
                      <p style={{ margin:0, color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.14em" }}>Current Streak</p>
                      <p style={{ margin:"3px 0 0", color:"#fb923c", fontWeight:900, fontSize:22,
                        letterSpacing:"-0.02em" }}>{s.streak} days</p>
                    </div>
                  </div>

                  {/* Day bubbles */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    {DAYS.map((d, i) => {
                      const lit = i < s.streak;
                      const today = i === s.streak - 1;
                      return (
                        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                          <div style={{
                            width:36, height:36, borderRadius:"50%",
                            display:"grid", placeItems:"center",
                            background: today ? "#fb923c"
                              : lit ? "rgba(251,146,60,0.25)"
                              : "rgba(255,255,255,0.06)",
                            boxShadow: today ? "0 4px 16px rgba(251,146,60,0.4)" : "none",
                            transition:"all .2s",
                          }}>
                            <Flame size={16}
                              color={today ? "#fff" : lit ? "#fb923c" : "rgba(255,255,255,0.18)"}
                            />
                          </div>
                          <span style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:600 }}>{d}</span>
                        </div>
                      );
                    })}
                  </div>
                </Glass>
              </div>

              {/* ══ CONTINUE LEARNING CARD ══ */}
              <Glass style={{ padding:0, overflow:"hidden" }}>
                {/* Header strip */}
                <div style={{ padding:"14px 24px 12px",
                  borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ margin:0, color:"rgba(255,255,255,0.35)", fontSize:11, fontWeight:700,
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
                      <p style={{ margin:0, color:"#fff", fontWeight:800, fontSize:18,
                        letterSpacing:"-0.02em" }}>{s.langLabel}</p>
                      <span style={{ padding:"2px 10px", borderRadius:99, fontSize:10, fontWeight:700,
                        background:"rgba(163,230,53,0.15)", color:"#a3e635",
                        textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.level}</span>
                    </div>
                    <p style={{ margin:"0 0 14px", color:"rgba(255,255,255,0.35)", fontSize:13 }}>
                      {s.done} of {s.totalTasks} tasks completed
                    </p>

                    {/* Progress bar */}
                    <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.07)",
                      overflow:"hidden", maxWidth:320 }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${s.pct}%`,
                        background:`linear-gradient(90deg, ${s.langColor}, #34d399)`,
                        transition:"width 1s cubic-bezier(.4,0,.2,1)" }} />
                    </div>
                    <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.22)", fontSize:11 }}>
                      {s.pct}% complete
                    </p>
                  </div>

                  {/* Ring + Continue button */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, flexShrink:0 }}>
                    <div style={{ position:"relative", width:60, height:60,
                      display:"grid", placeItems:"center" }}>
                      <div style={{ position:"absolute", inset:0 }}>
                        <Ring pct={s.pct} size={60} stroke={5} color={s.langColor} />
                      </div>
                      <span style={{ color:"#fff", fontWeight:800, fontSize:13, position:"relative" }}>
                        {s.pct}%
                      </span>
                    </div>

                    <button className="continue-btn" onClick={() => navigate("/learning-path")} style={{
                      padding:"12px 22px", borderRadius:12, border:"none", cursor:"pointer",
                      background:"#a3e635", color:"#0a1a0a", fontWeight:800, fontSize:14,
                      display:"inline-flex", alignItems:"center", gap:8,
                      boxShadow:"0 8px 24px rgba(163,230,53,0.3)",
                      whiteSpace:"nowrap",
                    }}>
                      <Play size={14} fill="#0a1a0a" /> Continue
                    </button>
                  </div>
                </div>

                {/* Current task hint */}
                {s.daily && (
                  <div style={{ margin:"0 24px 20px", padding:"12px 16px", borderRadius:12,
                    background:"rgba(255,255,255,0.04)",
                    display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#a3e635",
                      flexShrink:0, animation:"pulse 2s ease-in-out infinite" }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.12em" }}>Up next</p>
                      <p style={{ margin:"2px 0 0", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600,
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
                  { label:"Quiz Attempts", value: s.quizzes,    sub:`Latest: ${s.score}`,                accent:"#60a5fa", glow:"rgba(96,165,250,0.10)",  Icon: TrendingUp },
                  { label:"Assignments",   value: s.totalTasks, sub:`${s.unlocked} unlocked`,             accent:"#a3e635", glow:"rgba(163,230,53,0.10)",  Icon: ClipboardList },
                  { label:"Completion",    value:`${s.pct}%`,   sub:`${s.done} of ${s.totalTasks} tasks`, accent:"#34d399", glow:"rgba(52,211,153,0.10)", Icon: CheckCircle2 },
                ].map(({ label, value, sub, accent, glow, Icon }) => (
                  <Glass key={label} className="stat-card" style={{ padding:22 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                      <p style={{ margin:0, color:"rgba(255,255,255,0.35)", fontSize:11, fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.14em" }}>{label}</p>
                      <div style={{ width:33, height:33, borderRadius:10, background: glow,
                        display:"grid", placeItems:"center" }}>
                        <Icon size={15} color={accent} />
                      </div>
                    </div>
                    <p style={{ margin:0, color:"#fff", fontSize:36, fontWeight:900,
                      letterSpacing:"-0.03em", lineHeight:1 }}>{value}</p>
                    <p style={{ margin:"8px 0 0", color:"rgba(255,255,255,0.28)", fontSize:12 }}>{sub}</p>
                  </Glass>
                ))}
              </div>
            </div>
          )}

          {/* ── PROGRESS ── */}
          {activeView === "progress" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ marginBottom:4 }}>
                <h2 style={{ margin:0, color:"#fff", fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>Progress</h2>
                <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.35)", fontSize:14 }}>Your learning journey at a glance.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                {[
                  { label:"Attempts",    value: s.quizzes,     Icon: TrendingUp,   accent:"#60a5fa", glow:"rgba(96,165,250,0.10)" },
                  { label:"Assignments", value: s.totalTasks,  Icon: ClipboardList, accent:"#a3e635", glow:"rgba(163,230,53,0.10)" },
                  { label:"Day Streak",  value:`${s.streak}d`, Icon: Flame,         accent:"#fb923c", glow:"rgba(251,146,60,0.10)" },
                ].map(({ label, value, Icon, accent, glow }) => (
                  <Glass key={label} className="stat-card" style={{ padding:28, textAlign:"center" }}>
                    <div style={{ width:46, height:46, borderRadius:13, background: glow,
                      display:"grid", placeItems:"center", margin:"0 auto 18px" }}>
                      <Icon size={21} color={accent} />
                    </div>
                    <p style={{ margin:0, color:"#fff", fontSize:38, fontWeight:900, letterSpacing:"-0.03em" }}>{value}</p>
                    <p style={{ margin:"7px 0 0", color:"rgba(255,255,255,0.32)", fontSize:11, fontWeight:700,
                      textTransform:"uppercase", letterSpacing:"0.14em" }}>{label}</p>
                  </Glass>
                ))}
              </div>
              <Glass>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:15 }}>Overall Completion</p>
                  <p style={{ margin:0, color:"#a3e635", fontWeight:900, fontSize:15 }}>{s.pct}%</p>
                </div>
                <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:99, width:`${s.pct}%`,
                    background:"linear-gradient(90deg, #a3e635, #34d399)" }} />
                </div>
                <p style={{ margin:"10px 0 0", color:"rgba(255,255,255,0.28)", fontSize:13 }}>
                  {s.done} of {s.totalTasks} tasks completed
                </p>
              </Glass>
            </div>
          )}

          {/* ── ASSESSMENT ── */}
          {activeView === "assessment" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ marginBottom:4 }}>
                <h2 style={{ margin:0, color:"#fff", fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>Assessment</h2>
                <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.35)", fontSize:14 }}>Test your skills and refine your level.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Glass className="stat-card">
                  <p style={{ margin:"0 0 12px", color:"rgba(255,255,255,0.28)", fontSize:10, fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.16em" }}>Current Level</p>
                  <p style={{ margin:0, color:"#a3e635", fontSize:30, fontWeight:900, letterSpacing:"-0.03em" }}>{s.level}</p>
                  <p style={{ margin:"8px 0 0", color:"rgba(255,255,255,0.38)", fontSize:13 }}>
                    Language: <span style={{ color:"#fff", fontWeight:600 }}>{s.displayLang}</span>
                  </p>
                </Glass>
                <Glass className="stat-card">
                  <p style={{ margin:"0 0 12px", color:"rgba(255,255,255,0.28)", fontSize:10, fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.16em" }}>Last Score</p>
                  <p style={{ margin:0, color:"#fff", fontSize:30, fontWeight:900, letterSpacing:"-0.03em" }}>{s.score}</p>
                  <p style={{ margin:"8px 0 0", color:"rgba(255,255,255,0.38)", fontSize:13 }}>
                    {s.quizzes} retake{s.quizzes !== 1 ? "s" : ""} taken
                  </p>
                </Glass>
              </div>
              <Glass>
                <h3 style={{ margin:"0 0 8px", color:"#fff", fontWeight:800, fontSize:17 }}>Ready to improve?</h3>
                <p style={{ margin:0, color:"rgba(255,255,255,0.4)", fontSize:14, lineHeight:1.65 }}>
                  Retake the assessment to update your proficiency score and unlock higher-level tasks.
                </p>
                <button onClick={() => navigate("/assessment")} style={{
                  marginTop:22, padding:"12px 26px", borderRadius:12, border:"none",
                  background:"#a3e635", color:"#0a1a0a", fontWeight:800, fontSize:14,
                  cursor:"pointer", display:"inline-flex", alignItems:"center", gap:9,
                  boxShadow:"0 8px 24px rgba(163,230,53,0.28)",
                }}>
                  Start Assessment <ArrowRight size={15} />
                </button>
              </Glass>
            </div>
          )}

          {/* ── LEARNING PATH ── */}
          {activeView === "learningPath" && (
            <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                <div>
                  <h2 style={{ margin:0, color:"#fff", fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>Learning Path</h2>
                  <p style={{ margin:"6px 0 0", color:"rgba(255,255,255,0.35)", fontSize:14 }}>
                    {s.langLabel} · {s.done}/{s.totalTasks} tasks complete
                  </p>
                </div>
                <button onClick={() => navigate("/learning-path")} style={{
                  padding:"10px 20px", borderRadius:12, border:"none", cursor:"pointer",
                  background:"rgba(163,230,53,0.12)", color:"#a3e635", fontWeight:700, fontSize:13,
                  display:"inline-flex", alignItems:"center", gap:8,
                  boxShadow:"inset 0 0 0 1px rgba(163,230,53,0.2)",
                }}>
                  Full View <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:99, width:`${s.pct}%`,
                  background:"linear-gradient(90deg, #a3e635, #34d399)" }} />
              </div>

              {!learningPaths.length ? (
                <Glass style={{ textAlign:"center", padding:52 }}>
                  <Layers size={30} color="rgba(255,255,255,0.12)" style={{ margin:"0 auto 14px" }} />
                  <p style={{ margin:0, color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:15 }}>No learning path yet</p>
                  <p style={{ margin:"7px 0 0", color:"rgba(255,255,255,0.22)", fontSize:13 }}>Complete an assessment first.</p>
                  <button onClick={() => setActiveView("assessment")} style={{
                    marginTop:22, padding:"11px 26px", borderRadius:12, border:"none",
                    background:"#a3e635", color:"#0a1a0a", fontWeight:800, fontSize:13, cursor:"pointer",
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
                      background:"rgba(255,255,255,0.045)",
                      backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
                      boxShadow:"inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0,
                        display:"grid", placeItems:"center", fontWeight:900, fontSize:13,
                        background: task.status === "completed" ? "rgba(52,211,153,0.18)"
                          : task.status === "unlocked" ? "rgba(163,230,53,0.18)"
                          : "rgba(255,255,255,0.05)",
                        color: task.status === "completed" ? "#34d399"
                          : task.status === "unlocked" ? "#a3e635"
                          : "rgba(255,255,255,0.22)" }}>
                        {task.status === "completed" ? <CheckCircle2 size={16} /> : i + 1}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:14,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.title}</p>
                        <p style={{ margin:"3px 0 0", color:"rgba(255,255,255,0.32)", fontSize:12,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.description}</p>
                      </div>
                      <StatusPill status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}