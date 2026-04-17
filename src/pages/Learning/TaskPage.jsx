import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import learningPathService from '../../services/learningPathService';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import { Loader, AlertCircle, HelpCircle } from 'lucide-react';

export default function TaskPage() {
  const { language, taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState(null);

  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (userId && language && taskId) {
      fetchTask();
    }
  }, [userId, language, taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await learningPathService.getTaskExplanation(userId, language, taskId);
      setTask(data.task);
      setCode(data.task?.starterCode || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = async (submittedCode) => {
    try {
      const result = await learningPathService.submitTaskSolution({
        userId,
        language,
        taskId,
        code: submittedCode,
      });
      setFeedback(result.feedback);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetAIFeedback = async () => {
    try {
      const result = await learningPathService.getTaskCodeFeedback({
        userId,
        language,
        taskId,
        code,
      });
      setFeedback(result);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        {task && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Description - Left Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
                <p className="text-gray-600 mb-4">{task.description}</p>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-2">Explanation</h3>
                  <p className="text-sm text-gray-700">{task.explanation}</p>
                </div>

                {/* Hints */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Hints
                    </span>
                    <span>{showHints ? '−' : '+'}</span>
                  </button>

                  {showHints && task.hints && task.hints.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {task.hints.map((hint, idx) => (
                        <div key={idx} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-xs font-bold text-yellow-700 mb-1">Hint {idx + 1} ({hint.difficulty})</p>
                          <p className="text-sm text-yellow-800">{hint.hint}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Test Cases */}
                {task.testCases && task.testCases.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Test Cases</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {task.testCases.map((tc, idx) => (
                        <div key={idx} className="text-xs bg-gray-100 p-2 rounded">
                          <p className="font-mono text-gray-700">Input: {tc.input}</p>
                          <p className="font-mono text-gray-700">Output: {tc.expectedOutput}</p>
                          {tc.description && <p className="text-gray-600 italic">{tc.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Code Editor - Right Panel */}
            <div className="lg:col-span-2">
              <CodeEditor
                language={language}
                initialCode={code}
                onSubmit={handleSubmitSolution}
              />

              {/* Feedback */}
              {feedback && (
                <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">AI Feedback</h3>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700">{feedback.feedback}</p>
                  </div>

                  {feedback.suggestions && (
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 mb-2">Suggestions</h4>
                      <ul className="space-y-2">
                        {feedback.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback.qualityScore && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700">
                        Quality Score: <span className="font-bold">{feedback.qualityScore}/10</span>
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleGetAIFeedback}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Get AI Feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
