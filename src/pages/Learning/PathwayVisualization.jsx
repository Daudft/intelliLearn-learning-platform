import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import learningPathService from '../../services/learningPathService';
import TaskModal from '../../components/TaskModal/TaskModal';
import QuizModal from '../../components/QuizModal/QuizModal';
import { Loader, AlertCircle, Lock, CheckCircle2, Play, Award, ArrowLeft } from 'lucide-react';

const DISPLAY_FONT = "'Space Grotesk', system-ui, sans-serif";

/* ─── Per-language color themes ─── */
const LANG_THEME = {
  c:      { solid:"#2f6bff", grad:"linear-gradient(135deg,#2f6bff,#4da2ff)", soft:"#eaf0ff", glow:"rgba(47,107,255,0.32)", emoji:"⚙️", label:"C Language" },
  python: { solid:"#7c5cff", grad:"linear-gradient(135deg,#7c5cff,#b06bff)", soft:"#f1ecff", glow:"rgba(124,92,255,0.32)", emoji:"🐍", label:"Python" },
  java:   { solid:"#ff7a1a", grad:"linear-gradient(135deg,#ff7a1a,#ffb020)", soft:"#fff1e2", glow:"rgba(255,122,26,0.32)", emoji:"☕", label:"Java" },
};
const themeFor = (lang) => LANG_THEME[String(lang || "").toLowerCase()] || LANG_THEME.c;
const GREEN = { solid:"#12b76a", soft:"#e6f7ef", grad:"linear-gradient(135deg,#12b76a,#3ddc97)" };

export default function PathwayVisualization() {
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const stored = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const userId = stored?.id || stored?._id;

  useEffect(() => {
    if (userId) fetchLearningPath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await learningPathService.waitForLearningPath(userId);
      setLearningPath(data.learningPath);
      if (data.learningPath?.paths?.length > 0 && !selectedLanguage) {
        setSelectedLanguage(data.learningPath.paths[0].language);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = (task) => { setSelectedTask(task); setShowModal(true); };
  const handleTaskComplete = () => { fetchLearningPath(); };

  const handleAdvanceCycle = async () => {
    try {
      setAdvancing(true);
      setError(null);
      await learningPathService.advanceCycle({ userId, language: selectedLanguage });
      await fetchLearningPath();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start next cycle.');
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background:"#f5f5f4" }}>
        <style>{`@keyframes lp-spin{to{transform:rotate(360deg)}}`}</style>
        <Loader size={34} color="#2f6bff" style={{ animation:"lp-spin .8s linear infinite" }} />
      </div>
    );
  }

  const paths = learningPath?.paths || [];
  const currentPath = paths.find((p) => p.language === selectedLanguage);
  const th = themeFor(selectedLanguage);
  const tasks = currentPath?.tasks || [];
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'completed').length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const allCompleted = total > 0 && done === total;
  const quizPassed = currentPath?.quiz?.status === 'passed';

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f4", fontFamily:"'Inter', system-ui, sans-serif", padding:"30px 24px 60px" }}>
      <div style={{ maxWidth:920, margin:"0 auto" }}>

        {paths.length > 0 ? (
          <>
            {/* ── Language-themed hero ── */}
            <div style={{ position:"relative", borderRadius:20, overflow:"hidden", background:th.grad, boxShadow:`0 16px 40px ${th.glow}` }}>
              <div style={{ position:"absolute", top:-60, right:-30, width:210, height:210, borderRadius:"50%", background:"rgba(255,255,255,0.16)", pointerEvents:"none" }} />
              <div style={{ position:"absolute", bottom:-90, left:90, width:190, height:190, borderRadius:"50%", background:"rgba(255,255,255,0.10)", pointerEvents:"none" }} />

              <div style={{ position:"relative", padding:"22px 30px 26px" }}>
                <button onClick={() => navigate('/dashboard')} style={{
                  display:"inline-flex", alignItems:"center", gap:6, padding:"6px 13px", borderRadius:99,
                  border:"1px solid rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.16)", color:"#fff",
                  fontWeight:700, fontSize:12, cursor:"pointer", marginBottom:18, backdropFilter:"blur(4px)",
                }}>
                  <ArrowLeft size={14} /> Back to Dashboard
                </button>
                <div style={{ display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>
                  <div style={{ width:66, height:66, borderRadius:18, background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)", display:"grid", placeItems:"center", fontSize:30, flexShrink:0 }}>
                    {th.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:200 }}>
                    <p style={{ margin:0, fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.8)", textTransform:"uppercase", letterSpacing:"0.14em" }}>Learning Pathway</p>
                    <h1 style={{ margin:"3px 0 0", fontSize:28, fontWeight:800, color:"#fff", fontFamily:DISPLAY_FONT, letterSpacing:"-0.02em" }}>{th.label}</h1>
                    <p style={{ margin:"4px 0 0", fontSize:12.5, color:"rgba(255,255,255,0.82)" }}>
                      {currentPath?.proficiencyLevel || 'Beginner'} Level • Cycle {currentPath?.cycle || 1}
                    </p>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:42, fontWeight:900, color:"#fff", fontFamily:DISPLAY_FONT, lineHeight:1 }}>{pct}%</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.82)", fontWeight:600, marginTop:2 }}>{done}/{total} tasks</div>
                  </div>
                </div>

                {/* Language selector */}
                {paths.length > 1 && (
                  <div style={{ display:"flex", gap:8, marginTop:18, flexWrap:"wrap" }}>
                    {paths.map((p) => {
                      const active = p.language === selectedLanguage;
                      const pth = themeFor(p.language);
                      return (
                        <button key={p.language} onClick={() => setSelectedLanguage(p.language)} style={{
                          display:"inline-flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:99, cursor:"pointer",
                          border: active ? "none" : "1px solid rgba(255,255,255,0.45)",
                          background: active ? "#fff" : "rgba(255,255,255,0.14)",
                          color: active ? pth.solid : "#fff", fontWeight:700, fontSize:12.5,
                        }}>
                          <span>{pth.emoji}</span> {pth.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Progress bar */}
                <div style={{ marginTop:18, height:8, borderRadius:99, background:"rgba(255,255,255,0.25)", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:99, width:`${pct}%`, background:"#fff", boxShadow:"0 0 12px rgba(255,255,255,0.6)", transition:"width .8s cubic-bezier(.4,0,.2,1)" }} />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, background:"#fff0f0", border:"1px solid #ffd0d0", color:"#c0392b", fontSize:13, fontWeight:600 }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {currentPath && (
              <>
                {/* Quiz banner */}
                {allCompleted && (
                  <div style={{ marginTop:20, borderRadius:16, padding:"18px 22px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
                    background: quizPassed ? GREEN.soft : th.soft, border:`1px solid ${(quizPassed ? GREEN.solid : th.solid)}33` }}>
                    <div style={{ width:52, height:52, borderRadius:14, background: quizPassed ? GREEN.grad : th.grad, display:"grid", placeItems:"center", flexShrink:0, boxShadow:`0 8px 20px ${quizPassed ? 'rgba(18,183,106,0.3)' : th.glow}` }}>
                      <Award size={26} color="#fff" />
                    </div>
                    <div style={{ flex:1, minWidth:200 }}>
                      <p style={{ margin:0, fontSize:15, fontWeight:800, color:"#0a0a0a", fontFamily:DISPLAY_FONT }}>
                        {quizPassed ? '✅ Cycle quiz passed!' : '🎉 All tasks complete!'}
                      </p>
                      <p style={{ margin:"3px 0 0", fontSize:12.5, color:"rgba(0,0,0,0.55)", lineHeight:1.45 }}>
                        {quizPassed
                          ? 'Start the next cycle for a fresh set of questions tailored to your score.'
                          : 'Take the cycle quiz: 7 MCQs + 3 coding challenges. Score 80% to advance.'}
                      </p>
                    </div>
                    {quizPassed ? (
                      <button onClick={handleAdvanceCycle} disabled={advancing} style={{
                        padding:"11px 22px", borderRadius:10, border:"none", cursor:"pointer",
                        background:GREEN.grad, color:"#fff", fontWeight:800, fontSize:13, whiteSpace:"nowrap",
                        boxShadow:"0 8px 20px rgba(18,183,106,0.3)", opacity: advancing ? 0.7 : 1,
                      }}>
                        {advancing ? 'Generating…' : 'Start Next Cycle'}
                      </button>
                    ) : (
                      <button onClick={() => setShowQuiz(true)} style={{
                        padding:"11px 22px", borderRadius:10, border:"none", cursor:"pointer",
                        background:th.grad, color:"#fff", fontWeight:800, fontSize:13, whiteSpace:"nowrap",
                        boxShadow:`0 8px 20px ${th.glow}`,
                      }}>
                        Take Quiz
                      </button>
                    )}
                  </div>
                )}

                {/* Tasks timeline */}
                <h2 style={{ margin:"26px 0 16px", fontSize:18, fontWeight:800, color:"#0a0a0a", fontFamily:DISPLAY_FONT }}>Task Progression</h2>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  {tasks.map((task, index) => {
                    const isCompleted = task.status === 'completed';
                    const isUnlocked = task.status !== 'locked';
                    const isCurrent = isUnlocked && !isCompleted;
                    const accent = isCompleted ? GREEN.solid : isCurrent ? th.solid : "rgba(0,0,0,0.14)";
                    const isLast = index === total - 1;

                    return (
                      <div key={task.taskId} style={{ display:"flex", gap:16, alignItems:"stretch" }}>
                        {/* Rail */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                          <div style={{
                            width:46, height:46, borderRadius:"50%", display:"grid", placeItems:"center", flexShrink:0,
                            fontFamily:DISPLAY_FONT, fontWeight:800, fontSize:15,
                            background: isCompleted ? GREEN.grad : isCurrent ? th.grad : "rgba(0,0,0,0.06)",
                            color: isUnlocked ? "#fff" : "rgba(0,0,0,0.3)",
                            boxShadow: isCompleted ? "0 6px 16px rgba(18,183,106,0.3)" : isCurrent ? `0 6px 16px ${th.glow}` : "none",
                            border: isUnlocked ? "none" : "1px solid rgba(0,0,0,0.1)",
                          }}>
                            {isCompleted ? <CheckCircle2 size={22} /> : isUnlocked ? (index + 1) : <Lock size={18} />}
                          </div>
                          {!isLast && (
                            <div style={{ width:3, flex:1, minHeight:26, margin:"6px 0", borderRadius:2,
                              background: isCompleted ? GREEN.solid : "rgba(0,0,0,0.08)" }} />
                          )}
                        </div>

                        {/* Card */}
                        <div style={{
                          flex:1, marginBottom:14, background:"#fff", border:"1px solid #e6e6e6",
                          borderLeft:`3px solid ${accent}`, borderRadius:12, padding:"16px 18px",
                          opacity: isUnlocked ? 1 : 0.6,
                        }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                            <div style={{ minWidth:0 }}>
                              <p style={{ margin:0, fontSize:10, fontWeight:800, color: isCurrent ? th.solid : "rgba(0,0,0,0.4)", textTransform:"uppercase", letterSpacing:"0.1em" }}>Task {task.order}</p>
                              <h3 style={{ margin:"3px 0 0", fontSize:16, fontWeight:800, color:"#0a0a0a", fontFamily:DISPLAY_FONT }}>{task.title}</h3>
                            </div>
                            <span style={{ padding:"4px 10px", borderRadius:99, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", flexShrink:0, whiteSpace:"nowrap",
                              background: isCompleted ? GREEN.soft : isCurrent ? th.soft : "rgba(0,0,0,0.05)",
                              color: isCompleted ? GREEN.solid : isCurrent ? th.solid : "rgba(0,0,0,0.4)" }}>
                              {isCompleted ? '✓ Completed' : isCurrent ? 'In Progress' : 'Locked'}
                            </span>
                          </div>

                          <p style={{ margin:"8px 0 0", fontSize:13, color:"rgba(0,0,0,0.55)", lineHeight:1.5 }}>{task.description}</p>

                          {task.attempts > 0 && (
                            <p style={{ margin:"10px 0 0", fontSize:12, color:"rgba(0,0,0,0.45)" }}>
                              Attempts: <strong style={{ color:"#0a0a0a" }}>{task.attempts}</strong>
                              {task.lastFeedbackScore ? <> • Last score: <strong style={{ color:"#0a0a0a" }}>{task.lastFeedbackScore}/10</strong></> : null}
                            </p>
                          )}

                          {isUnlocked && (
                            <button onClick={() => handleStartTask(task)} style={{
                              marginTop:14, padding:"10px 20px", borderRadius:10, cursor:"pointer",
                              background: isCompleted ? "#fff" : th.grad,
                              color: isCompleted ? th.solid : "#fff",
                              border: isCompleted ? `1px solid ${th.solid}44` : "none",
                              boxShadow: isCompleted ? "none" : `0 8px 20px ${th.glow}`,
                              fontWeight:800, fontSize:13, display:"inline-flex", alignItems:"center", gap:8,
                            }}>
                              {isCompleted ? 'Review Solution' : 'Start Task'}
                              {!isCompleted && <Play size={13} fill="#fff" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ marginTop:8, textAlign:"center", padding:"60px 24px", background:"#fff", border:"1px solid #e6e6e6", borderRadius:16 }}>
            <div style={{ fontSize:44 }}>🗺️</div>
            <p style={{ margin:"12px 0 0", fontWeight:800, fontSize:16, color:"#0a0a0a", fontFamily:DISPLAY_FONT }}>No learning path yet</p>
            <p style={{ margin:"6px 0 0", fontSize:13, color:"rgba(0,0,0,0.5)" }}>Complete the initial assessment to generate your personalized path.</p>
            <button onClick={() => navigate('/dashboard')} style={{
              marginTop:20, padding:"10px 22px", borderRadius:10, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#2f6bff,#4da2ff)", color:"#fff", fontWeight:800, fontSize:13,
              display:"inline-flex", alignItems:"center", gap:8, boxShadow:"0 8px 20px rgba(47,107,255,0.3)",
            }}>
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          language={selectedLanguage}
          userId={userId}
          totalTasks={currentPath?.tasks?.length}
          onClose={() => setShowModal(false)}
          onTaskComplete={handleTaskComplete}
        />
      )}

      {/* Quiz Modal */}
      {showQuiz && selectedLanguage && (
        <QuizModal
          language={selectedLanguage}
          userId={userId}
          onClose={() => { setShowQuiz(false); fetchLearningPath(); }}
          onQuizPassed={() => fetchLearningPath()}
        />
      )}
    </div>
  );
}
