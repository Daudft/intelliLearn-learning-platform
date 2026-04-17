import { motion } from "framer-motion";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <footer className="relative w-full bg-black text-white py-20 overflow-hidden  border border-white/10">
      
      

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Main CTA Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Ready to transform <br />
            <span className="bg-linear-to-r from-yellow-300 via-green-400 to-lime-300 text-transparent bg-clip-text">
              your learning experience?
            </span>
          </motion.h2>
          
          <motion.p
            className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Where intelligent assessment meets progress, helping you build on strengths and improve with confidence.
          </motion.p>
          
          <motion.a
            href="/signup"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <button
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
              className="relative px-8 py-4 bg-linear-to-r from-yellow-300 via-green-400 to-lime-300 text-black font-bold rounded-2xl hover:shadow-2xl hover:shadow-green-400/50 transition-all text-lg inline-flex items-center gap-2 overflow-hidden"
            >
              <span className={`inline-flex items-center gap-2 transition-all duration-700 ${hoveredButton ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100"}`}>
                Get Started Now →
              </span>
              <span className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-700 ${hoveredButton ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                Get Started Now →
              </span>
            </button>
          </motion.a>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent mb-16"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        />

        {/* Brand & Contact Section */}
        <div className="text-center mb-12">
          {/* Brand - Center */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mb-4">
              <h3 className="text-[26px] font-bold">
                <span className="bg-linear-to-r text-[#E6FF03]  bg-clip-text">
                  Intelli
                </span>
                <span className="text-[24px] font-medium text-[#E6E6E6]">
                  Learn
                </span>
                
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
              Transforming education through AI-powered learning experiences and personalized insights.
            </p>
          </motion.div>

          {/* Contact - Under Brand */}
          <motion.div
            className="flex justify-center items-center gap-2 pt-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-lg">✉️</span>
            <a href="mailto:support@intellilearn.ai" className="text-white hover:text-green-400 transition font-semibold text-sm">
              support@intellilearn.ai
            </a>
          </motion.div>
        </div>

        {/* Bottom Footer Links */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-sm">
            © {currentYear} IntelliLearn. All rights reserved.
          </p>
          
          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-green-400 transition text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition text-sm">
              Terms & Conditions
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}