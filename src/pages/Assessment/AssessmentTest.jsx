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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
        <div className="text-center" role="status" aria-live="polite">
          <div className="relative inline-block" aria-hidden>
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-t-[#E6FF03] absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Starting adaptive assessment...</p>
        </div>
      </div>
    );
  }

  // safe guards for zero-questions state
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg text-center">
          <h3 className="text-lg font-bold mb-2">No question available</h3>
          <p className="text-sm text-gray-600 mb-4">There was an issue loading the question.</p>
          <button
            onClick={() => navigate("/assessment")}
            className="px-4 py-2 bg-[#E6FF03] rounded-lg font-semibold"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-3 sm:p-4">

        {/* Header */}
        <div className="bg-white rounded-xl p-3 sm:p-5 shadow-lg mb-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {(normalizedLanguage || "Assessment").toUpperCase()} Assessment
              </h2>
              <span className="text-sm text-gray-500 font-medium">
                Question {questionIndex}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                Difficulty: {currentQuestion?.difficulty?.toUpperCase() || "MEDIUM"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#E6FF03] to-[#d7ee00] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (questionIndex / 15) * 100)}%` }}
              aria-hidden
            />
          </div>
        </div>

        {/* Previous Answer Feedback */}
        {previousAnswerFeedback && (
          <div className={`mb-4 p-4 rounded-xl text-white font-semibold ${previousAnswerFeedback.isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
            {previousAnswerFeedback.isCorrect ? '✅ Correct! Moving to next difficulty level.' : '❌ Incorrect. Adjusting difficulty...'}
          </div>
        )}

        {/* Main Question Area with Side Numbering */}
        <div className="flex-1 flex gap-4">

          {/* Side numbering (non-interactive to preserve adaptive flow) */}
          <aside className="w-20 hidden sm:flex flex-col items-center gap-2 p-3">
            <div className="bg-white rounded-xl shadow-lg p-2 w-full">
              <div className="text-xs text-gray-500 font-semibold mb-2 text-center">Questions</div>
              <div className="flex flex-col gap-2 max-h-[420px] overflow-auto">
                {Array.from({ length: 15 }).map((_, i) => {
                  const num = i + 1;
                  const isCurrent = num === questionIndex;
                  return (
                    <div
                      key={num}
                      className={("w-full flex items-center justify-center h-8 rounded-md text-sm font-semibold ") + (isCurrent ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700')}
                      aria-current={isCurrent ? 'true' : 'false'}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">

          {/* Question Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">
                  {currentQuestion?.topic || "Question"}
                </span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {currentQuestion?.question || "No question text available."}
            </h3>
          </div>

          {/* Code Block + Options */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {currentQuestion?.code && (
              <div className="bg-gray-900 text-[#E6FF03] p-4 rounded-lg mb-6 font-mono text-sm shadow-lg overflow-auto">
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
                      "group w-full text-left p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 " +
                      (submitting
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:shadow-md border-gray-200 hover:border-gray-300 bg-white")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center" />
                      <span className="text-gray-900 font-medium">{option}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-500">No options available for this question.</div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-600 flex-shrink-0">
            Your answer difficulty will adapt based on correctness. Click any answer to proceed.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
