"use client";

import { motion } from "framer-motion";
import HeroBookingForm from "@/components/booking/HeroBookingForm";

export default function Hero() {

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(135deg,#0B1028_0%,#0A132B_48%,#060710_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-120px] sm:right-[-80px] md:right-[-40px] top-[8%] h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] md:h-[520px] md:w-[520px] rounded-full bg-[radial-gradient(circle,rgba(152,170,255,0.18)_0%,rgba(6,7,16,0)_62%)] blur-[10px]" />
        <div className="hero-noise-texture absolute inset-0 opacity-[0.045]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 py-32 sm:py-40 md:py-44 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="max-w-[650px] text-center lg:text-left"
          >
            <h1
              className="leading-[1.05] tracking-[-0.035em] text-[#EAF0FF]"
              style={{ fontFamily: "Inter, Satoshi, 'Neue Montreal', -apple-system, sans-serif" }}
            >
              <span className="block text-[32px] font-normal text-[#E2E9FF] sm:text-[44px] md:text-[66px] lg:text-[55px]">
                Restore the System.
              </span>
              <span className="block text-[32px] italic text-white sm:text-[40px] md:text-[60px] lg:text-[55px]">
                Transform Your Life.
              </span>
            </h1>
            <p className="mt-6 mx-auto lg:mx-0 max-w-[50ch] text-[15px] sm:text-[16px] md:text-[18px] leading-[1.7] text-[#C3CBE8] lg:text-[17.5px]">
              The NeuroHolistic Method™ is a science-based approach that restores balance within the human system, supporting deep, long-lasting transformation.
            </p>
            <HeroBookingForm />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.22, duration: 0.85 }}
            className="relative flex justify-center lg:justify-end"
          >
            <NeuralGraphic />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export function NeuralGraphic() {
  return (
    <div className="relative h-[280px] w-[280px] sm:h-[340px] sm:w-[340px] md:h-[400px] md:w-[400px] lg:h-[550px] lg:w-[550px] flex items-center justify-center">
      
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.6, 0.35] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] md:h-[340px] md:w-[340px] lg:h-[340px] lg:w-[340px] rounded-full bg-[radial-gradient(circle,rgba(61,90,255,0.2)_0%,rgba(148,80,255,0.15)_40%,rgba(6,7,16,0)_70%)] blur-[60px] sm:blur-[80px] md:blur-[110px]"
      />

      <svg className="absolute h-full w-full" viewBox="0 0 500 500">
        <defs>
          <filter id="goo" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>

        <g filter="url(#goo)">
          {[...Array(6)].map((_, i) => (
            <motion.circle
              key={`blob-${i}`}
              cx="250"
              cy="250"
              r={42 + i * 5}
              fill="rgba(234,240,255,0.85)"
              animate={{
                x: [0, Math.sin(i * 1.5) * 55, 0],
                y: [0, Math.cos(i * 1.5) * 55, 0],
                scale: [1, 1.25, 0.9, 1],
              }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </g>

        <g className="opacity-15">
          <circle cx="250" cy="250" r="195" stroke="white" strokeWidth="0.5" strokeDasharray="6 12" />
          <motion.circle 
            cx="250" cy="250" r="195" stroke="#94A3B8" strokeWidth="1" strokeDasharray="1 100" strokeLinecap="round"
            animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: 'center' }}
          />
        </g>
      </svg>

      {/* Top Right: System Status */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-2 sm:top-10 right-0 sm:right-3 backdrop-blur-md bg-white/5 border border-white/10 p-2 sm:p-3.5 rounded-[16px] sm:rounded-[20px] shadow-2xl"
      >
        <div className="flex gap-1.5 items-center">
          <div className="relative h-2.5 w-2.5 sm:h-4 sm:w-4">
            <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-pulse" />
            <div className="absolute inset-0.5 sm:inset-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-300" />
          </div>
          <span className="text-[8px] sm:text-[11px] uppercase tracking-[0.15em] text-white/70 font-medium">Status</span>
        </div>
        <div className="text-white text-[11px] sm:text-[15px] mt-1 font-light leading-tight">System Restored</div>
      </motion.div>

      {/* Bottom Left: Neural Balance - Now visible on mobile */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-2 sm:bottom-10 left-0 sm:left-3 backdrop-blur-md bg-white/5 border border-white/10 p-2 sm:p-4 rounded-[16px] sm:rounded-[20px] shadow-2xl"
      >
        <div className="text-[8px] sm:text-[11px] uppercase tracking-[0.15em] text-white/70 font-medium mb-1.5 sm:mb-3">Neural Balance</div>
        <div className="flex items-end gap-1 h-4 sm:h-6">
          {[0.5, 0.8, 1, 0.7, 0.9, 0.6].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 sm:w-2 bg-gradient-to-t from-blue-500/80 to-blue-400 rounded-t-[1px]"
              animate={{ height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`] }}
              transition={{ duration: 2.2 + i * 0.25, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}