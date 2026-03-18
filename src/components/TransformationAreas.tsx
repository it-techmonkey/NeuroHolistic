"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ─── Standard, Clean UI Icons (Lucide-style) ───────────────────────────── */

function HealthIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function MindIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function RelIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PotentialIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v8" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h2" />
      <path d="m20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" />
      <path d="M22 22H2" />
      <path d="m8 6 4-4 4 4" />
      <path d="M16 18a4 4 0 0 0-8 0" />
    </svg>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const AREAS = [
  {
    title: "Health",
    description: "When the nervous system returns to balance, the body shifts out of chronic stress and into regulation.",
    Icon: HealthIcon,
    href: "/programs",
  },
  {
    title: "Mind",
    description: "As neural patterns reorganize, mental clarity increases and emotional reactivity decreases.",
    Icon: MindIcon,
    href: "/programs",
  },
  {
    title: "Relationships",
    description: "Internal coherence changes how we relate to others.",
    Icon: RelIcon,
    href: "/programs",
  },
  {
    title: "Human Potential",
    description: "When internal systems align, energy that was previously consumed by stress or unresolved patterns becomes available for creativity, purpose, and meaningful growth in life.",
    Icon: PotentialIcon,
    href: "/programs",
  },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function TransformationAreas() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="w-full bg-[#FAFBFF] py-20 md:py-28">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-[1200px] px-6 md:px-12"
      >
        {/* Header Section */}
        <div className="mb-14 flex flex-col items-center text-center md:mb-16">
          <motion.div variants={itemVariants} className="mb-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6366F1]">
              Who It Is For
            </span>
          </motion.div>

          <motion.h2 
            variants={itemVariants} 
            className="mb-4 max-w-[700px] text-[32px] font-semibold leading-[1.15] tracking-tight text-[#0F172A] md:text-[42px]"
          >
            Where Transformation Takes Shape
          </motion.h2>
        </div>

        {/* Opening paragraph */}
        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-[840px] mb-12 text-[15.5px] leading-[1.8] text-[#475569] text-center"
        >
          When internal systems return to balance and coherence, change begins to appear across multiple dimensions of life. As the nervous system stabilizes and perception reorganizes, individuals often experience shifts not only in how they feel internally, but also in how they think, relate to others, and engage with the world.
        </motion.p>

        {/* Clean Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {AREAS.map((area, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Link 
                href={area.href}
                className="group flex h-full flex-col justify-between rounded-[24px] border border-[#E2E8F0] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] md:p-8"
              >
                <div>
                  {/* Icon Container: Clean & Simple */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#64748B] transition-colors duration-300 group-hover:bg-[#EEF2FF] group-hover:text-[#6366F1]">
                    <area.Icon />
                  </div>
                  
                  {/* Text Content */}
                  <h3 className="mb-3 text-[20px] font-semibold text-[#0F172A]">
                    {area.title}
                  </h3>
                  <p className="text-[15.5px] leading-[1.65] text-[#475569]">
                    {area.description}
                  </p>
                </div>

                {/* Subtle Action Link */}
                <div className="mt-8 flex items-center gap-2 text-[14px] font-medium text-[#6366F1] opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Explore Dimension
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}