import { useState, useEffect, useRef } from 'react';
import { Send, Loader, Sparkles, BookOpen, Lightbulb, ScanSearch, TerminalSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import aiAgentService from '../../services/aiAgentService';
import './AIAgent.css';

// Render just the body of one run result (code block / error / empty).
function outputBody(output) {
  if (!output) return '_(no output captured)_';
  if (output.compileError) {
    return `_compilation error_\n\n\`\`\`\n${output.compileError.trim()}\n\`\`\``;
  }
  // The program reads input, so we auto-fed it this — tell the student.
  const inputLine = (output.input && output.input.trim())
    ? `🧩 _I used this input:_ \`${output.input.trim().replace(/\s+/g, ' ')}\`\n\n`
    : '';
  const out = (output.stdout || '').trim();
  const err = (output.stderr || '').trim();
  if (out) return `${inputLine}\`\`\`\n${out}\n\`\`\``;
  if (err) return `${inputLine}_runtime error_\n\n\`\`\`\n${err}\n\`\`\``;
  if (output.timedOut) return `${inputLine}⏱ Timed out — check for an infinite loop.`;
  return `${inputLine}_(your program produced no output)_`;
}

// The latest run's output, shown above the review on submit.
function formatProgramOutput(output) {
  if (!output) return '';
  return `🖥️ **Program Output**\n\n${outputBody(output)}\n\n`;
}

// The full saved output history for this task (Output button).
function formatAllOutputs(outputs) {
  if (!outputs || outputs.length === 0) {
    return `🖥️ **No output yet**\n\nClick **Submit** to run your code — I'll show its output and keep a history of every attempt right here.`;
  }
  const blocks = outputs.map((o, i) => {
    const when = o.at ? new Date(o.at) : null;
    const time = when && !isNaN(when.getTime())
      ? ` · ${when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : '';
    return `**Attempt ${i + 1}**${time}\n\n${outputBody(o)}`;
  });
  return `🖥️ **Output history — ${outputs.length} run${outputs.length > 1 ? 's' : ''}**\n\n${blocks.join('\n\n---\n\n')}`;
}

export default function AIAgent({ title, description, language, proficiencyLevel, taskCompleted, submissionFeedback, isSubmitting, currentCode, outputs }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const messagesEndRef = useRef(null);
  const lastFeedbackRef = useRef(null);

  // Seed the chat with a static welcome message for the current task.
  useEffect(() => {
    const initialMessage = {
      id: 'welcome',
      type: 'ai',
      content: `👋 Hi! I'm your **AI Learning Assistant**.

**Task:** ${title}
${description ? `\n${description}\n` : ''}
I can help you:
- **Explain** the key concepts in this task
- **Break down** the problem into clear steps
- **Review** the code you've written and nudge you in the right direction
- Show your **Output** history for every run
- Answer anything you type in the box below

What would you like help with?`,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    setAgentReady(true);
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
      const reason = submissionFeedback.reason;
      // The code failed to compile/run — that's the blocker, not the score.
      const runBlocked = !submissionFeedback.passed && (reason === 'run_error' || reason === 'could_not_run');

      let header;
      if (submissionFeedback.passed) {
        header = `✅ **Solution Approved!**${score != null ? ` — Score: **${score}/10**` : ''}`;
      } else if (runBlocked) {
        header = `⚠️ **Not completed — your code didn't run cleanly.** Fix the error above first.${score != null ? ` _(logic score: ${score}/10)_` : ''}`;
      } else {
        header = `📋 **Code Review**${score != null ? ` — Score: **${score}/10** (need ${passScore}/10 to pass)` : ''}`;
      }

      const body = submissionFeedback.feedback ? `\n\n${submissionFeedback.feedback}` : '';

      const suggestions =
        submissionFeedback.suggestions && submissionFeedback.suggestions.length > 0
          ? `\n\n**Suggestions:**\n${submissionFeedback.suggestions.map((s) => `- ${s}`).join('\n')}`
          : '';

      const next = submissionFeedback.passed
        ? `\n\n✨ Great work! The next task will unlock automatically.`
        : runBlocked
          ? `\n\nThe task stays incomplete until your program runs without errors. Fix it and submit again to earn your points — tap **Review My Code** if you'd like a hint.`
          : `\n\nFix the issues above and submit again when you're ready. Ask me if anything is unclear!`;

      // Show the real program output (from running the code) above the review.
      content = formatProgramOutput(submissionFeedback.output) + header + body + suggestions + next;
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
        action: 'ask', // free-form question → answer it specifically (not the canned Explain)
        code: currentCode || '', // current editor code, so answers can reference it when relevant
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
      case 'review':
        query = `Review the code I've written so far and tell me what to fix — without giving me the answer.`;
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
        // Only the code-aware "review" action needs the current editor contents.
        code: action === 'review' ? (currentCode || '') : undefined,
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

  // Show the saved output history for this task (no API call — local data).
  const handleShowOutputs = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `outputs-${Date.now()}`,
        type: 'ai',
        content: formatAllOutputs(outputs),
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="ai-agent-container">
      {/* Header */}
      <div className="ai-agent-header">
        <div className="ai-agent-avatar-lg">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="ai-agent-heading">
          <h3 className="ai-agent-title">AI Learning Assistant</h3>
          <p className="ai-agent-subtitle">Here to help you solve this task</p>
        </div>
        <span className="ai-online-dot" />
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
            onClick={() => handleQuickAction('review')}
            className="action-btn review-btn"
            disabled={loading}
            title="Review the code you've written so far"
          >
            <ScanSearch className="w-3 h-3" />
            <span>Review My Code</span>
          </button>
          <button
            onClick={handleShowOutputs}
            className="action-btn output-btn"
            disabled={loading}
            title="See all program outputs for this task"
          >
            <TerminalSquare className="w-3 h-3" />
            <span>Output</span>
          </button>
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
