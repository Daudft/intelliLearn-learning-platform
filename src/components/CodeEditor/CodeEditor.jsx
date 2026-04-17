import { useState, useRef } from 'react';
import { Play, Copy, Loader, AlertCircle } from 'lucide-react';

export default function CodeEditor({ language = 'python', initialCode = '', onSubmit }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const editorRef = useRef(null);

  const handleRun = async () => {
    setLoading(true);
    setError('');
    setOutput('Running code...');

    try {
      // Simulated code execution - in production, this would call a real execution service
      // For now, we'll just show the code structure
      setTimeout(() => {
        setOutput('Code executed successfully!\n\nOutput would appear here.\n\nTo enable code execution:\n1. Set up a backend API endpoint\n2. Use a service like Judge0 or Piston\n3. Connect to real execution environment');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold">Code Editor</h3>
          <p className="text-gray-400 text-sm">Language: {language.toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center gap-2 transition text-sm"
          >
            <Copy className="w-4 h-4" />
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-50 text-sm font-medium"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-96">
        {/* Editor */}
        <div className="border-b lg:border-b-0 lg:border-r border-gray-700">
          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-gray-900 text-white font-mono text-sm p-4 outline-none resize-none"
            placeholder="Enter your code here..."
            spellCheck="false"
          />
        </div>

        {/* Output */}
        <div className="bg-gray-950 p-4 overflow-y-auto">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded mb-2 flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
        </div>
      </div>

      {/* Footer */}
      {onSubmit && (
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Submit Solution
          </button>
        </div>
      )}
    </div>
  );
}
