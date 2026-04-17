import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { Loader, AlertCircle } from 'lucide-react';

const learningStyles = [
  {
    id: 'visual',
    name: 'Visual Learner',
    icon: '👁️',
    description: 'You learn best through images, diagrams, and visual representations',
    traits: ['Prefers charts and graphs', 'Good with maps', 'Remembers faces', 'Likes colors'],
  },
  {
    id: 'auditory',
    name: 'Auditory Learner',
    icon: '👂',
    description: 'You learn best through listening and discussions',
    traits: ['Prefers lectures', 'Good with music', 'Remembers conversations', 'Talks to self'],
  },
  {
    id: 'reading-writing',
    name: 'Reading/Writing Learner',
    icon: '📖',
    description: 'You learn best through reading and writing',
    traits: ['Prefers text', 'Takes notes', 'Likes lists', 'Good with reading'],
  },
  {
    id: 'kinesthetic',
    name: 'Kinesthetic Learner',
    icon: '🎮',
    description: 'You learn best through hands-on experience',
    traits: ['Prefers hands-on', 'Likes movement', 'Good with touch', 'Needs breaks'],
  },
];

export default function LearningStylePage() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  const handleSelect = (styleId) => {
    setSelected(styleId);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selected) {
      setError('Please select a learning style');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await userService.updateLearningPreferences(userId, { learningStyle: selected });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">What's Your Learning Style?</h1>
          <p className="text-gray-600 text-lg">Help us personalize your learning experience</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <span>✓ Learning style saved! Redirecting...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {learningStyles.map((style) => (
            <div
              key={style.id}
              onClick={() => handleSelect(style.id)}
              className={`cursor-pointer rounded-lg p-6 transition-all transform ${
                selected === style.id
                  ? 'bg-white shadow-lg scale-105 ring-2 ring-blue-500'
                  : 'bg-white shadow hover:shadow-lg hover:scale-102'
              }`}
            >
              <div className="text-5xl mb-3">{style.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{style.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{style.description}</p>
              <div className="space-y-1">
                {style.traits.map((trait, idx) => (
                  <p key={idx} className="text-xs text-gray-500">✓ {trait}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selected}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
