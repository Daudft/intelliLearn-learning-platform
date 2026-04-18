import { motion } from "framer-motion";

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
      img: "https://images.unsplash.com/photo-1734597949889-f8e2ec87c8ea?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaW5hZWxlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Progress Tracking",
      desc: "Beautiful visual insights showing your improvement over time.",
      fullDesc:
        "Track your performance with analytics and pattern insights across your learning journey.",
      icon: "📈",
      gradient: "from-green-500 to-emerald-500",
      number: "04",
      img: "/signup show.jpg",
    },
  ];

  return (
    <section id="features" className="relative w-full bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          style={{ top: "10%", left: "5%" }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-lime-400/10 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -25, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
          style={{ bottom: "10%", right: "5%" }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl"
          animate={{ x: [0, 20, -10, 0], y: [0, -40, 0] }}
          transition={{ duration: 16, repeat: Infinity }}
          style={{ top: "40%", left: "42%" }}
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center pt-24 md:pt-28 pb-16 md:pb-20">
          <motion.p
            className="text-xs tracking-[0.25em] text-slate-500 mb-3 uppercase"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            FEATURES
          </motion.p>

          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Learn Faster With Better Flow
          </motion.h2>

          <motion.p
            className="text-slate-300 text-lg max-w-xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Scroll through the cards to see how each feature reveals itself in sequence.
          </motion.p>
        </div>

        {features.map((feature, index) => (
          <section key={feature.title} className="relative h-[128vh] md:h-[132vh]">
            <motion.div
              className="sticky top-0 h-screen flex items-center"
              initial={{ opacity: 0, y: 140 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              viewport={{ amount: 0.42 }}
              style={{ zIndex: index + 5 }}
            >
              <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
                <motion.div
                  className="relative min-h-[84vh] rounded-3xl border border-slate-700/80 bg-slate-900/75 backdrop-blur-xl overflow-hidden"
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.35 }}
                >
                  <motion.img
                    src={feature.img}
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ scale: 1.08 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    viewport={{ amount: 0.35 }}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/65 to-slate-900/20" />

                  <div className="relative h-full px-6 md:px-10 lg:px-14 py-10 md:py-14 flex flex-col justify-end">
                    <motion.div
                      className="mb-6 inline-flex items-center gap-3 rounded-full bg-slate-900/85 border border-slate-600/70 px-4 py-2 w-fit"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 }}
                      viewport={{ amount: 0.35 }}
                    >
                      <span className="text-xl">{feature.icon}</span>
                      <span className="text-xs tracking-[0.2em] text-lime-300">{feature.number}</span>
                    </motion.div>

                    <motion.h3
                      className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight"
                      initial={{ opacity: 0, y: 26 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      viewport={{ amount: 0.35 }}
                    >
                      {feature.title}
                    </motion.h3>

                    <motion.p
                      className="text-base md:text-xl text-slate-200 mt-4 max-w-3xl leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.18 }}
                      viewport={{ amount: 0.35 }}
                    >
                      {feature.desc}
                    </motion.p>

                    <motion.p
                      className="text-sm md:text-base text-slate-300 mt-6 max-w-3xl leading-relaxed"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: 0.26 }}
                      viewport={{ amount: 0.35 }}
                    >
                      {feature.fullDesc}
                    </motion.p>

                    <motion.div
                      className="mt-8 h-1.5 w-full max-w-sm rounded-full bg-slate-700/80 overflow-hidden"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      viewport={{ amount: 0.35 }}
                    >
                      <motion.div
                        className="h-full bg-linear-to-r from-lime-300 to-cyan-300"
                        initial={{ width: "0%" }}
                        whileInView={{ width: `${70 + index * 7}%` }}
                        transition={{ duration: 0.9, delay: 0.35 }}
                        viewport={{ amount: 0.35 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>
        ))}
      </div>
    </section>
  );
}
