"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ─── Data ───────────────────────────────────────────────────────────────── */

type Member = {
  slug: string;
  name: string;
  title: string;
  image: string;
};

const FEATURED = {
  slug: "dr-fawzia-yassmina",
  name: "Dr. Fawzia Yassmina",
  title: "Founder & Creator of the NeuroHolistic Method™",
  image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1400&q=80",
};

const MEMBERS: Member[] = [
  {
    slug: "mariam-al-kaisi",
    name: "Mariam Al Kaisi",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1400&q=80",
  },
  {
    slug: "noura-youssef",
    name: "Noura Youssef",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1400&q=80",
  },
  {
    slug: "zekra-khayata",
    name: "Zekra Khayata",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=1400&q=80",
  },
  {
    slug: "reem-mobayed",
    name: "Reem Mobayed",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1400&q=80",
  },
  {
    slug: "fawares-azaar",
    name: "Fawares Azaar",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1400&q=80",
  },
  {
    slug: "joud-charafeddin",
    name: "Joud Charafeddin",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1400&q=80",
  },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function Team() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="w-full bg-[#FAFBFF] py-20 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 md:px-12">
        
        {/* ── Editorial Header ── */}
        <div className="mb-14 flex flex-col gap-8 border-b border-[#E2E8F0] pb-8 md:mb-20 md:flex-row md:items-end md:justify-between md:pb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-[600px]"
          >
            <span className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6366F1]">
              The Practitioners
            </span>
            <h2 className="text-[32px] font-light leading-[1.1] tracking-tight text-[#0F172A] sm:text-[36px] md:text-[48px]">
              Guided by <br className="hidden md:block" />
              <span className="italic text-[#64748B]">human expertise.</span>
            </h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-[400px] text-[16px] leading-[1.7] text-[#475569] md:text-right"
          >
            A collective of certified specialists bringing clinical precision and deep empathy to the NeuroHolistic Method™.
          </motion.p>
        </div>

        {/* ── Unboxed Gallery Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2"
        >
          {/* ── Featured Founder Portrait (Spans 1 Col, 2 Rows) ── */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1 lg:row-span-2">
            <Link href={`/team/${FEATURED.slug}`} className="group flex h-full flex-col">
              <div className="relative mb-6 flex-1 overflow-hidden bg-[#F1F5F9] min-h-[320px] sm:min-h-[400px] lg:min-h-[600px]">
                <img
                  src={FEATURED.image}
                  alt={FEATURED.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                  Lead Founder
                </span>
                <h3 className="mb-2 text-[22px] font-medium tracking-tight text-[#0F172A] sm:text-[26px]">
                  {FEATURED.name}
                </h3>
                <p className="mb-5 text-[15px] leading-[1.6] text-[#475569]">
                  {FEATURED.title}
                </p>
                <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-[#0F172A]">
                  Read Profile
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ── Practitioner Portraits ── */}
          {MEMBERS.map((member) => (
            <motion.div key={member.slug} variants={itemVariants} className="h-full">
              <Link href={`/team/${member.slug}`} className="group flex h-full flex-col">
                <div className="relative mb-5 aspect-[4/5] w-full overflow-hidden bg-[#F1F5F9]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-cover grayscale-[20%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[18px] font-medium text-[#0F172A] transition-colors group-hover:text-[#6366F1]">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-[14.5px] text-[#64748B]">
                    {member.title}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}