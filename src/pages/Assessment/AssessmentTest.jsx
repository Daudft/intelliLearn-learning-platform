import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assessmentService from "../../services/assessmentService";

export default function AssessmentTest() {
  const params = useParams();
  const navigate = useNavigate();

  // defensive: if language param missing, default to generic "unknown"
  const languageParam = (params?.language ?? "unknown").toString();
  const normalizedLanguage = languageParam.toLowerCase();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    // Reset states on language change / retake
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setSubmitting(false);
    setStartTime(Date.now());
    setLoading(true);

    fetchQuestions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedLanguage]);

  const fetchQuestions = async () => {
    try {
      const data = await assessmentService.getQuestions(normalizedLanguage);

      // defensive: ensure an array exists
      const q = Array.isArray(data?.questions) ? data.questions : [];

      setQuestions(q);
      setAnswers(new Array(q.length).fill(null));
    } catch (error) {
      console.error("Error fetching questions:", error);
      // user-friendly message + safe navigation
      alert("Failed to load questions. Returning to assessments.");
      navigate("/assessment", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    // create new copy for React change detection
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQuestion] = answer;
      return copy;
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((idx) => idx + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((idx) => idx - 1);
    }
  };

  const handleSubmit = async () => {
    // confirm unanswered questions
    if (answers.some((a) => a === null)) {
      const confirmSubmit = window.confirm("Some questions are unanswered. Submit anyway?");
      if (!confirmSubmit) return;
    }

    // sanity check
    if (answers.length !== questions.length) {
      alert("Error: Answers mismatch. Please try again.");
      return;
    }

    setSubmitting(true);

    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      if (!user) {
        alert("Please sign in first.");
        navigate("/signin");
        return;
      }

      const userId = user.id ?? user._id;
      if (!userId) {
        alert("Invalid user. Please sign in again.");
        navigate("/signin");
        return;
      }

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const result = await assessmentService.submitAssessment({
        userId,
        language: normalizedLanguage,
        answers,
        timeTaken,
      });

      navigate("/assessment/result", {
        state: {
          result: result.result,
          language: normalizedLanguage,
        },
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      const msg = error?.response?.data?.message || "Failed to submit assessment";
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
          <p className="text-gray-600 mt-4 font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  // safe guards for zero-questions state
  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg text-center">
          <h3 className="text-lg font-bold mb-2">No questions available</h3>
          <p className="text-sm text-gray-600 mb-4">There are no questions for this assessment right now.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/assessment")}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-semibold"
            >
              Back to Assessments
            </button>
            <button
              onClick={() => fetchQuestions()}
              className="px-4 py-2 bg-[#E6FF03] rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // derived values (safe)
  const question = questions[currentQuestion] ?? null;
  const answeredCount = answers.filter((a) => a !== null).length;
  const progress = questions.length > 0 ? Math.round(((currentQuestion + 1) / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-3 sm:p-4">

        {/* Header */}
        <div className="bg-white rounded-xl p-3 sm:p-5 shadow-lg mb-2 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {(normalizedLanguage || "Assessment").toUpperCase()} Assessment
              </h2>
              <span className="text-sm text-gray-500 font-medium">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">Answered</div>
              <div className="text-lg sm:text-xl font-black text-gray-900">
                {answeredCount}
                <span className="text-gray-400 text-xs sm:text-sm"> / {questions.length}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#E6FF03] to-[#d7ee00] rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              aria-hidden
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-3 min-h-0">

          {/* Question Column */}
          <div className="lg:col-span-5 flex flex-col min-h-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">

              {/* Question Header */}
              <div className="p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">
                      {question?.questionType === "mcq" ? "Multiple Choice" : "Code Output"}
                    </span>
                    <span className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold">
                      {question?.topic ?? "General"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 font-medium">
                    {/* optional timer or metadata could go here */}
                  </div>
                </div>

                <h3 className="text-md sm:text-lg font-bold text-gray-900 leading-snug mt-3">
                  {question?.question ?? "No question text available."}
                </h3>
              </div>

              {/* Code Block + Options */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {question?.code && (
                  <div className="bg-gray-900 text-[#E6FF03] p-3 rounded-lg mb-3 font-mono text-xs sm:text-sm shadow-lg overflow-auto">
                    <pre className="whitespace-pre-wrap">{question.code}</pre>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-2">
                  {Array.isArray(question?.options) && question.options.length > 0 ? (
                    question.options.map((option, index) => {
                      const selected = answers[currentQuestion] === option;
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option)}
                          aria-pressed={selected}
                          className={`group w-full text-left p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            selected
                              ? "border-[#E6FF03] bg-[#E6FF03]/10 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                selected ? "border-[#E6FF03] bg-[#E6FF03]" : "border-gray-300"
                              }`}
                              aria-hidden
                            >
                              {selected && (
                                <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="text-gray-900 font-medium text-sm">{option}</span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500">No options available for this question.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <div className="bg-white rounded-xl p-2 sm:p-3 shadow-lg border border-gray-100 flex-1 flex flex-col">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Questions
              </h4>

              <div className="flex-1 overflow-y-auto mb-2">
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
                  {questions.map((_, index) => {
                    const isCurrent = index === currentQuestion;
                    const isAnswered = answers[index] !== null;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        aria-current={isCurrent}
                        aria-label={`Go to question ${index + 1}`}
                        className={`aspect-square rounded-lg font-bold text-xs flex items-center justify-center transition-all focus:outline-none ${
                          isCurrent
                            ? "bg-[#E6FF03] text-gray-900 shadow-md ring-2 ring-[#E6FF03]"
                            : isAnswered
                            ? "bg-green-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Click a number to jump to that question.
              </div>
            </div>
          </div>

        </div>

        {/* Navigation */}
        <div className="mt-2 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg font-bold shadow-md disabled:opacity-40"
            aria-disabled={currentQuestion === 0}
          >
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto px-4 py-2.5 bg-green-700 text-white rounded-lg font-bold shadow-lg disabled:opacity-50"
              aria-disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#E6FF03] rounded-lg font-bold shadow-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
