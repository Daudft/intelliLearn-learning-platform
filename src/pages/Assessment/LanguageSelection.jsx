import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assessmentService from "../../services/assessmentService";

export default function LanguageSelection() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const data = await assessmentService.getLanguages();
      setLanguages(data.languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (languageId) => {
    navigate(`/assessment/test/${languageId}`);
  };

  const languageConfig = {
    Python: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      tagline: "Versatile & Powerful"
    },
    Java: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
      tagline: "Enterprise Standard"
    },
    C: {
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg",
      tagline: "Performance First"
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-black absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-5">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-medium">
            Initial Assessment
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-black tracking-tight leading-[0.95]">
            Choose Your
            <br />
            Programming Language
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Select your preferred language and demonstrate your coding expertise.
          </p>
        </div>

        {/* Language Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {languages.map((language) => {
            const config = languageConfig[language.name] || {
              icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
              tagline: "Programming Language"
            };

            return (
              <div
                key={language.id}
                onMouseEnter={() => setHoveredCard(language.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleLanguageSelect(language.id)}
                className="group relative bg-white p-8 cursor-pointer overflow-hidden
                border border-gray-200 transition-all duration-500
                hover:border-black hover:-translate-y-2 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]"
              >
                {/* Icon Container */}
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 flex items-center justify-center border border-gray-200 p-5
                    transition-all duration-500 group-hover:border-black group-hover:scale-105">
                    <img
                      src={config.icon}
                      alt={language.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-2">
                  <h3 className="font-display text-3xl font-bold text-black tracking-tight">
                    {language.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    {config.tagline}
                  </p>

                  {/* Start Button */}
                  <button className="w-full mt-6 bg-black text-white font-semibold py-4
                    transition-all duration-300 hover:bg-gray-800">
                    <span className="flex items-center justify-center gap-2">
                      Start Test
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assessment Details — dark card for contrast */}
        <div className="relative bg-black p-10 overflow-hidden">
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-white"></div>
              <h3 className="font-display text-3xl font-bold text-white tracking-tight">
                Assessment Details
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: "📝",
                  title: "Format",
                  desc: "Multiple choice + code output questions",
                  sub: "15 total (mixed difficulty)"
                },
                {
                  icon: "⏱️",
                  title: "Duration",
                  desc: "No time limit (15–20 min recommended)",
                  sub: "Instant skill level (Beginner–Advanced)"
                },
                {
                  icon: "🎯",
                  title: "Topics",
                  desc: "Variables, Loops, Functions, Arrays",
                  sub: "Basic OOP for Java & Python"
                },
                {
                  icon: "🏆",
                  title: "Result",
                  desc: "Instant skill level evaluation",
                  sub: "Beginner to Advanced ranking"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="text-4xl transform group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                    <p className="text-gray-500 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Info Bar */}
            <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Select a language above to begin your assessment</span>
              </div>
              <div className="flex gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-white opacity-40"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
