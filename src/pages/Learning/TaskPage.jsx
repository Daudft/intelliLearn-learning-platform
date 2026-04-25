import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import learningPathService from '../../services/learningPathService';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import { Loader, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, Check, Lock } from 'lucide-react';

export default function TaskPage() {
  const { language, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (userId && language && taskId) {
      fetchTask();
    }
  }, [userId, language, taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      setSubmitSuccess(false);
      setFeedback(null);
      
      const data = await learningPathService.getTaskExplanation(userId, language, taskId);
      setTask(data.task);
      setCode(data.task?.draftCode || data.task?.starterCode || '');
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = async (submittedCode) => {
    if (!submittedCode.trim()) {
      setError('Please write some code before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // First, save the draft
      await learningPathService.saveTaskDraft({
        userId,
        language,
        taskId,
        code: submittedCode,
      });

      // Then get AI feedback
      const feedbackResult = await learningPathService.getTaskCodeFeedback({
        language,
        taskTitle: task.title,
        taskDescription: task.description,
        code: submittedCode,
        proficiencyLevel: task.proficiencyLevel || 'Beginner',
      });

      setFeedback(feedbackResult);

      // If feedback passes the score requirement, submit as solution
      if (feedbackResult.canComplete) {
        // Submit the solution to unlock next task
        const submitResult = await learningPathService.submitTaskSolution({
          userId,
          language,
          taskId,
          code: submittedCode,
        });

        setSubmitSuccess(true);
        setFeedback({
          ...feedbackResult,
          canComplete: true,
          taskUnlocked: true,
        });

        // Reload task data to show updated paths
        setTimeout(() => {
          fetchTask();
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting solution:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await learningPathService.saveTaskDraft({
        userId,
        language,
        taskId,
        code,
      });
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-200 border-t-lime-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold mb-2">{error || 'Task not found'}</p>
          <button
            onClick={() => navigate(`/learning-path`)}
            className="px-6 py-2 bg-lime-400 text-stone-900 font-bold rounded-lg hover:bg-lime-500 transition"
          >
            Back to Learning Path
          </button>
        </div>
      </div>
    );
  }

  const passScore = 7;
  const canUnlock = feedback?.qualityScore && feedback.qualityScore >= passScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/learning-path`)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-stone-700 rounded-lg hover:bg-stone-50 transition shadow-sm border border-stone-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Path
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-600 font-semibold">Task {task.order} of 5</p>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{task.title}</h1>
          </div>
          <div className="w-12" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {submitSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg flex gap-3 animate-pulse">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">🎉 Solution Approved! Next task unlocked!</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {task && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Description Panel - Left */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 border border-stone-200">
                {/* Status Badge */}
                <div className="mb-4 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'unlocked' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.status === 'completed' && '✓ Completed'}
                    {task.status === 'unlocked' && '⭐ Active'}
                    {task.status === 'locked' && '🔒 Locked'}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-stone-900 mb-3">{task.title}</h2>
                  <p className="text-stone-700 leading-relaxed">{task.description}</p>
                </div>

                {/* Explanation Box */}
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">💡</span> How to Approach
                  </h3>
                  <p className="text-sm text-stone-700 leading-relaxed">{task.explanation}</p>
                </div>

                {/* Hints Section */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 hover:bg-amber-100 transition font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Hints & Tips
                    </span>
                    <span className="text-lg">{showHints ? '−' : '+'}</span>
                  </button>

                  {showHints && task.hints && task.hints.length > 0 && (
                    <div className="space-y-2 animate-slideIn">
                      {task.hints.map((hint, idx) => (
                        <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs font-bold text-amber-700 mb-1 uppercase tracking-wider">
                            Hint {idx + 1} • {hint.difficulty}
                          </p>
                          <p className="text-sm text-amber-900">{hint.hint}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress Info */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Attempts</p>
                  <p className="text-2xl font-bold text-stone-900">{task.attempts || 0}</p>
                </div>
              </div>
            </div>

            {/* Code Editor Panel - Right */}
            <div className="lg:col-span-2">
              <CodeEditor
                language={language}
                initialCode={code}
                onSubmit={handleSubmitSolution}
                isSubmitting={isSubmitting}
                canSubmit={task.status !== 'completed'}
                passScore={passScore}
                qualityScore={feedback?.qualityScore}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate(`/learning-path`)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-stone-900 font-bold rounded-lg hover:bg-stone-50 transition shadow-md border border-stone-200"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          {task?.status === 'completed' && (
            <button
              onClick={() => {
                const currentOrder = task.order;
                const nextTaskId = `${language}-${currentOrder + 1}`;
                navigate(`/learning-path/${language}/${nextTaskId}`);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-stone-900 font-bold rounded-lg hover:bg-lime-500 transition shadow-md"
            >
              Next Task
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
