import { useState } from 'react';
import { X, Send, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import CodeEditor from '../CodeEditor/CodeEditor';
import learningPathService from '../../services/learningPathService';
import './TaskModal.css';

export default function TaskModal({ task, language, userId, onClose, onTaskComplete }) {
  const [code, setCode] = useState(task?.starterCode || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setFeedback(null);

      const result = await learningPathService.submitTaskSolution({
        userId,
        language,
        taskId: task.taskId,
        code,
      });

      setFeedback({
        passed: result.passed,
        qualityScore: result.qualityScore,
        feedback: result.feedback,
        suggestions: result.suggestions || [],
        passScore: result.passScore,
      });

      setSubmitted(true);

      if (result.passed) {
        setTimeout(() => {
          onTaskComplete();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setFeedback({
        passed: false,
        error: error.message || 'Failed to submit code',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal-container">
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-title">
            <h2>{task?.title}</h2>
            <span className="task-badge">{task?.order}/5</span>
          </div>
          <button onClick={onClose} className="task-modal-close">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="task-modal-content">
          <div className="task-details-section">
            {/* Description */}
            <div className="task-section">
              <h3>Task Description</h3>
              <p className="task-description">{task?.description}</p>
            </div>

            {/* Explanation */}
            <div className="task-section">
              <h3>How to Approach</h3>
              <p className="task-explanation">{task?.explanation}</p>
            </div>

            {/* Hints */}
            {task?.hints && task.hints.length > 0 && (
              <div className="task-section">
                <h3>Hints</h3>
                <ul className="hints-list">
                  {task.hints.map((hint, idx) => (
                    <li key={idx} className="hint-item">
                      <span className="hint-difficulty">{hint.difficulty || 'tip'}</span>
                      <span className="hint-text">{hint.hint || hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Code Editor Section */}
          <div className="code-editor-section">
            <h3>Write Your Solution</h3>
            <div className="code-editor-wrapper">
              <CodeEditor
                language={language}
                value={code}
                onChange={setCode}
                height="300px"
              />
            </div>
          </div>

          {/* Feedback Section */}
          {feedback && (
            <div className={`feedback-section ${feedback.passed ? 'success' : 'error'}`}>
              <div className="feedback-header">
                {feedback.passed ? (
                  <>
                    <CheckCircle size={24} className="feedback-icon success-icon" />
                    <span>Great Job! Task Completed!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={24} className="feedback-icon error-icon" />
                    <span>Code Review Complete</span>
                  </>
                )}
              </div>

              <div className="feedback-content">
                <div className="quality-score">
                  <span className="score-label">Quality Score:</span>
                  <span className={`score-value ${feedback.passed ? 'passed' : ''}`}>
                    {feedback.qualityScore}/{feedback.passScore}
                  </span>
                  {feedback.passScore && (
                    <span className="pass-requirement">
                      (Pass: {feedback.passScore}+)
                    </span>
                  )}
                </div>

                <p className="feedback-text">{feedback.feedback}</p>

                {feedback.suggestions && feedback.suggestions.length > 0 && (
                  <div className="suggestions">
                    <strong>Suggestions for Improvement:</strong>
                    <ul>
                      {feedback.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.error && (
                  <p className="error-message">{feedback.error}</p>
                )}
              </div>

              {feedback.passed && (
                <p className="next-task-message">Next task will unlock soon...</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="task-modal-footer">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Solution
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
