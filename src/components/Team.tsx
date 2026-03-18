"use client";

import { motion, cubicBezier } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

/* ─── Data ───────────────────────────────────────────────────────────────── */

const FOUNDER = {
  slug: "dr-fawzia-yassmina",
  name: "Dr. Fawzia Yassmina",
  role: "Lead Founder",
  title: "Founder & Creator of the NeuroHolistic Method™",
  bio: "Pioneering a new era of neurological wellness through the integration of clinical science and holistic healing modalities.",
  // Assume images are local assets, adjust paths as necessary
  image: "/images/team/Fawzia%20Yassmina.jpeg",
};

const PRACTITIONERS = [
  {
    slug: "joud-charafeddin",
    name: "Joud Charafeddin",
    title: "Certified Practitioner",
    // Joud's original image will be used, but fit differently
    image: "/images/team/Joud%20Charafeddin.jpeg",
  },
  {
    slug: "mariam-al-kaisi",
    name: "Mariam Al Kaisi",
    title: "Certified Practitioner",
    image: "/images/team/Mariam%20Al%20Kaissi.jpeg",
  },
  {
    slug: "noura-youssef",
    name: "Noura Youssef",
    title: "Certified Practitioner",
    image: "/images/team/Noura%20Yousef.jpeg",
  },
  {
    slug: "reem-mobayed",
    name: "Reem Mobayed",
    title: "Certified Practitioner",
    image: "/images/team/Reem%20Mbayed.jpeg",
  },
  {
    slug: "fawares-azaar",
    name: "Fawares Azaar",
    title: "Certified Practitioner",
    image: "/images/team/Fawares%20Azaar.jpeg",
  },
  {
    slug: "zekra-khayata",
    name: "Zekra Khayata",
    title: "Certified Practitioner",
    image: "/images/dummy-user.svg", // Kept dummy
  },
];

/* ─── Animation Variants ─────────────────────────────────────────────────── */

const customEase = cubicBezier(0.22, 1, 0.36, 1);

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: customEase } }
};

const imageFade = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.2, ease: customEase } }
};

const textStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function CollectiveRedesign() {
  const [activePractitionerIndex, setActivePractitionerIndex] = useState(0);

  const nextPractitioner = () => {
    setActivePractitionerIndex((prev) => (prev + 1) % PRACTITIONERS.length);
  };

  const prevPractitioner = () => {
    setActivePractitionerIndex((prev) => (prev - 1 + PRACTITIONERS.length) % PRACTITIONERS.length);
  };

  const activePractitioner = PRACTITIONERS[activePractitionerIndex];

  return (
    <section className="bg-slate-50 py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        
        {/* 1. LAYERED INTRO & FOUNDER (Visual Fix: Fit & Scale) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start mb-32 md:mb-40">
          
          {/* Text/Header Column */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={textStagger}
            className="md:col-span-5 pt-12 relative z-10"
          >
            <motion.h2 variants={fadeInUp} className="text-[12px] font-bold uppercase tracking-[0.4em] text-indigo-600 mb-6">
              The Collective
            </motion.h2>
            <motion.h3 variants={fadeInUp} className="text-5xl md:text-6xl font-light tracking-tighter text-slate-950 leading-[1.05] mb-10">
              Pioneering <br /> Wellness, <span className="italic font-serif text-slate-500">Together</span>.
            </motion.h3>
            <motion.div variants={fadeInUp} className="max-w-md space-y-5 text-slate-700 leading-relaxed font-light">
                <p>We are a dedicated group of specialists united by a singular vision: to revolutionize neurological care.</p>
                <p>By blending rigorous clinical expertise with compassionate, holistic methodologies, we empower individuals on their unique path to optimization and healing.</p>
            </motion.div>
          </motion.div>

          {/* Founder Feature Column (The Visual Layering & Image Fix) */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="md:col-span-7 relative"
          >
            {/* LARGE ABSTRACT SHAPE (Design Element, replace with brand asset if needed) */}
            <div className="absolute -top-16 -right-16 md:-top-24 md:-right-24 w-80 h-80 md:w-[480px] md:h-[480px] bg-indigo-100 rounded-full opacity-60 blur-3xl z-0" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-10 gap-8 items-center">
              
              {/* Founder Image (Visual Fix: object-contain and centered) */}
              <motion.div variants={imageFade} className="lg:col-span-6 bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/60 aspect-[3/4] flex items-center justify-center overflow-hidden">
                <img
                  src={FOUNDER.image}
                  alt={FOUNDER.name}
                  className="w-auto h-auto max-w-full max-h-full object-contain rounded-xl"
                  style={{ transform: 'scale(1.2)', transformOrigin: '50% 15%' }} // Visual adjustment: subtle zoom-out and reframing
                />
              </motion.div>

              {/* Founder Text Card */}
              <motion.div variants={fadeInUp} className="lg:col-span-4 lg:-ml-10 bg-white p-8 lg:p-10 rounded-2xl shadow-lg shadow-indigo-50 border border-slate-100">
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                    {FOUNDER.role}
                  </span>
                  <h4 className="text-2xl font-semibold text-slate-950 mb-3">{FOUNDER.name}</h4>
                  <p className="text-base text-slate-600 font-light mb-8 leading-relaxed">
                    {FOUNDER.title}
                  </p>
                  <Link href={`/team/${FOUNDER.slug}`} className="group inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Full Profile <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
              </motion.div>
            </div>
          </motion.div>

        </div>


        {/* 2. THE CHOREOGRAPHED PRACTITIONER SHOWCASE (New Design Concept) */}
        <div className="pt-24 md:pt-32 border-t border-slate-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Left Column: Image (Dynamic & Positioned to look distinct) */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              
              {/* Background Art (The Layer) */}
              <div className="absolute -top-10 -left-10 md:-top-16 md:-left-16 w-[120%] h-[120%] z-0 rounded-[40px] border-[12px] md:border-[16px] border-white skew-x-[-1deg] skew-y-[1deg]" style={{ background: 'linear-gradient(135deg, #f0f3ff 0%, #e0e7ff 100%)' }} />

              <motion.div 
                key={activePractitioner.slug} // Key forces animation re-run on change
                initial={{ opacity: 0, x: -30, rotate: -3 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: 30, rotate: 3 }}
                transition={{ duration: 0.6, ease: customEase }}
                className="relative z-10 aspect-[3/4] rounded-2xl shadow-2xl shadow-slate-300/60 overflow-hidden flex items-center justify-center p-4 md:p-6 bg-white"
              >
                {/* Joud's Image Fix (or any other): object-contain with max-dimensions */}
                <img
                  src={activePractitioner.image}
                  alt={activePractitioner.name}
                  className={`
                    w-auto h-auto max-w-full max-h-full rounded-xl object-contain
                    ${activePractitioner.image.includes('dummy') ? 'opacity-30' : 'grayscale'}
                  `}
                />
              </motion.div>
            </div>

            {/* Right Column: Practitioner Bio & Controls */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              
              <motion.h4 className="text-[12px] font-bold uppercase tracking-[0.4em] text-slate-500 mb-4">
                Our Specialists
              </motion.h4>
              
              <div className="mb-10 min-h-[140px]"> {/* Fixed height prevents layout shift on data load */}
                <motion.h3 
                  key={`${activePractitioner.slug}-name`}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-light text-slate-950 mb-3 tracking-tight"
                >
                  {activePractitioner.name}
                </motion.h3>
                <motion.p 
                   key={`${activePractitioner.slug}-title`}
                   initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg md:text-xl text-indigo-700/80 font-medium mb-8"
                >
                  {activePractitioner.title}
                </motion.p>
                 <motion.div 
                  key={`${activePractitioner.slug}-link`}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                 >
                    <Link href={`/team/${activePractitioner.slug}`} className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1.5 hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                      Learn About Their Method
                    </Link>
                 </motion.div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-6 border-t border-slate-200 pt-10">
                <button onClick={prevPractitioner} className="p-4 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
                  <ArrowLeft size={20} strokeWidth={1.5} />
                </button>
                <button onClick={nextPractitioner} className="p-4 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
                  <ArrowRight size={20} strokeWidth={1.5} />
                </button>
                <div className="ml-auto text-sm font-mono text-slate-400">
                    <span className="text-indigo-600 font-semibold">{activePractitionerIndex + 1}</span> / {PRACTITIONERS.length}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}