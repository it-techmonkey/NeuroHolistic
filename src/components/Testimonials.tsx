"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    text: "I noticed fewer stress spikes within weeks. The method gave me a practical framework to regulate my system and lead with more clarity.",
    name: "Maxin Will",
    role: "Product Manager",
    rating: 4,
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
    rating: 4,
    avatar: "DC",
    outcome: "Higher leadership composure",
  },
];

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-[#2B2F55]">
        {Array.from({ length: 5 }).map((_, index) => (
          <svg
            key={index}
            className={`h-4 w-4 ${index < stars ? "fill-[#2B2F55]" : "fill-transparent"}`}
            viewBox="0 0 20 20"
            aria-hidden
          >
            <path
              d="M10 2.4l2.33 4.72 5.22.76-3.78 3.68.89 5.2L10 14.34 5.34 16.8l.89-5.2L2.45 7.88l5.22-.76L10 2.4z"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        ))}
      </div>
      <span className="text-[14px] font-medium text-[#2B2F55]">{stars}/5</span>
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
  index,
}: {
  text: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  outcome: string;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.08)] transition-all duration-300 hover:shadow-[0_20px_44px_rgba(17,24,39,0.12)]"
    >
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between gap-3">
          <StarRating stars={rating} />
          <span className="rounded-full bg-[#EEF0F6] px-3 py-1 text-[12px] font-medium text-[#2B2F55]">
            {outcome}
          </span>
        </div>
        <blockquote className="mt-5 text-[16px] leading-[1.75] text-[#374151]">
          {text}
        </blockquote>
      </div>

      <div className="border-t border-[#E8EBF2] px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2B2F55] text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(43,47,85,0.28)]">
            {avatar}
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#111827]">{name}</p>
            <p className="text-[14px] text-[#6B7280]">{role}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Testimonials() {
  return (
    <section className="w-full bg-[#F4F5F7] px-6 py-[120px]">
      <div className="mx-auto max-w-[1200px]" style={{ fontFamily: "Inter, Satoshi, -apple-system, sans-serif" }}>
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-[#8B8BFF]/35 md:w-20" />
          <p className="text-center text-[12px] uppercase tracking-[0.2em] text-[#8B8BFF]">Testimonials</p>
          <span className="h-px w-12 bg-[#8B8BFF]/35 md:w-20" />
        </div>

        <h2 className="mt-3 mb-5 text-center text-[34px] font-semibold text-[#111827] sm:text-[40px] lg:text-[48px]">
          Outcomes in Practice
        </h2>
        <p className="mx-auto mb-16 max-w-[620px] text-center text-[16px] leading-[1.7] text-[#6B7280]">
          Clinical precision with human warmth. These outcomes reflect sustained improvements in regulation, presence, and decision quality.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} {...testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
