import { useState, useEffect } from 'react';
import learningPathService from '../../services/learningPathService';
import { Loader, AlertCircle, Lock, CheckCircle, Circle } from 'lucide-react';

export default function PathwayVisualization() {
  const [learningPath, setLearningPath] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (userId) {
      fetchLearningPath();
    }
  }, [userId]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await learningPathService.getLearningPath(userId);
      setLearningPath(data.learningPath);
      if (data.learningPath?.paths?.length > 0) {
        setSelectedLanguage(data.learningPath.paths[0].language);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const currentPath = learningPath?.paths?.find((p) => p.language === selectedLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Pathway</h1>
        <p className="text-gray-600 mb-6">Track your progress through each module</p>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        {learningPath?.paths && learningPath.paths.length > 0 ? (
          <>
            {/* Language selector */}
            <div className="mb-8 flex gap-2 flex-wrap">
              {learningPath.paths.map((path) => (
                <button
                  key={path.language}
                  onClick={() => setSelectedLanguage(path.language)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    selectedLanguage === path.language
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {path.language.toUpperCase()}
                </button>
              ))}
            </div>

            {currentPath && (
              <>
                {/* Proficiency level */}
                <div className="mb-6 bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Current Level</p>
                      <h3 className="text-2xl font-bold text-gray-900">{currentPath.proficiencyLevel}</h3>
                    </div>
                    <div className="text-5xl">📚</div>
                  </div>
                </div>

                {/* Tasks visualization */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Progression</h2>

                  {/* Progress overview */}
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-700 font-medium">Overall Progress</p>
                      <p className="text-gray-700 font-medium">
                        {currentPath.tasks?.filter((t) => t.status === 'completed').length || 0} /
                        {currentPath.tasks?.length || 0}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentPath.tasks?.filter((t) => t.status === 'completed').length || 0) / (currentPath.tasks?.length || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Task cards in flow */}
                  <div className="space-y-6">
                    {currentPath.tasks?.map((task, index) => {
                      const isCompleted = task.status === 'completed';
                      const isUnlocked = task.status !== 'locked';
                      const isCurrent = isUnlocked && !isCompleted;

                      return (
                        <div key={task.taskId} className="relative">
                          {/* Connector line */}
                          {index < (currentPath.tasks?.length || 0) - 1 && (
                            <div className="absolute left-8 top-24 w-1 h-12 bg-gray-300"></div>
                          )}

                          {/* Task card */}
                          <div
                            className={`rounded-lg p-6 border-2 transition transform hover:scale-105 ${
                              isCompleted
                                ? 'bg-green-50 border-green-500'
                                : isCurrent
                                ? 'bg-blue-50 border-blue-500 shadow-lg'
                                : 'bg-gray-50 border-gray-300 opacity-60'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Status icon */}
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="w-8 h-8 text-green-600" />
                                ) : isUnlocked ? (
                                  <Circle className="w-8 h-8 text-blue-600" />
                                ) : (
                                  <Lock className="w-8 h-8 text-gray-400" />
                                )}
                              </div>

                              {/* Task info */}
                              <div className="flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">Task {task.order}</h3>
                                    <h4 className="text-lg font-semibold text-gray-800">{task.title}</h4>
                                  </div>
                                  <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                                      isCompleted
                                        ? 'bg-green-200 text-green-800'
                                        : isCurrent
                                        ? 'bg-blue-200 text-blue-800'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {isCompleted ? '✓ Completed' : isCurrent ? 'In Progress' : 'Locked'}
                                  </span>
                                </div>

                                <p className="text-gray-700 mb-3">{task.description}</p>

                                {task.attempts > 0 && (
                                  <div className="text-sm text-gray-600 mb-3">
                                    Attempts: <strong>{task.attempts}</strong>
                                    {task.lastFeedbackScore && (
                                      <span> • Last Score: <strong>{task.lastFeedbackScore}/10</strong></span>
                                    )}
                                  </div>
                                )}

                                {isUnlocked && (
                                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    {isCompleted ? 'View Solution' : 'Start Task'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No learning paths created yet</p>
            <p className="text-gray-500">Complete the initial assessment to generate your personalized learning path</p>
          </div>
        )}
      </div>
    </div>
  );
}
