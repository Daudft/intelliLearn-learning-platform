import { useState, useMemo, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import CodeEditor from '../CodeEditor/CodeEditor';
import AIAgent from '../AIAgent/AIAgent';
import learningPathService from '../../services/learningPathService';
import './TaskModal.css';

// Clean, minimal skeletons so the editor opens on basic boilerplate instead of a
// pre-filled solution. Class name matches CodeEditor's Solution.java filename.
const BOILERPLATE = {
  c: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n\n    return 0;\n}\n`,
  python: `# Write your solution here\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n\n    }\n}\n`,
};

const getBoilerplate = (language) =>
  BOILERPLATE[String(language).toLowerCase()] || BOILERPLATE.python;

export default function TaskModal({ task, language, userId, totalTasks, onClose, onTaskComplete }) {
  // Open on the learner's own saved code if they have any, otherwise clean
  // boilerplate (empty main). We ignore the generated starterCode (it can hold a
  // pre-filled solution); draftCode is only ever what the learner wrote/submitted.
  const [code, setCode] = useState(task?.draftCode || getBoilerplate(language));
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Whether the task was ALREADY completed before this session — used to award
  // the +5 celebration only on the first completion (retries don't earn points).
  const alreadyCompletedRef = useRef(task?.status === 'completed');
  // Once completed here, refresh the parent list when the modal finally closes.
  const [needsRefreshOnClose, setNeedsRefreshOnClose] = useState(false);
  // Saved history of program-run outputs for this task (persisted server-side).
  const [outputs, setOutputs] = useState(task?.outputs || []);

  // Lock the background page scroll (and its scrollbar) while the task is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const passScore = 7;

  // Confetti pieces for the reward celebration (generated once)
  const confetti = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      left: `${Math.round(Math.random() * 100)}%`,
      size: 6 + Math.round(Math.random() * 8),
      color: ['#ffd93b', '#2f6bff', '#ff6b9d', '#12b76a', '#7c5cff', '#ff6b35'][i % 6],
      dur: 1.4 + Math.random() * 1.2,
      delay: Math.random() * 0.5,
      round: Math.random() > 0.5,
    })),
    []
  );

  const handleSubmit = async (submittedCode) => {
    try {
      setIsSubmitting(true);
      setFeedback(null);
      setCode(submittedCode);
      setShowAI(true); // reveal the assistant so the output + review are visible

      // One call: the backend runs the code, reviews it, and only marks the task
      // complete if it BOTH runs cleanly AND meets the score threshold.
      const result = await learningPathService.submitTaskSolution({
        userId,
        language,
        taskId: task.taskId,
        code: submittedCode,
      });

      // Track this run's output locally for the Output button.
      if (result.output) {
        setOutputs((prev) => [...prev, { ...result.output, at: new Date().toISOString() }]);
      }

      setFeedback({
        passed: result.passed || false,
        qualityScore: result.qualityScore,
        feedback: result.feedback,
        suggestions: result.suggestions || [],
        passScore: result.passScore,
        unlockedTaskId: result.unlockedTaskId,
        output: result.output, // real program output from Paiza (or null)
        reason: result.reason, // 'run_error' | 'low_score' | 'could_not_run'
      });

      if (result.passed) {
        // Progress is saved server-side; refresh the parent when we close.
        setNeedsRefreshOnClose(true);

        // Celebrate only the FIRST time this task is completed — retries let the
        // learner improve their code but never earn points again. Stay on the
        // page afterwards so they can read the output + feedback.
        if (!alreadyCompletedRef.current) {
          alreadyCompletedRef.current = true;
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 2500);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setFeedback({
        passed: false,
        error: error.response?.data?.message || error.message || 'Failed to submit code',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // When the learner edits after a submission, drop the last feedback so the
  // Submit button reverts from "Approved!" back to "Submit" for the retry.
  const handleCodeChange = (val) => {
    setCode(val);
    if (feedback) setFeedback(null);
  };

  // Persist whatever is in the editor (so nothing is lost), refresh the parent
  // list if the task was completed this session, then close.
  const handleClose = () => {
    learningPathService
      .saveTaskDraft({ userId, language, taskId: task.taskId, code })
      .catch(() => {});
    if (needsRefreshOnClose) onTaskComplete?.();
    onClose();
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal-container" style={{ position: 'relative' }}>
        {/* +5 points reward celebration */}
        {submitted && (
          <div style={{ position:'absolute', inset:0, zIndex:50, display:'grid', placeItems:'center', background:'rgba(10,12,20,0.62)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', overflow:'hidden' }}>
            <style>{`
              @keyframes reward-pop { 0%{transform:scale(0) rotate(-12deg);opacity:0} 60%{transform:scale(1.12) rotate(4deg);opacity:1} 100%{transform:scale(1) rotate(0)} }
              @keyframes reward-ring { 0%{transform:scale(0.55);opacity:0.85} 100%{transform:scale(2.3);opacity:0} }
              @keyframes reward-float-up { 0%{transform:translateY(14px);opacity:0} 100%{transform:translateY(0);opacity:1} }
              @keyframes reward-confetti { 0%{transform:translateY(-30px) rotate(0);opacity:1} 100%{transform:translateY(380px) rotate(560deg);opacity:0} }
              @keyframes reward-glow { 0%,100%{text-shadow:0 0 22px rgba(255,180,0,0.7)} 50%{text-shadow:0 0 44px rgba(255,180,0,1)} }
            `}</style>
            {confetti.map((c, i) => (
              <span key={i} style={{ position:'absolute', left:c.left, top:'-5%', width:c.size, height:c.size, background:c.color, borderRadius:c.round?'50%':2, animation:`reward-confetti ${c.dur}s ${c.delay}s ease-in forwards` }} />
            ))}
            <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', animation:'reward-pop .6s cubic-bezier(.34,1.56,.64,1) both' }}>
              <div style={{ position:'relative', width:100, height:100, display:'grid', placeItems:'center', marginBottom:8 }}>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(255,217,59,0.6)', animation:'reward-ring 1.4s ease-out infinite' }} />
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(47,107,255,0.5)', animation:'reward-ring 1.4s ease-out .5s infinite' }} />
                <div style={{ width:84, height:84, borderRadius:'50%', background:'linear-gradient(135deg,#ffd93b,#ff9500)', display:'grid', placeItems:'center', fontSize:40, boxShadow:'0 10px 30px rgba(255,150,0,0.6)' }}>⚡</div>
              </div>
              <div style={{ fontSize:62, fontWeight:900, color:'#ffd93b', fontFamily:"'Space Grotesk', system-ui, sans-serif", lineHeight:1, animation:'reward-glow 1.2s ease-in-out infinite' }}>+5</div>
              <div style={{ marginTop:4, fontSize:13, fontWeight:800, letterSpacing:'0.22em', color:'rgba(255,255,255,0.85)' }}>POINTS EARNED</div>
              <div style={{ marginTop:16, fontSize:22, fontWeight:800, color:'#fff', fontFamily:"'Space Grotesk', system-ui, sans-serif", animation:'reward-float-up .5s .25s ease both' }}>Task Complete! 🎉</div>
              <div style={{ marginTop:6, fontSize:13, color:'rgba(255,255,255,0.72)', animation:'reward-float-up .5s .4s ease both' }}>You're climbing the leaderboard 🚀</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-title">
            <h2>{task?.title}</h2>
            <span className="task-badge">Task {task?.order}/{totalTasks || '?'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setShowAI((v) => !v)} className={`ai-toggle-btn ${showAI ? 'active' : ''}`}>
              <Sparkles size={15} /> {showAI ? 'Hide Assistant' : 'AI Assistant'}
            </button>
            <button onClick={handleClose} className="task-modal-close" disabled={isSubmitting}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="task-modal-content" style={{ gridTemplateColumns: showAI ? undefined : '1fr' }}>
          {/* Left: AI Learning Assistant (collapsed by default) */}
          {showAI && (
            <div className="task-ai-section">
              <AIAgent
                title={task?.title}
                description={task?.description}
                language={language}
                proficiencyLevel={task?.proficiencyLevel || 'Beginner'}
                taskCompleted={task?.status === 'completed'}
                submissionFeedback={feedback}
                isSubmitting={isSubmitting}
                currentCode={code}
                outputs={outputs}
              />
            </div>
          )}

          {/* Right: Code Editor */}
          <div className="code-editor-section">
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <CodeEditor
                language={language}
                initialCode={code}
                onSubmit={handleSubmit}
                onCodeChange={handleCodeChange}
                isSubmitting={isSubmitting}
                canSubmit={true}
                passScore={passScore}
                qualityScore={feedback?.qualityScore}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="task-modal-footer">
          <button
            onClick={handleClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Close
          </button>
          {!submitted && (
            <p className="footer-info">
              Pass Score: <strong>{passScore}/10</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
