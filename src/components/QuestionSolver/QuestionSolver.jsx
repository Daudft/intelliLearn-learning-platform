import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, SkipForward, CheckCircle2, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import './QuestionSolver.css';

export default function QuestionSolver({ userId, language, topic, difficulty, onComplete, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/questions/generate`, {
          language,
          topic,
          difficulty,
          level: 'Beginner', // TODO: get from user profile
          count: 5,
        });
        setQuestions(response.data.questions);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load questions: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    if (userId && language && topic && difficulty) {
      loadQuestions();
    }
  }, [userId, language, topic, difficulty]);

  // Update timer every second
  useEffect(() => {
    if (!loading && !completed && currentIndex < questions.length) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, completed, currentIndex, questions.length, startTime]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    setAnswering(true);
    try {
      // Save this question to the user's learning progress
      const topicId = `${language}-${topic}-${difficulty}-${currentIndex + 1}`;
      
      await axios.post(`${API_BASE}/questions/submit-answer`, {
        userId,
        questionId: topicId,
        userAnswer: selectedAnswer,
        timeSpent,
      });

      setShowFeedback(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setAnswering(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setStartTime(Date.now());
      setTimeSpent(0);
    } else {
      // All questions completed
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleComplete = async () => {
    try {
      // Get final progress
      const response = await axios.get(
        `${API_BASE}/questions/progress/${userId}/${language}`
      );
      setProgress(response.data.progress);
      setCompleted(true);
      
      // Call callback with results
      if (onComplete) {
        onComplete(response.data.progress);
      }
    } catch (error) {
      console.error('Error getting progress:', error);
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="question-solver-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="question-solver-container">
        <div className="error">
          <p>No questions available</p>
          <button onClick={onBack} className="btn btn-primary">Back</button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="question-solver-container">
        <div className="completion-card">
          <h2>✅ Stage Complete!</h2>
          {progress && (
            <>
              <div className="progress-summary">
                <div className="stat">
                  <div className="stat-value">{progress.correctAnswers}/{progress.totalQuestions}</div>
                  <div className="stat-label">Correct</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{progress.accuracy}%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{Math.floor(timeSpent / 60)}m</div>
                  <div className="stat-label">Time</div>
                </div>
              </div>

              {progress.accuracy >= 70 ? (
                <div className="mastery-badge">
                  <CheckCircle2 size={32} />
                  <p>Mastery Achieved!</p>
                  <small>You've unlocked the next stage 🎉</small>
                </div>
              ) : (
                <div className="retry-badge">
                  <XCircle size={32} />
                  <p>Keep Practicing</p>
                  <small>Score {70 - progress.accuracy}% more to unlock next stage</small>
                </div>
              )}
            </>
          )}
          <button onClick={onBack} className="btn btn-primary">Continue</button>
        </div>
      </div>
    );
  }

  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="question-solver-container">
      <div className="question-header">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="header-info">
          <span className="question-counter">Question {currentIndex + 1} of {questions.length}</span>
          <span className="timer">
            <Clock size={16} /> {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="question-card">
        <h2 className="question-text">{currentQuestion.question}</h2>

        <div className="options-container">
          {['A', 'B', 'C', 'D'].map((optionKey) => (
            <button
              key={optionKey}
              className={`option-button ${selectedAnswer === optionKey ? 'selected' : ''} ${
                showFeedback && optionKey === currentQuestion.correctAnswer ? 'correct' : ''
              } ${showFeedback && selectedAnswer === optionKey && !isCorrect ? 'incorrect' : ''}`}
              onClick={() => !showFeedback && handleAnswerSelect(optionKey)}
              disabled={showFeedback}
            >
              <span className="option-letter">{optionKey}</span>
              <span className="option-text">{currentQuestion.options[optionKey]}</span>
              {showFeedback && optionKey === currentQuestion.correctAnswer && (
                <CheckCircle2 size={20} className="feedback-icon correct-icon" />
              )}
              {showFeedback && selectedAnswer === optionKey && !isCorrect && (
                <XCircle size={20} className="feedback-icon incorrect-icon" />
              )}
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className={`feedback-section ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-header">
              {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            <p className="feedback-text">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="controls">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
        >
          <ChevronLeft size={20} /> Previous
        </button>

        {!showFeedback ? (
          <>
            <button
              onClick={handleSkip}
              className="btn btn-outline"
            >
              <SkipForward size={20} /> Skip
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={!isAnswered || answering}
              className="btn btn-primary"
            >
              {answering ? 'Submitting...' : 'Submit'}
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary"
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
