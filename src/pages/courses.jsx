import React, { useState } from "react";
import { ChevronRight, Code, Coffee, Zap } from "lucide-react";

export default function Courses() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const courses = [
    {
      title: "Python",
      description: "Learn Python programming from basics to advanced.",
      level: "Beginner Friendly",
      icon: Code,
      topics: ["Syntax", "OOP", "Data Science", "Web Dev"],
    },
    {
      title: "Java",
      description: "Master OOP and enterprise-level development.",
      level: "Intermediate",
      icon: Coffee,
      topics: ["Classes", "Threads", "Spring", "Microservices"],
    },
    {
      title: "C Language",
      description: "Understand memory, pointers, and low-level programming.",
      level: "Core Foundations",
      icon: Zap,
      topics: ["Pointers", "Memory", "Algorithms", "Systems"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-6">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-black leading-tight">
          Explore Our Courses
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose a course and start learning with IntelliLearn's smart personalized system.
        </p>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {courses.map((course, index) => {
          const IconComponent = course.icon;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`bg-white rounded-2xl px-8 py-8 shadow-lg cursor-pointer transition-all duration-700 ease-in-out ${
                isHovered ? "shadow-2xl -translate-y-3" : ""
              }`}
            >
              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-lg mb-4 transition-all duration-700 ease-in-out ${
                  isHovered ? "scale-110 bg-[#E6FF03]" : "bg-gray-100"
                }`}
              >
                <IconComponent
                  className={`w-6 h-6 transition-all duration-700 ease-in-out ${
                    isHovered ? "text-black" : "text-gray-700"
                  }`}
                />
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {course.title}
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-4">{course.description}</p>

              {/* Level */}
              <span className="text-sm font-medium text-gray-500 block pb-6 border-b border-gray-200">
                {course.level}
              </span>

              {/* Topics - Fixed height container */}
              <div className="h-32 overflow-hidden">
                <div
                  className={`transition-all duration-700 ease-in-out ${
                    isHovered ? "opacity-100 mt-6" : "opacity-0"
                  }`}
                >
                  <p className="text-xs text-gray-600 font-semibold mb-3 uppercase tracking-wide">
                    Topics Covered
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {course.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Button */}
              <button className="w-full bg-[#E6FF03] text-black py-3 rounded-xl font-semibold transition-all duration-700 ease-in-out flex items-center justify-center gap-2 hover:shadow-lg active:scale-95">
                View Course
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}