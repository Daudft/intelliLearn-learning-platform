import { useState } from 'react';
import { X } from 'lucide-react';
import CodeEditor from '../CodeEditor/CodeEditor';
import AIAgent from '../AIAgent/AIAgent';
import learningPathService from '../../services/learningPathService';
import './TaskModal.css';

export default function TaskModal({ task, language, userId, totalTasks, onClose, onTaskComplete }) {
  const [code, setCode] = useState(task?.draftCode || task?.starterCode || '');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const passScore = 7;

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
      <div className="task-modal-container">
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-title">
            <h2>{task?.title}</h2>
            <span className="task-badge">Task {task?.order}/{totalTasks || '?'}</span>
          </div>
          <button onClick={onClose} className="task-modal-close" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="task-modal-content">
          {/* Left: AI Learning Assistant */}
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
