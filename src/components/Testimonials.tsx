"use client";

import { motion } from "framer-motion";

/* ─── Clean UI Icons ─────────────────────────────────────────────────────── */

function QuoteIcon() {
  return (
    <svg className="h-8 w-8 text-[#E2E8F0]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-transparent text-[#CBD5E1]"}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    text: "I noticed fewer stress spikes within weeks. The method gave me a practical framework to regulate my system and lead with more clarity.",
    name: "Maxin Will",
    role: "Product Manager",
    rating: 5,
    avatar: "MW",
    outcome: "Calmer baseline in 4 weeks",
  },
  {
    text: "The sessions felt both precise and human. Better sleep, less cognitive noise, and a sustained sense of calm became my new baseline.",
    name: "Alina Rose",
    role: "Founder",
    rating: 5,
    avatar: "AR",
    outcome: "Improved sleep and focus",
  },
  {
    text: "This is the first wellness approach that felt measurable. My team noticed the difference in how I communicate and make decisions.",
    name: "Daniel Cho",
    role: "Head of Operations",
    rating: 5,
    avatar: "DC",
    outcome: "Higher leadership composure",
  },
];

/* ─── Sub-Components ─────────────────────────────────────────────────────── */

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon key={index} filled={index < stars} />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({
  text,
  name,
  role,
  rating,
  avatar,
  outcome,
}: (typeof TESTIMONIALS)[0]) {
  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
      <div className="p-8 md:p-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <QuoteIcon />
          <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-[#475569] transition-colors group-hover:bg-[#EEF2FF] group-hover:text-[#6366F1]">
            {outcome}
          </span>
        </div>
        
        <StarRating stars={rating} />
        
        <blockquote className="mt-5 text-[16px] leading-[1.75] text-[#334155]">
          "{text}"
        </blockquote>
      </div>

      <div className="mt-auto border-t border-[#F1F5F9] bg-[#FAFBFF] px-8 py-6 transition-colors group-hover:bg-white md:px-10">
        <div className="flex items-center gap-4">
          {/* Avatar Base */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-[14px] font-medium tracking-wide text-white shadow-sm">
            {avatar}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#0F172A]">{name}</p>
            <p className="text-[14px] text-[#64748B]">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function Testimonials() {
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
    <section className="w-full bg-white py-16 md:py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-[1200px] px-6 md:px-12"
      >
        {/* Header Section */}
        <div className="mb-16 flex flex-col items-center text-center md:mb-16">
          <motion.div variants={itemVariants} className="mb-5">

          </motion.div>

          <motion.h2 
            variants={itemVariants} 
            className="mb-6 max-w-[700px] text-[32px] font-semibold leading-[1.15] tracking-tight text-[#0F172A] md:text-[42px]"
          >
            Client Experiences
          </motion.h2>

          <motion.p 
            variants={itemVariants} 
            className="max-w-[600px] text-[17px] leading-[1.7] text-[#475569]"
          >
            98% of Clients Experience Meaningful Transformation • 7,400+ Clients Worldwide • Working at the root to create lasting change.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div key={testimonial.name} variants={itemVariants} className="h-full">
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}