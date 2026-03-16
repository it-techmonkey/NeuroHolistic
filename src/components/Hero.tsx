"use client";

import { motion } from "framer-motion";
import BookNowButton from "@/components/booking/BookNowButton";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(120deg,#0B0F2B_0%,#11174A_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-[-120px] h-[420px] w-[420px] rounded-full bg-[#8B8BFF]/12 blur-3xl" />
        <div className="absolute -bottom-20 left-[-80px] h-[360px] w-[360px] rounded-full bg-[#A6A6FF]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-20 pt-40 md:px-10 md:pb-24 md:pt-44">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="max-w-[560px]"
          >
            <h1
              className="text-[40px] font-normal leading-[1.1] tracking-[-1px] text-white sm:text-[54px] lg:text-[64px]"
              style={{ fontFamily: "Inter, Satoshi, 'Neue Montreal', -apple-system, sans-serif" }}
            >
              <span className="font-normal">Restore the System</span>
              <br />
              <span className="italic">Transform</span>
              <span className="font-bold"> Your Life.</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-[18px] leading-relaxed text-[#C7C9E0] opacity-80">
              A neuroscience-led method for restoring your internal system, creating calmer
              states, clearer cognition, and measurable personal transformation.
            </p>
            <div className="mt-7 grid max-w-[440px] grid-cols-2 gap-3 text-white/80 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Method</p>
                <p className="mt-1 text-sm font-semibold text-white">5 Phases</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Format</p>
                <p className="mt-1 text-sm font-semibold text-white">1:1 + Group</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm col-span-2 sm:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Outcome</p>
                <p className="mt-1 text-sm font-semibold text-white">System Reset</p>
              </div>
            </div>
            <div className="mt-8 md:mt-10">
              <BookNowButton
                className="inline-flex items-center justify-center rounded-[10px] bg-white px-6 py-3.5 text-[16px] font-semibold text-black transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_36px_rgba(166,166,255,0.24)]"
              >
                Book Now
              </BookNowButton>
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

function NeuralGraphic() {
  const nodeOffsets = [
    { x: "24%", y: "16%", delay: 0.2 },
    { x: "78%", y: "24%", delay: 0.8 },
    { x: "18%", y: "68%", delay: 1.2 },
    { x: "72%", y: "76%", delay: 1.7 },
    { x: "48%", y: "10%", delay: 2.1 },
  ];

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative h-[320px] w-[320px] md:h-[460px] md:w-[460px]"
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(166,166,255,0.22)_0%,rgba(139,139,255,0.08)_45%,rgba(17,23,74,0)_78%)] blur-xl" />

      <motion.svg
        viewBox="0 0 500 500"
        className="absolute inset-0 h-full w-full"
        fill="none"
        initial={{ opacity: 0.2 }}
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#A6A6FF" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#8B8BFF" stopOpacity="0.42" />
          </radialGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "250px 250px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="250" cy="250" r="186" stroke="rgba(166,166,255,0.34)" strokeWidth="1.2" />
          <circle cx="250" cy="64" r="4" fill="#A6A6FF" />
          <circle cx="428" cy="250" r="3.2" fill="#A6A6FF" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "250px 250px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        >
          <ellipse
            cx="250"
            cy="250"
            rx="142"
            ry="174"
            stroke="rgba(139,139,255,0.28)"
            strokeWidth="1"
          />
          <circle cx="250" cy="76" r="3.2" fill="#8B8BFF" />
          <circle cx="122" cy="366" r="3" fill="#8B8BFF" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "250px 250px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <ellipse
            cx="250"
            cy="250"
            rx="114"
            ry="150"
            stroke="rgba(166,166,255,0.2)"
            strokeWidth="1"
          />
          <circle cx="350" cy="122" r="2.8" fill="#C7C9E0" />
          <circle cx="154" cy="368" r="2.8" fill="#C7C9E0" />
        </motion.g>

        <motion.circle
          cx="250"
          cy="250"
          r="52"
          fill="url(#sphereGlow)"
          animate={{ r: [48, 56, 48], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="250" cy="250" r="78" fill="rgba(166,166,255,0.16)" />
      </motion.svg>

      {nodeOffsets.map((node) => (
        <motion.span
          key={`${node.x}-${node.y}`}
          className="absolute block h-2 w-2 rounded-full bg-[#C7C9E0] shadow-[0_0_14px_rgba(166,166,255,0.7)]"
          style={{ left: node.x, top: node.y }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_58%)]" />
    </motion.div>
  );
}
