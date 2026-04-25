import { useState } from 'react';
import { X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import CodeEditor from '../CodeEditor/CodeEditor';
import learningPathService from '../../services/learningPathService';
import './TaskModal.css';

export default function TaskModal({ task, language, userId, onClose, onTaskComplete }) {
  const [code, setCode] = useState(task?.draftCode || task?.starterCode || '');
  const [loading, setLoading] = useState(false);
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

      setFeedback({
        passed: feedbackResult.canComplete || false,
        qualityScore: feedbackResult.qualityScore,
        feedback: feedbackResult.feedback,
        suggestions: feedbackResult.suggestions || [],
        passScore: feedbackResult.passScore,
      });

      // If passed, submit the solution to unlock next task
      if (feedbackResult.canComplete) {
        const result = await learningPathService.submitTaskSolution({
          userId,
          language,
          taskId: task.taskId,
          code: submittedCode,
        });

        setFeedback((prev) => ({
          ...prev,
          passed: true,
          unlockedTaskId: result.unlockedTaskId,
        }));

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

  const passStatus = feedback?.qualityScore && feedback.qualityScore >= passScore;

  return (
    <div className="task-modal-overlay">
      <div className="task-modal-container">
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-title">
            <h2>{task?.title}</h2>
            <span className="task-badge">Task {task?.order}/5</span>
          </div>
          <button onClick={onClose} className="task-modal-close" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="task-modal-content">
          {/* Left: Task Details */}
          <div className="task-details-section">
            {/* Description */}
            <div className="task-section">
              <h3>Task Description</h3>
              <p className="task-description">{task?.description}</p>
            </div>

            {/* Explanation */}
            <div className="task-section">
              <h3>💡 How to Approach</h3>
              <p className="task-explanation">{task?.explanation}</p>
            </div>

            {/* Hints */}
            {task?.hints && task.hints.length > 0 && (
              <div className="task-section">
                <h3>💬 Hints</h3>
                <ul className="hints-list">
                  {task.hints.map((hint, idx) => {
                    // Handle different hint formats
                    let hintText = '';
                    let difficulty = 'light';
                    
                    if (typeof hint === 'string') {
                      hintText = hint;
                    } else if (hint?.text) {
                      hintText = hint.text;
                      difficulty = hint.difficulty || 'light';
                    } else if (hint?.hint) {
                      hintText = hint.hint;
                      difficulty = hint.difficulty || 'light';
                    } else {
                      hintText = 'Check the task description for hints';
                    }
                    
                    return (
                      <li key={idx} className="hint-item">
                        <span className={`hint-difficulty hint-${difficulty}`}>
                          {difficulty}
                        </span>
                        <span className="hint-text">{hintText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Test Cases */}
            {task?.testCases && task.testCases.length > 0 && (
              <div className="task-section">
                <h3>✓ Test Cases</h3>
                <div className="test-cases-list">
                  {task.testCases.map((tc, idx) => (
                    <div key={idx} className="test-case-item">
                      <div className="test-case-description">
                        {tc.description && <span className="tc-desc">{tc.description}</span>}
                      </div>
                      <div className="test-case-content">
                        <div className="test-io">
                          <span className="test-label">Input:</span>
                          <code className="test-value">{tc.input}</code>
                        </div>
                        <div className="test-io">
                          <span className="test-label">Expected:</span>
                          <code className="test-value">{tc.expectedOutput}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task Status */}
            <div className="task-section task-status">
              <p className="status-label">Status</p>
              <p className={`status-badge ${task?.status}`}>
                {task?.status === 'completed' && '✓ Completed'}
                {task?.status === 'unlocked' && '⭐ In Progress'}
                {task?.status === 'locked' && '🔒 Locked'}
              </p>
              {task?.attempts > 0 && (
                <p className="attempts-count">Attempts: {task.attempts}</p>
              )}
            </div>
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

            {/* Feedback Below Editor */}
            {feedback && (
              <div className={`feedback-section ${passStatus ? 'success' : 'pending'}`}>
                <div className="feedback-header">
                  {passStatus ? (
                    <>
                      <CheckCircle size={20} className="feedback-icon success" />
                      <span className="feedback-title">Solution Approved!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} className="feedback-icon warning" />
                      <span className="feedback-title">Code Review</span>
                    </>
                  )}
                </div>

                <div className="feedback-content">
                  {feedback.feedback && (
                    <p className="feedback-text">{feedback.feedback}</p>
                  )}

                  {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div className="suggestions-box">
                      <p className="suggestions-title">Suggestions:</p>
                      <ul className="suggestions-list">
                        {feedback.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="suggestion-item">
                            → {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback.error && (
                    <p className="error-message">⚠️ {feedback.error}</p>
                  )}

                  {passStatus && (
                    <p className="success-message">✨ Great work! Next task will unlock automatically...</p>
                  )}
                </div>
              </div>
            )}
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
