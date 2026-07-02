import React from "react";
import { ChevronRight, Code, Coffee, Zap } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

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

/* Premium course card — cursor-reactive 3D tilt + rotating glow border,
   matching the HowItWorks step cards. */
function CourseCard({ course, index }) {
  const IconComponent = course.icon;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 150,
    damping: 15,
  });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      className="relative [perspective:1400px]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: "easeOut" }}
      viewport={{ once: true, margin: "-80px" }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative z-10 flex h-full flex-col overflow-hidden border border-white/10 bg-white/[0.04] p-6"
      >
        {/* hover glow */}
        <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(400px_circle_at_50%_0%,rgba(77,162,255,0.15),transparent_70%)]" />

        {/* top row */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm tracking-[0.3em] text-sui-blue">
            {course.title.toUpperCase()}
          </p>
          <span className="h-2.5 w-2.5 bg-sui-blue shadow-[0_0_0_5px_rgba(77,162,255,0.15)]" />
        </div>

        {/* visual panel — dotted grid, ghost initial, icon */}
        <div
          className="relative mt-5 h-24 shrink-0 overflow-hidden border border-white/10"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <span className="pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-[7rem] font-black leading-none text-white/[0.05]">
            {course.title.charAt(0)}
          </span>
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex h-12 w-12 items-center justify-center border border-sui-blue/30 bg-sui-blue/10 text-sui-blue transition-all duration-500 group-hover:scale-110 group-hover:bg-sui-blue group-hover:text-sui-sea">
              <IconComponent className="h-6 w-6" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* text */}
        <div className="mt-5">
          <h2 className="font-display text-2xl font-bold text-white">
            {course.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-sui-fog">{course.description}</p>
        </div>

        {/* level */}
        <span className="mt-3 block border-b border-white/10 pb-4 text-sm font-medium text-sui-mist">
          {course.level}
        </span>

        {/* topics — revealed on hover, fixed slot so layout stays put */}
        <div className="mt-4 h-24 overflow-hidden">
          <div className="opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sui-mist">
              Topics Covered
            </p>
            <div className="flex flex-wrap gap-2">
              {course.topics.map((topic, i) => (
                <span
                  key={i}
                  className="border border-white/10 bg-white/5 px-3 py-1 text-xs text-sui-fog"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* button */}
        <button className="group/btn mt-auto flex w-full items-center justify-center gap-2 bg-sui-blue py-3 font-semibold text-white transition-all duration-300 hover:bg-sui-bright hover:shadow-[0_12px_32px_-8px_rgba(77,162,255,0.6)] active:scale-95">
          View Course
          <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Courses() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <Navbar />

      {/* AMBIENT BACKGROUND — white→blue glow rising from the bottom (hero style) */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 115%,
              rgba(234,243,255,0.12) 0%,
              rgba(90,168,255,0.16) 24%,
              rgba(47,127,224,0.10) 44%,
              rgba(0,0,0,0) 70%)`,
        }}
      />
      {/* drifting blue orb */}
      <div className="pointer-events-none absolute -right-24 top-32 z-0 h-80 w-80 rounded-full bg-sui-blue/10 blur-[120px] animate-sui-float" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-6 md:pt-10">
        {/* Heading */}
        <motion.div
          className="mx-auto mb-8 max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-sui-blue">
            Courses
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Explore Our Courses
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-sui-fog">
            Choose a course and start learning with IntelliLearn's smart
            personalized system.
          </p>
        </motion.div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {courses.map((course, index) => (
            <CourseCard key={course.title} course={course} index={index} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
