import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Features() {
  const features = [
    {
      title: "Adaptive Assessments",
      desc: "Quick, accurate skill evaluations that adjust to your performance.",
      fullDesc:
        "Our adaptive assessment system uses advanced AI algorithms to evaluate your current skill level and continuously adjust the difficulty of tasks based on your performance.",
      icon: "🎯",
      gradient: "from-blue-500 to-cyan-500",
      number: "01",

      // Stable dark-mode code analysis image
      img: "/feature2.jpg",
    },

    {
      title: "Personalized Task Generation",
      desc: "Receive tasks tailored to your strengths and improvement areas.",
      fullDesc:
        "Every task is uniquely generated for you based on your learning profile, preferences, and goals.",
      icon: "⚡",
      gradient: "from-purple-500 to-pink-500",
      number: "02",

      // Stable coding-task creation image
      img: "/feature1.jpg",
    },

    {
      title: "AI Mentor Support",
      desc: "Smart learning suggestions to guide your skill growth.",
      fullDesc:
        "Your personal AI mentor provides hints and guidance as you learn, adapted to your pace.",
      icon: "🧠",
      gradient: "from-orange-500 to-red-500",
      number: "03",

      // NEW FIXED IMAGE (MENTOR AI – 100% working)
      img: "https://images.unsplash.com/photo-1734597949889-f8e2ec87c8ea?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },

    {
      title: "Progress Tracking",
      desc: "Beautiful visual insights showing your improvement over time.",
      fullDesc:
        "Track your performance with analytics and pattern insights across your learning journey.",
      icon: "📈",
      gradient: "from-green-500 to-emerald-500",
      number: "04",

      // Stable analytics dashboard image
      img: "/signup show.jpg",
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <section id="features" className="relative w-full min-h-screen bg-black overflow-hidden pt-6 pb-20 px-4 lg:px-0">

      {/* Background lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          style={{ top: "10%", left: "5%" }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -25, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          style={{ bottom: "10%", right: "5%" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          className="text-center mb-20 pt-24"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm uppercase tracking-widest text-slate-500">
            Features
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">
            Unlock Your{" "}
            <span className="relative">
              Potential
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-[#E6FF03]"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1 }}
              />
            </span>
          </h2>

          <p className="text-base text-slate-400 mt-4 max-w-xl mx-auto">
            AI-powered learning that adapts, evolves, and grows with your needs.
          </p>
        </motion.div>

        {/* Features List */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Content */}
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>

                  {/* Number + faded line */}
                  <div className="mb-6 inline-flex items-center gap-4">
                    <div className="text-5xl font-bold text-[#E6FF03]">
                      {feature.number}
                    </div>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#E6FF03]/60 to-transparent"></div>
                  </div>

                  {/* Icon */}
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-4xl`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {feature.icon}
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-3xl md:text-4xl font-bold text-white mt-6">
                    {feature.title}
                  </h3>

                  {/* Desc */}
                  <p className="text-lg text-slate-400 mt-4 max-w-lg">
                    {feature.desc}
                  </p>

                  {/* Learn More button */}
                  <button
                    onClick={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                    className="mt-5 flex items-center gap-2 text-[#E6FF03] font-semibold hover:opacity-80 transition"
                  >
                    <span>
                      {expandedIndex === index ? "Hide Details" : "Learn More"}
                    </span>

                    <motion.span
                      animate={{ rotate: expandedIndex === index ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-lg inline-block"
                    >
                      →
                    </motion.span>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 border-t border-slate-700">
                          <p className="text-base text-slate-300 leading-relaxed">
                            {feature.fullDesc}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Image */}
                <motion.div
                  className={`${index % 2 === 1 ? "lg:order-1" : ""}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.img
                    src={feature.img}
                    alt={feature.title}
                    className="w-full h-96 md:h-[500px] rounded-3xl object-cover"
                  />
                </motion.div>
              </div>

              {/* Divider */}
              {index < features.length - 1 && (
                <div className="mt-24 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
