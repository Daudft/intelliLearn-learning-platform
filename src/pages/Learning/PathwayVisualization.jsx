import { useState, useEffect } from 'react';
import learningPathService from '../../services/learningPathService';
import TaskModal from '../../components/TaskModal/TaskModal';
import { Loader, AlertCircle, Lock, CheckCircle, Circle } from 'lucide-react';
import './PathwayVisualization.css';

export default function PathwayVisualization() {
  const [learningPath, setLearningPath] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      // Use waitForLearningPath to poll with retries for AI generation
      const data = await learningPathService.waitForLearningPath(userId);
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

  const handleStartTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleTaskComplete = () => {
    fetchLearningPath();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f5f5f4]">
        <Loader className="w-8 h-8 animate-spin text-[#a3ff00]" />
      </div>
    );
  }

  const currentPath = learningPath?.paths?.find((p) => p.language === selectedLanguage);

  return (
    <div className="pathway-container">
      <div className="pathway-header">
        <h1>Learning Pathway</h1>
        <p>Track your progress through each module</p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {learningPath?.paths && learningPath.paths.length > 0 ? (
        <>
          {/* Language selector */}
          <div className="language-selector">
            {learningPath.paths.map((path) => (
              <button
                key={path.language}
                onClick={() => setSelectedLanguage(path.language)}
                className={`language-btn ${selectedLanguage === path.language ? 'active' : ''}`}
              >
                {path.language.toUpperCase()}
              </button>
            ))}
          </div>

          {currentPath && (
            <>
              {/* Proficiency level card */}
              <div className="proficiency-card">
                <div className="proficiency-content">
                  <div>
                    <p className="proficiency-label">Current Level</p>
                    <h3 className="proficiency-level">{currentPath.proficiencyLevel}</h3>
                  </div>
                  <div className="proficiency-emoji">📚</div>
                </div>
              </div>

              {/* Tasks section */}
              <div className="tasks-section">
                <h2>Task Progression</h2>

                {/* Progress overview */}
                <div className="progress-overview">
                  <div className="progress-header">
                    <p className="progress-label">Overall Progress</p>
                    <p className="progress-count">
                      {currentPath.tasks?.filter((t) => t.status === 'completed').length || 0} /
                      {currentPath.tasks?.length || 0}
                    </p>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${((currentPath.tasks?.filter((t) => t.status === 'completed').length || 0) / (currentPath.tasks?.length || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Task cards */}
                <div className="tasks-list">
                  {currentPath.tasks?.map((task, index) => {
                    const isCompleted = task.status === 'completed';
                    const isUnlocked = task.status !== 'locked';
                    const isCurrent = isUnlocked && !isCompleted;

                    return (
                      <div key={task.taskId} className="task-card-wrapper">
                        {/* Connector line */}
                        {index < (currentPath.tasks?.length || 0) - 1 && (
                          <div className={`connector-line ${isCompleted ? 'completed' : ''}`}></div>
                        )}

                        {/* Task card */}
                        <div
                          className={`task-card ${isCompleted ? 'completed' : isCurrent ? 'current' : 'locked'}`}
                        >
                          {/* Status icon */}
                          <div className="task-icon">
                            {isCompleted ? (
                              <CheckCircle size={32} className="icon-completed" />
                            ) : isUnlocked ? (
                              <Circle size={32} className="icon-unlocked" />
                            ) : (
                              <Lock size={32} className="icon-locked" />
                            )}
                          </div>

                          {/* Task content */}
                          <div className="task-content">
                            <div className="task-header">
                              <div>
                                <p className="task-number">Task {task.order}</p>
                                <h3 className="task-title">{task.title}</h3>
                              </div>
                              <span className={`task-badge ${isCompleted ? 'completed' : isCurrent ? 'current' : 'locked'}`}>
                                {isCompleted ? '✓ Completed' : isCurrent ? 'In Progress' : 'Locked'}
                              </span>
                            </div>

                            <p className="task-description">{task.description}</p>

                            {task.attempts > 0 && (
                              <div className="task-stats">
                                Attempts: <strong>{task.attempts}</strong>
                                {task.lastFeedbackScore && (
                                  <span> • Last Score: <strong>{task.lastFeedbackScore}/10</strong></span>
                                )}
                              </div>
                            )}

                            {isUnlocked && (
                              <button
                                onClick={() => handleStartTask(task)}
                                className="task-btn"
                              >
                                {isCompleted ? 'Review Solution' : 'Start Task'}
                              </button>
                            )}
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
        <div className="empty-state">
          <p className="empty-title">No learning paths created yet</p>
          <p className="empty-subtitle">Complete the initial assessment to generate your personalized learning path</p>
        </div>
      )}

      {/* Task Modal */}
      {showModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          language={selectedLanguage}
          userId={userId}
          onClose={() => setShowModal(false)}
          onTaskComplete={handleTaskComplete}
        />
      )}
    </div>
  );
}
