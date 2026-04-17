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
      gradient: "from-blue-500 to-yellow-400",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      tagline: "Versatile & Powerful"
    },
    Java: {
      gradient: "from-red-500 to-orange-400",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
      tagline: "Enterprise Standard"
    },
    C: {
      gradient: "from-indigo-600 to-blue-500",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg",
      tagline: "Performance First"
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-[#E6FF03] absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Premium Header */}
        <div className="text-center mb-16 space-y-5">
          <h1 className="text-7xl font-black text-gray-900 tracking-tight leading-tight">
            Choose Your
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-clip-text text-transparent">
              Programming Language
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select your preferred language and demonstrate your coding expertise
          </p>
        </div>

        {/* Language Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {languages.map((language) => {
            const config = languageConfig[language.name] || {
              gradient: "from-gray-500 to-gray-700",
              icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
              tagline: "Programming Language"
            };
            
            return (
              <div
                key={language.id}
                onMouseEnter={() => setHoveredCard(language.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleLanguageSelect(language.id)}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl 
                transition-all duration-500 cursor-pointer transform hover:-translate-y-2
                border-2 border-transparent hover:border-gray-900 overflow-hidden"
              >
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 
                  group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Accent Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} 
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>

                {/* Icon Container */}
                <div className="relative mb-6 flex justify-center">
                  <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${config.gradient} p-0.5
                    transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}>
                    <div className="w-full h-full bg-white rounded-2xl p-5 flex items-center justify-center">
                      <img
                        src={config.icon}
                        alt={language.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3 relative">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {language.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-500">
                    {config.tagline}
                  </p>

                  {/* Start Button */}
                  <button className="w-full mt-6 bg-[#E6FF03] hover:bg-[#d7ee00] text-gray-900 
                    font-bold py-4 rounded-xl transition-all duration-300
                    transform group-hover:scale-105 shadow-md hover:shadow-lg">
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

                {/* Decorative Elements */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br 
                  from-gray-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500"></div>
              </div>
            );
          })}
        </div>

        {/* Assessment Details - Premium Card */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 shadow-2xl overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Accent Corner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E6FF03] 
            to-transparent opacity-10 rounded-full -mr-32 -mt-32"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#E6FF03] rounded-full"></div>
              <h3 className="text-3xl font-bold text-white">
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
                    <p className="text-gray-400 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Info Bar */}
            <div className="mt-8 pt-6 border-t border-gray-700 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Select a language above to begin your assessment</span>
              </div>
              <div className="flex gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#E6FF03] opacity-50"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}