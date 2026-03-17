"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ─── Clean Scientific Icons ─────────────────────────────────────────────── */

function BrainIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2h5" />
      <path d="M12 2v5" />
      <path d="M16 8.5c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5c0 1.5-1 2.5-2.5 2.5S11 15 11 13.5c-1.5 0-2.5-1-2.5-2.5S9.5 8.5 11 8.5c0-1.5 1-2.5 2.5-2.5S16 7 16 8.5Z" />
      <path d="M12 16v6" />
      <path d="M9.5 22h5" />
    </svg>
  );
}

function DnaIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
      <path d="m17 6-2.5-2.5" />
      <path d="m14 8-1.5-1.5" />
      <path d="m7 18 2.5 2.5" />
      <path d="m10 16 1.5 1.5" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h4l3-9 5 18 3-9h5" />
    </svg>
  );
}

function PhysicsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M22 12c0 4.418-4.477 8-10 8S2 16.418 2 12 6.477 4 12 4s10 3.582 10 8Z" strokeDasharray="4 4" />
      <path d="M12 22c4.418 0 8-4.477 8-10S16.418 2 12 2 4 6.477 4 12s3.582 10 8 10Z" strokeDasharray="4 4" />
    </svg>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    title: "Neuroplasticity",
    description: "Rewiring neural pathways to establish new baselines of emotional and cognitive regulation.",
    Icon: BrainIcon,
  },
  {
    title: "Epigenetic Expression",
    description: "Understanding how environmental and internal shifts actively influence biological gene expression.",
    Icon: DnaIcon,
  },
  {
    title: "Bioenergetic Processes",
    description: "Optimizing the fundamental energy dynamics that drive cellular and systemic human functioning.",
    Icon: WaveIcon,
  },
  {
    title: "Complex Systems Physics",
    description: "Applying the interconnected laws of modern physics to understand human transformation holistically.",
    Icon: PhysicsIcon,
  },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function ScientificFoundation() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="relative w-full bg-white py-24 md:py-32 overflow-hidden">
      {/* Subtle Structural Grid Background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#F1F5F9_1px,transparent_1px),linear-gradient(to_bottom,#F1F5F9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12"
      >
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-20">
          
          {/* Left Column: The Narrative (Spans 5 cols) */}
          <div className="lg:sticky lg:top-32 lg:col-span-5">
            <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
              <div className="h-px w-6 bg-[#6366F1]" />
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6366F1]">
                Methodology
              </p>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mb-8 text-[34px] font-semibold leading-[1.15] tracking-tight text-[#0F172A] md:text-[42px]"
            >
              Scientific & Theoretical <span className="italic text-[#64748B]">Foundations.</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mb-10 text-[17px] leading-[1.8] text-[#475569]"
            >
              The NeuroHolistic Method™ integrates insights from contemporary neuroscience, research on epigenetic expression, and emerging perspectives on bioenergetic processes. It draws on modern physics to provide a broader, interconnected framework for understanding human potential.
            </motion.p>

            {/* Replaced the giant gray box with an elegant Clinical/Doctor Credential Block */}
            <motion.div variants={itemVariants} className="mb-10 flex items-center gap-4 rounded-[16px] border border-[#E2E8F0] bg-[#FAFBFF] p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-[18px] font-semibold text-white">
                Dr
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Dr. Fawzia Yassmina</p>
                <p className="text-[14px] text-[#64748B]">Lead Researcher & Founder</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href="/research"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F172A] px-8 text-[14.5px] font-medium text-white transition-all hover:bg-[#1E293B] hover:shadow-[0_8px_20px_rgba(15,23,42,0.15)]"
              >
                Explore The Research
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: The Scientific Pillars Grid (Spans 7 cols) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {PILLARS.map((pillar, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.06)]"
                >
                  {/* Subtle top border highlight on hover */}
                  <div className="absolute left-0 top-0 h-1 w-full scale-x-0 bg-[#6366F1] transition-transform duration-500 group-hover:scale-x-100 origin-left" />

                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#64748B] transition-colors duration-300 group-hover:bg-[#EEF2FF] group-hover:text-[#6366F1]">
                    <pillar.Icon />
                  </div>
                  
                  <h3 className="mb-3 text-[18px] font-semibold text-[#0F172A]">
                    {pillar.title}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-[#475569]">
                    {pillar.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}