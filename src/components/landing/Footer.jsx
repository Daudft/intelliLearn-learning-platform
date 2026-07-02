import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import PixelReveal from "./PixelReveal";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "start center"],
  });

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden border-t border-white/10 bg-black py-20 text-white"
    >
      {/* PIXEL REVEAL — blue tiles dissolve center-out to reveal the black footer */}
      <PixelReveal progress={scrollYProgress} colorClass="bg-sui-blue" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        {/* Main CTA */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="mb-8 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Ready to transform <br />
            <span className="text-sui-blue">your learning experience?</span>
          </motion.h2>

          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-sui-fog"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Where intelligent assessment meets progress, helping you build on
            strengths and improve with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link to="/signup">
              <button className="group relative overflow-hidden bg-sui-blue px-8 py-4 text-lg font-semibold leading-7 text-white">
                <span className="block transition-transform duration-300 group-hover:-translate-y-[200%]">
                  Get Started Now →
                </span>
                <span className="absolute inset-0 flex translate-y-[200%] items-center justify-center transition-transform duration-300 group-hover:translate-y-0">
                  Get Started Now →
                </span>
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="mb-16 h-px w-full bg-white/10" />

        {/* Brand & Contact */}
        <div className="mb-12 text-center">
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-4 text-[26px] font-bold">
              <span className="text-sui-blue">Intelli</span>
              <span className="text-[24px] font-medium text-slate-200">Learn</span>
            </h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-sui-mist">
              Transforming education through AI-powered learning experiences and
              personalized insights.
            </p>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-2 pt-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Mail className="h-4 w-4 text-sui-blue" />
            <a
              href="mailto:support@intellilearn.ai"
              className="text-sm font-semibold text-white transition-colors hover:text-sui-blue"
            >
              support@intellilearn.ai
            </a>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between border-t border-white/10 pt-12 md:flex-row">
          <p className="text-sm text-sui-mist">
            © {currentYear} IntelliLearn. All rights reserved.
          </p>
          <div className="mt-6 flex gap-8 md:mt-0">
            <a href="#" className="text-sm text-sui-mist transition-colors hover:text-sui-blue">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-sui-mist transition-colors hover:text-sui-blue">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
