import { useState } from 'react';
import userService from '../../services/userService';
import { Loader, AlertCircle } from 'lucide-react';

const experienceLevels = [
  {
    id: 'beginner',
    name: 'Beginner',
    icon: '🌱',
    description: 'I\'m new to programming or learning a new language',
    badges: ['Never coded before', 'Basic syntax knowledge', 'Learning fundamentals'],
    color: 'from-green-400 to-green-600',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    icon: '🚀',
    description: 'I can write basic programs and understand core concepts',
    badges: ['Know programming basics', 'Can write functions', 'Understand OOP basics'],
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    icon: '🔥',
    description: 'I can build complex applications and solve challenging problems',
    badges: ['Expert programmer', 'System design knowledge', 'Can mentor others'],
    color: 'from-purple-400 to-purple-600',
  },
];

export default function ExperienceLevelPage() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  const handleSelect = (levelId) => {
    setSelected(levelId);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selected) {
      setError('Please select an experience level');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await userService.updateLearningPreferences(userId, { experienceLevel: selected });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">What's Your Experience Level?</h1>
          <p className="text-gray-400 text-lg">We'll customize the difficulty of your tasks</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <span>✓ Experience level saved! Redirecting...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {experienceLevels.map((level) => (
            <div
              key={level.id}
              onClick={() => handleSelect(level.id)}
              className={`cursor-pointer rounded-xl p-8 transition-all transform ${
                selected === level.id
                  ? 'scale-105 ring-2 ring-white shadow-2xl'
                  : 'hover:scale-105'
              } bg-gradient-to-br ${level.color}`}
            >
              <div className="text-6xl mb-4">{level.icon}</div>
              <h3 className="text-3xl font-bold text-white mb-2">{level.name}</h3>
              <p className="text-white text-opacity-90 mb-6">{level.description}</p>
              <div className="space-y-2">
                {level.badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center text-white text-opacity-85 text-sm">
                    <span className="mr-2">✓</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
              {selected === level.id && (
                <div className="mt-6 text-white font-bold text-lg flex items-center justify-center">
                  ✓ Selected
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selected}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
