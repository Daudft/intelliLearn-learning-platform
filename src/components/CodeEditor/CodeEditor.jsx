import { useState, useRef } from 'react';
import { Send, Check } from 'lucide-react';
import './CodeEditor-Simple.css';

export default function CodeEditor({ 
  language = 'python', 
  initialCode = '', 
  onSubmit,
  isSubmitting = false,
  canSubmit = true,
  passScore = 7,
  qualityScore = null,
}) {
  const [code, setCode] = useState(initialCode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please write some code before submitting.');
      return;
    }

    setError(null);
    setSubmitLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(code);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit code');
    } finally {
      setSubmitLoading(false);
    }
  };

  const isSuccessful = qualityScore && qualityScore >= passScore;

  return (
    <div className="code-editor-container-simple">
      {/* Large Code Editor Area */}
      <textarea
        ref={editorRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="code-textarea-large"
        placeholder="Write your code here..."
        spellCheck="false"
      />

      {/* Error/Hint Display */}
      {error && (
        <div className="code-error-hint">
          <strong>💡 Hint:</strong> {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="code-editor-footer-minimal">
        <button
          onClick={handleSubmit}
          disabled={submitLoading || !canSubmit || isSubmitting}
          className={`btn-submit-only ${isSuccessful ? 'btn-success' : ''}`}
        >
          {submitLoading || isSubmitting ? (
            <>
              <span className="spinner">⏳</span>
              Evaluating...
            </>
          ) : isSuccessful ? (
            <>
              <Check size={16} />
              Approved!
            </>
          ) : (
            <>
              <Send size={16} />
              Submit
            </>
          )}
        </button>
        <div className="score-badge">
          Pass: <strong>{passScore}/10</strong> {qualityScore && `| Current: ${qualityScore}/10`}
        </div>
      </div>
    </div>
  );
}
