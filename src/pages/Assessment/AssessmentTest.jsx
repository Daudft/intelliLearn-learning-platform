import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assessmentService from "../../services/assessmentService";

export default function AssessmentTest() {
  const params = useParams();
  const navigate = useNavigate();

  const languageParam = (params?.language ?? "unknown").toString();
  const normalizedLanguage = languageParam.toLowerCase();

  // Adaptive Assessment States
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [previousAnswerFeedback, setPreviousAnswerFeedback] = useState(null);

  useEffect(() => {
    setLoading(true);
    setPreviousAnswerFeedback(null);
    setQuestionIndex(0);
    setSubmitting(false);
    startAssessment();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedLanguage]);

  const startAssessment = async () => {
    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      if (!user) {
        alert("Please sign in first.");
        navigate("/signin");
        return;
      }

      const userId = user.id ?? user._id;

      const data = await assessmentService.startAdaptiveAssessment({
        userId,
        language: normalizedLanguage,
      });

      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setQuestionIndex(1);
    } catch (error) {
      console.error("Error starting assessment:", error);
      alert("Failed to start assessment. Returning to assessments.");
      navigate("/assessment", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (selectedAnswer) => {
    if (!currentQuestion || submitting) return;

    setSubmitting(true);

    try {
      const data = await assessmentService.submitAdaptiveAnswer({
        sessionId,
        questionId: currentQuestion._id,
        userAnswer: selectedAnswer,
      });

      if (data.result) {
        // Assessment completed
        navigate("/assessment/result", {
          state: {
            result: data.result,
            language: normalizedLanguage,
          },
        });
      } else {
        // Next question
        setPreviousAnswerFeedback({
          isCorrect: data.isCorrect,
          selected: selectedAnswer,
          correct: data.isCorrect ? selectedAnswer : data.question?.correctAnswer,
        });

        setCurrentQuestion(data.question);
        setQuestionIndex(data.question.questionIndex);

        // Auto-scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      const msg = error?.response?.data?.message || "Failed to submit answer";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading screen (accessible)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center" role="status" aria-live="polite">
          <div className="relative inline-block" aria-hidden>
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-transparent border-t-black absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-500 mt-4 font-medium">Starting adaptive assessment...</p>
        </div>
      </div>
    );
  }

  // safe guards for zero-questions state
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="bg-white border border-gray-200 p-8 max-w-lg text-center">
          <h3 className="font-display text-xl font-bold text-black mb-2">No question available</h3>
          <p className="text-sm text-gray-500 mb-5">There was an issue loading the question.</p>
          <button
            onClick={() => navigate("/assessment")}
            className="px-5 py-2.5 bg-black text-white font-semibold transition-colors hover:bg-gray-800"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col max-w-5xl mx-auto w-full p-3 sm:p-4">

        {/* Header */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 mb-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-black tracking-tight">
                {(normalizedLanguage || "Assessment").toUpperCase()} Assessment
              </h2>
              <span className="text-sm text-gray-400 font-medium">
                Question {questionIndex}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-black text-white text-xs font-bold uppercase tracking-wide">
                Difficulty: {currentQuestion?.difficulty?.toUpperCase() || "MEDIUM"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (questionIndex / 15) * 100)}%` }}
              aria-hidden
            />
          </div>
        </div>

        {/* Previous Answer Feedback */}
        {previousAnswerFeedback && (
          <div
            className={
              "mb-4 p-4 font-semibold border " +
              (previousAnswerFeedback.isCorrect
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300")
            }
          >
            {previousAnswerFeedback.isCorrect ? '✅ Correct! Moving to next difficulty level.' : '❌ Incorrect. Adjusting difficulty...'}
          </div>
        )}

        {/* Main Question Area with Side Numbering */}
        <div className="flex-1 flex gap-4 min-h-0">

          {/* Side numbering (non-interactive to preserve adaptive flow) */}
          <aside className="w-20 hidden sm:flex flex-col py-3 min-h-0">
            <div className="bg-white border border-gray-200 p-2 w-full flex-1 min-h-0 flex flex-col">
              <div className="text-xs text-gray-400 font-semibold mb-2 text-center shrink-0">Questions</div>
              <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => {
                  const num = i + 1;
                  const isCurrent = num === questionIndex;
                  return (
                    <div
                      key={num}
                      className={("w-full flex items-center justify-center flex-1 min-h-0 text-sm font-semibold ") + (isCurrent ? 'bg-black text-white' : 'bg-gray-100 text-gray-500')}
                      aria-current={isCurrent ? 'true' : 'false'}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1 bg-white border border-gray-200 flex flex-col overflow-hidden">

          {/* Question Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 border border-gray-300 text-black text-xs font-bold uppercase tracking-wide">
                  {currentQuestion?.topic || "Question"}
                </span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-black leading-snug">
              {currentQuestion?.question || "No question text available."}
            </h3>
          </div>

          {/* Code Block + Options */}
          <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6">
            {currentQuestion?.code && (
              <div className="bg-black text-gray-100 p-4 mb-6 font-mono text-sm overflow-auto">
                <pre className="whitespace-pre-wrap">{currentQuestion.code}</pre>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {Array.isArray(currentQuestion?.options) && currentQuestion.options.length > 0 ? (
                currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={submitting}
                    className={
                      "group w-full text-left p-4 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 " +
                      (submitting
                        ? "cursor-not-allowed opacity-50 border-gray-200"
                        : "cursor-pointer border-gray-200 bg-white hover:border-black hover:shadow-md")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center transition-colors group-hover:border-black" />
                      <span className="text-black font-medium">{option}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-400">No options available for this question.</div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex-shrink-0">
            Your answer difficulty will adapt based on correctness. Click any answer to proceed.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
