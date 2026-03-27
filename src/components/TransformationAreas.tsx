"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ─── Standard, Clean UI Icons ─────────────────────────────────────────── */

const Icons = {
  Health: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Mind: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  Relationships: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Potential: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0" />
    </svg>
  ),
};

const AREAS = [
  {
    title: "Health",
    description: "Restore balance in your body, release built-up tension, and experience a renewed sense of energy, ease, and physical well-being.",
    Icon: Icons.Health,
  },
  {
    title: "Mind & Heart",
    description: "Quiet the noise, gain clarity, and feel lighter, free from emotional weight and mental loops that have been holding you back.",
    Icon: Icons.Mind,
  },
  {
    title: "Relationships",
    description: "Shift how you connect, communicate, and respond, creating more ease, depth, and harmony in how you relate to others.",
    Icon: Icons.Relationships,
  },
  {
    title: "Potential",
    description: "Move beyond limitations, think with clarity, and step into a stronger, more expanded version of yourself and what you are capable of.",
    Icon: Icons.Potential,
  },
];

export default function TransformationAreas() {
  return (
    <section className="w-full bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        
        {/* Header: Compact & Centered */}
        <div className="mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
          >
            Where You Transform
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500"
          >
            The NeuroHolistic Method is for those ready to create real change in how they feel, think, and live in these core areas.
          </motion.p>
        </div>

        {/* Compact 4-Column Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AREAS.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href="/programs"
                className="group block h-full rounded-2xl border border-slate-100 bg-slate-50/30 p-6 transition-all duration-300 hover:border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <area.Icon />
                </div>
                
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {area.title}
                </h3>
                
                <p className="text-[14px] leading-relaxed text-slate-500 group-hover:text-slate-600">
                  {area.description}
                </p>

                <div className="mt-6 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Explore
                  <span className="text-[14px]">→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}