import { useState, useEffect, useRef } from 'react';
import { Send, Loader, Sparkles, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import aiAgentService from '../../services/aiAgentService';
import './AIAgent.css';

export default function AIAgent({ title, description, language, proficiencyLevel, taskCompleted, submissionFeedback, isSubmitting }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const messagesEndRef = useRef(null);
  const lastFeedbackRef = useRef(null);

  // Initialize AI agent with welcome message
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        const initialMessage = {
          id: 'welcome',
          type: 'ai',
          content: `👋 Hi! I'm your **AI Learning Assistant**.

**Task:** ${title}
${description ? `\n${description}\n` : ''}
I can help you:
- **Explain** the key concepts in this task
- **Break down** the problem into clear steps
- Give you **Hints** without spoiling the answer
- Answer anything you type in the box below

What would you like help with?`,
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
        setAgentReady(true);
      } catch (error) {
        console.error('Error initializing AI agent:', error);
      }
    };

    initializeAgent();
  }, [title, description]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When the user submits code, surface the AI code-review inside this chat.
  useEffect(() => {
    if (!submissionFeedback) return;
    if (lastFeedbackRef.current === submissionFeedback) return;
    lastFeedbackRef.current = submissionFeedback;

    let content;
    if (submissionFeedback.error) {
      content = `❌ **Submission failed**\n\n${submissionFeedback.error}`;
    } else {
      const score = submissionFeedback.qualityScore;
      const passScore = submissionFeedback.passScore || 7;
      const header = submissionFeedback.passed
        ? `✅ **Solution Approved!**${score != null ? ` — Score: **${score}/10**` : ''}`
        : `📋 **Code Review**${score != null ? ` — Score: **${score}/10** (need ${passScore}/10 to pass)` : ''}`;

      const body = submissionFeedback.feedback ? `\n\n${submissionFeedback.feedback}` : '';

      const suggestions =
        submissionFeedback.suggestions && submissionFeedback.suggestions.length > 0
          ? `\n\n**Suggestions:**\n${submissionFeedback.suggestions.map((s) => `- ${s}`).join('\n')}`
          : '';

      const next = submissionFeedback.passed
        ? `\n\n✨ Great work! The next task will unlock automatically.`
        : `\n\nFix the issues above and submit again when you're ready. Ask me if anything is unclear!`;

      content = header + body + suggestions + next;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `feedback-${Date.now()}`,
        type: 'ai',
        content,
        timestamp: new Date(),
      },
    ]);
  }, [submissionFeedback]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await aiAgentService.getAIExplanation({
        question: title,
        description: description,
        language: language,
        proficiencyLevel: proficiencyLevel,
        userQuery: inputValue,
        taskCompleted: taskCompleted,
      });

      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.explanation,
        suggestions: response.suggestions || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    let query = '';
    switch (action) {
      case 'explain':
        query = `Explain all the important concepts and keywords I need to understand to solve this question`;
        break;
      case 'breakdown':
        query = `Break down the problem into simple steps`;
        break;
      case 'hints':
        query = `Give me strategic hints for solving this problem without giving away the solution`;
        break;
      case 'feedback':
        query = `Now that I've completed this task, please give me feedback on my understanding and suggest better approaches or optimizations`;
        break;
      default:
        return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await aiAgentService.getAIExplanation({
        question: title,
        description: description,
        language: language,
        proficiencyLevel: proficiencyLevel,
        userQuery: query,
        taskCompleted: taskCompleted,
        action: action,
      });

      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.explanation,
        suggestions: response.suggestions || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-agent-container">
      {/* Header */}
      <div className="ai-agent-header">
        <div className="ai-agent-title-section">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <h3 className="ai-agent-title">{title}</h3>
        </div>
        <p className="ai-agent-subtitle">AI Learning Assistant</p>
      </div>

      {/* Chat Area */}
      <div className="ai-agent-chat">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`ai-message ${message.type === 'user' ? 'user-message' : 'ai-message-text'}`}
          >
            <div className="message-content">
              {message.type === 'ai' && (
                <div className="ai-avatar">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}
              <div className="message-text">
                {message.type === 'ai' ? (
                  <div className="markdown-body">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="message-suggestions">
                {message.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="suggestion-item">
                    💡 {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {(loading || isSubmitting) && (
          <div className="ai-message ai-message-text">
            <div className="message-content">
              <div className="ai-avatar loading">
                <Loader className="w-3 h-3 animate-spin" />
              </div>
              <div className="message-text">
                {isSubmitting ? 'Reviewing your code...' : 'AI is thinking...'}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {agentReady && (
        <div className="ai-agent-actions">
          <button
            onClick={() => handleQuickAction('explain')}
            className="action-btn explain-btn"
            disabled={loading}
            title="Get explanation of concepts"
          >
            <BookOpen className="w-3 h-3" />
            <span>Explain</span>
          </button>
          <button
            onClick={() => handleQuickAction('breakdown')}
            className="action-btn breakdown-btn"
            disabled={loading}
            title="Break down the problem"
          >
            <Lightbulb className="w-3 h-3" />
            <span>Breakdown</span>
          </button>
          <button
            onClick={() => handleQuickAction('hints')}
            className="action-btn hints-btn"
            disabled={loading}
            title="Get strategic hints"
          >
            🔍<span>Hints</span>
          </button>
          {taskCompleted && (
            <button
              onClick={() => handleQuickAction('feedback')}
              className="action-btn feedback-btn"
              disabled={loading}
              title="Get feedback on solution"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Feedback</span>
            </button>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="ai-agent-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything..."
          disabled={loading}
          className="ai-input-field"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim()}
          className="ai-send-btn"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
