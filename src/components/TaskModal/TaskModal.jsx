import { useState, useMemo, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import CodeEditor from '../CodeEditor/CodeEditor';
import AIAgent from '../AIAgent/AIAgent';
import learningPathService from '../../services/learningPathService';
import './TaskModal.css';

export default function TaskModal({ task, language, userId, totalTasks, onClose, onTaskComplete }) {
  const [code, setCode] = useState(task?.draftCode || task?.starterCode || '');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAI, setShowAI] = useState(false);

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

      // Save draft first
      await learningPathService.saveTaskDraft({
        userId,
        language,
        taskId: task.taskId,
        code: submittedCode,
      });

      // Get AI feedback
      const feedbackResult = await learningPathService.getTaskCodeFeedback({
        userId,
        language,
        taskId: task.taskId,
        code: submittedCode,
        proficiencyLevel: task.proficiencyLevel || 'Beginner',
      });

      // If passed, submit the solution to unlock the next task first,
      // so we can set the feedback state exactly once.
      let unlockedTaskId;
      if (feedbackResult.canComplete) {
        const result = await learningPathService.submitTaskSolution({
          userId,
          language,
          taskId: task.taskId,
          code: submittedCode,
        });
        unlockedTaskId = result.unlockedTaskId;
      }

      setFeedback({
        passed: feedbackResult.canComplete || false,
        qualityScore: feedbackResult.qualityScore,
        feedback: feedbackResult.feedback,
        suggestions: feedbackResult.suggestions || [],
        passScore: feedbackResult.passScore,
        unlockedTaskId,
      });

      if (feedbackResult.canComplete) {
        setSubmitted(true);

        // Close modal and refresh after a brief delay
        setTimeout(() => {
          onTaskComplete();
          onClose();
        }, 2500);
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
            <button onClick={onClose} className="task-modal-close" disabled={isSubmitting}>
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
                isSubmitting={isSubmitting}
                canSubmit={task?.status !== 'completed'}
                passScore={passScore}
                qualityScore={feedback?.qualityScore}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="task-modal-footer">
          <button
            onClick={onClose}
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
