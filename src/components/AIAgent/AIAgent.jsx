import { useState, useEffect, useRef } from 'react';
import { Send, Loader, Sparkles, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import aiAgentService from '../../services/aiAgentService';
import './AIAgent.css';

export default function AIAgent({ title, description, language, proficiencyLevel, taskCompleted }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize AI agent with welcome message
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        const initialMessage = {
          id: 'welcome',
          type: 'ai',
          content: `👋 Hi! I'm your AI Learning Assistant. I'm here to help you understand this question!

**How I can help:**
- Explain concepts in this question
- Break down the problem into steps
- Answer your specific questions
- Provide hints and guidance
- Suggest better solutions after completion

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
  }, [title]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                {message.content}
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
        {loading && (
          <div className="ai-message ai-message-text">
            <div className="message-content">
              <div className="ai-avatar loading">
                <Loader className="w-3 h-3 animate-spin" />
              </div>
              <div className="message-text">AI is thinking...</div>
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
