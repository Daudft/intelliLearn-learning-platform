import { useState, useEffect } from 'react';
import { X, Loader, CheckCircle, XCircle, Award, AlertCircle } from 'lucide-react';
import learningPathService from '../../services/learningPathService';
import './QuizModal.css';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizModal({ language, userId, onClose, onQuizPassed }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);

  const [mcqAnswers, setMcqAnswers] = useState({}); // { [index]: 'A' }
  const [codingCode, setCodingCode] = useState({}); // { [questionId]: code }

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await learningPathService.getQuiz(userId, language);
        if (!data.eligible) {
          setError(data.message || 'Quiz is not available yet.');
          setQuiz(null);
        } else {
          setQuiz(data.quiz);
          // Seed coding editors with starter code
          const seed = {};
          (data.quiz.codingQuestions || []).forEach((c) => {
            seed[c.questionId] = c.starterCode || '';
          });
          setCodingCode(seed);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, language]);

  const selectMcq = (index, letter) => {
    setMcqAnswers((prev) => ({ ...prev, [index]: letter }));
  };

  const setCode = (questionId, value) => {
    setCodingCode((prev) => ({ ...prev, [questionId]: value }));
  };

  const answeredMcqs = quiz ? Object.keys(mcqAnswers).length : 0;
  const totalMcqs = quiz?.mcqs?.length || 0;
  const codedCount = quiz
    ? quiz.codingQuestions.filter((c) => (codingCode[c.questionId] || '').trim()).length
    : 0;
  const totalCoding = quiz?.codingQuestions?.length || 0;

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      setSubmitting(true);
      const mcqAnswerArray = quiz.mcqs.map((_, i) => mcqAnswers[i] || null);
      const codingSolutions = quiz.codingQuestions.map((c) => ({
        questionId: c.questionId,
        code: codingCode[c.questionId] || '',
      }));

      const res = await learningPathService.submitQuiz({
        userId,
        language,
        mcqAnswers: mcqAnswerArray,
        codingSolutions,
      });
      setResult(res);

      if (res.passed && onQuizPassed) {
        onQuizPassed(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvance = async () => {
    try {
      setAdvancing(true);
      await learningPathService.advanceCycle({ userId, language });
      if (onQuizPassed) onQuizPassed();
      onClose(); // parent refetches → shows the new set of tasks
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start next cycle.');
      setAdvancing(false);
    }
  };

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal-container">
        {/* Header */}
        <div className="quiz-modal-header">
          <div className="quiz-modal-title">
            <Award size={22} />
            <h2>Cycle Quiz</h2>
            {quiz && !result && (
              <span className="quiz-badge">7 MCQs + 3 Coding • Pass {quiz.passScore || 80}%</span>
            )}
          </div>
          <button onClick={onClose} className="quiz-modal-close" disabled={submitting}>
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="quiz-modal-content">
          {loading && (
            <div className="quiz-center">
              <Loader className="spin" size={28} />
              <p>Preparing your quiz…</p>
            </div>
          )}

          {!loading && error && !quiz && (
            <div className="quiz-center">
              <AlertCircle size={28} className="quiz-warn" />
              <p>{error}</p>
            </div>
          )}

          {/* ── RESULT VIEW ── */}
          {result && (
            <div className="quiz-result">
              <div className={`quiz-score-banner ${result.passed ? 'pass' : 'fail'}`}>
                {result.passed ? <CheckCircle size={40} /> : <XCircle size={40} />}
                <div>
                  <h3>{result.passed ? 'Quiz Passed!' : 'Not Quite Yet'}</h3>
                  <p className="quiz-score-line">
                    Score: <strong>{result.totalScore}/100</strong> (need {result.passScore})
                  </p>
                </div>
              </div>

              <div className="quiz-breakdown">
                <div className="breakdown-item">
                  <span>MCQs</span>
                  <strong>{result.breakdown.mcqCorrect}/{result.breakdown.mcqTotal} correct · {result.breakdown.mcqPoints} pts</strong>
                </div>
                <div className="breakdown-item">
                  <span>Coding</span>
                  <strong>{result.breakdown.codingPoints}/{result.breakdown.codingMax} pts</strong>
                </div>
              </div>

              <p className="quiz-result-message">{result.message}</p>

              {/* MCQ review */}
              <h4 className="quiz-section-title">MCQ Review</h4>
              <div className="quiz-review-list">
                {result.mcqResults.map((r) => (
                  <div key={r.index} className={`review-row ${r.correct ? 'ok' : 'bad'}`}>
                    {r.correct ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <div>
                      <p className="review-q">
                        Q{r.index + 1}: your answer <strong>{r.given || '—'}</strong>
                        {!r.correct && <> · correct <strong>{r.correctAnswer}</strong></>}
                      </p>
                      {r.explanation && <p className="review-exp">{r.explanation}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coding review */}
              <h4 className="quiz-section-title">Coding Review</h4>
              <div className="quiz-review-list">
                {result.codingResults.map((c) => (
                  <div key={c.questionId} className="coding-review">
                    <p className="review-q">
                      {c.title} — <strong>{c.qualityScore}/10</strong>
                    </p>
                    {c.feedback && <p className="review-exp">{c.feedback}</p>}
                  </div>
                ))}
              </div>

              <div className="quiz-result-actions">
                {result.passed ? (
                  <button className="quiz-btn-primary" onClick={handleAdvance} disabled={advancing}>
                    {advancing ? (
                      <><Loader size={16} className="spin" /> Generating next questions…</>
                    ) : (
                      'Start Next Cycle'
                    )}
                  </button>
                ) : (
                  <button className="quiz-btn-primary" onClick={onClose}>Back to Tasks</button>
                )}
              </div>
            </div>
          )}

          {/* ── QUIZ FORM ── */}
          {quiz && !result && (
            <div className="quiz-form">
              <h4 className="quiz-section-title">Part 1 — Multiple Choice ({totalMcqs})</h4>
              {quiz.mcqs.map((m, i) => (
                <div key={i} className="mcq-card">
                  <p className="mcq-question">{i + 1}. {m.question}</p>
                  <div className="mcq-options">
                    {LETTERS.map((L) => (
                      <label
                        key={L}
                        className={`mcq-option ${mcqAnswers[i] === L ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`mcq-${i}`}
                          checked={mcqAnswers[i] === L}
                          onChange={() => selectMcq(i, L)}
                        />
                        <span className="mcq-letter">{L}</span>
                        <span className="mcq-text">{m.options?.[L]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <h4 className="quiz-section-title">Part 2 — Coding Challenges ({totalCoding})</h4>
              {quiz.codingQuestions.map((c, idx) => (
                <div key={c.questionId} className="coding-card">
                  <p className="coding-title">{idx + 1}. {c.title}</p>
                  <p className="coding-desc">{c.description}</p>
                  <textarea
                    className="coding-textarea"
                    value={codingCode[c.questionId] || ''}
                    onChange={(e) => setCode(c.questionId, e.target.value)}
                    spellCheck="false"
                    placeholder="Write your solution here…"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {quiz && !result && (
          <div className="quiz-modal-footer">
            <p className="quiz-progress">
              MCQs {answeredMcqs}/{totalMcqs} · Coding {codedCount}/{totalCoding}
            </p>
            <button
              className="quiz-btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader size={16} className="spin" /> Grading…</>
              ) : (
                'Submit Quiz'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
