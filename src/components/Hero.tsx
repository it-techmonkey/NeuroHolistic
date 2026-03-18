"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BookNowButton from "@/components/booking/BookNowButton";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(135deg,#0B1028_0%,#0A132B_48%,#060710_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-120px] top-[8%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(152,170,255,0.18)_0%,rgba(6,7,16,0)_62%)] blur-[10px]" />
        <div className="hero-noise-texture absolute inset-0 opacity-[0.045]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] top-20 px-6 pb-20 pt-40 md:px-10 md:pb-24 md:pt-44">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="max-w-[650px]"
          >
            <h1
              className="max-w-[22ch] leading-[1.05] tracking-[-0.035em] text-[#EAF0FF]"
              style={{ fontFamily: "Inter, Satoshi, 'Neue Montreal', -apple-system, sans-serif" }}
            >
              <span className="block whitespace-nowrap text-[36px] font-normal text-[#E2E9FF] sm:text-[66px] lg:text-[55px]">
                Restore the System.
              </span>
              <span className="block whitespace-nowrap text-[36px] italic text-white sm:text-[60px] lg:text-[55px]">
                Transform Your Life.
              </span>
            </h1>
            <p className="mt-10 max-w-[60ch] text-[17px] leading-[1.85] text-[#C3CBE8] sm:text-[18px] lg:text-[17.5px]">
              The NeuroHolistic Method™ is a science-based approach that restores balance within the human system, supporting deep, long-lasting transformation.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-3 md:gap-4">
              <Link
                href="/programs"
                className="inline-flex items-center justify-center gap-1 rounded-[12px] bg-white px-6 py-3.5 text-[15px] font-semibold tracking-[0.01em] text-[#0B0F2B] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(161,184,255,0.2)] hover:bg-[#F3F6FF]"
              >
                Book a Consultation <span>→</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
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
    <div className="relative h-[400px] w-[400px] md:h-[550px] md:w-[550px] flex items-center justify-center">
      
      {/* 1. Multi-Layered Ambient Glow - More Sophisticated Blend */}
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.6, 0.35] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(61,90,255,0.2)_0%,rgba(148,80,255,0.15)_40%,rgba(6,7,16,0)_70%)] blur-[110px]"
      />
      <motion.div
        animate={{ 
          scale: [1.05, 0.95, 1.05],
          opacity: [0.15, 0.3, 0.15] 
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(61,200,255,0.1)_0%,rgba(6,7,16,0)_80%)] blur-[90px]"
      />

      <svg className="absolute h-full w-full" viewBox="0 0 500 500">
        <defs>
          {/* Enhanced Gooey Filter - Critical for organic movement */}
          <filter id="goo" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>

        {/* 2. The Morphing System Core - Procedural Bio-Digital Harmony */}
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
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ opacity: 0.85 }}
            />
          ))}
        </g>

        {/* 3. Geometric Precision Rings - Subtly connecting bio to digital */}
        <g className="opacity-15">
          {/* Subtle Outer Dash */}
          <circle cx="250" cy="250" r="195" stroke="white" strokeWidth="0.5" strokeDasharray="6 12" />
          
          {/* Detailed Inner Arc with Glowing Tracer */}
          <circle cx="250" cy="250" r="195" stroke="#94A3B8" strokeWidth="1" strokeDasharray="1 100" strokeLinecap="round" />
          <motion.circle 
            cx="250" cy="250" r="195" 
            stroke="#94A3B8" strokeWidth="1" 
            strokeDasharray="1 100" 
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: 'center' }}
          />
          
          {/* Very Faint Network Overlay */}
          <circle cx="250" cy="250" r="150" stroke="white" strokeWidth="0.25" opacity="0.1" />
        </g>
      </svg>

      {/* 4. Glassmorphic UI Elements - Sleeker & More Functional */}
      
      {/* Top Right: System Status */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-14 right-2 md:right-10 backdrop-blur-2xl bg-white/5 border border-white/12 p-3.5 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
      >
        <div className="flex gap-2.5 items-center">
          <div className="relative h-4 w-4">
            <div className="absolute inset-0 h-4 w-4 rounded-full bg-cyan-400 opacity-20 animate-pulse-slow" />
            <div className="absolute inset-1 h-2 w-2 rounded-full bg-cyan-300" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-medium">Status</span>
        </div>
        <div className="text-white text-[15px] mt-2 font-light tracking-tight leading-tight">System Restored</div>
      </motion.div>

      {/* Bottom Left: Neural Balance */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-22 left-2 md:left-6 backdrop-blur-2xl bg-white/5 border border-white/12 p-4 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
      >
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-medium mb-3">Neural Balance</div>
        <div className="flex items-end gap-1 h-6">
          {[0.5, 0.8, 1, 0.7, 0.9, 0.6].map((h, i) => (
            <motion.div
              key={i}
              className="w-2 bg-gradient-to-t from-blue-500/80 to-blue-400 rounded-t-sm"
              animate={{ 
                height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2.2 + i * 0.25, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}