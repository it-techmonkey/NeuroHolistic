"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { FeaturedRetreatData } from "./retreats/types";

interface FeaturedRetreatProps {
  retreat: FeaturedRetreatData;
}

export default function FeaturedRetreat({ retreat }: FeaturedRetreatProps) {
  const detailsHref = retreat.slug
    ? `/retreats/${retreat.slug}`
    : `/retreats?id=${retreat.id}`;

  return (
    <div className="relative w-full py-24 md:py-32 border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Left Column: Cinematic Imagery (Spans 7) ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="group relative aspect-[16/10] w-full overflow-hidden bg-[#F8FAFC]">
              <Image
                src={retreat.image}
                alt={retreat.title}
                fill
                className="object-cover grayscale-[20%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
              {/* Internal Framing Line */}
              <div className="pointer-events-none absolute inset-4 border border-white/20" />
            </div>
          </motion.div>

          {/* ── Right Column: Editorial Context (Spans 5) ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
          >

            <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[48px]">
              {retreat.title.split(' ').slice(0, -1).join(' ')} <br/>
              <span className="italic text-[#64748B] font-normal">{retreat.title.split(' ').pop()}</span>
            </h2>

            <p className="mb-12 text-[17px] leading-[1.8] text-[#475569]">
              {retreat.description}
            </p>

            {/* Registry Details (Replaces Icons) */}
            <div className="mb-12 space-y-6 border-t border-[#F1F5F9] pt-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Timeline</span>
                  <span className="text-[15px] font-medium text-[#0F172A]">{retreat.date}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Duration</span>
                  <span className="text-[15px] font-medium text-[#0F172A]">{retreat.duration}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Capacity</span>
                  <span className="text-[15px] font-medium text-[#0F172A]">{retreat.capacity} Participants</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Status</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1]">Registration Open</span>
                </div>
              </div>
            </div>

            {/* Actions: Sharp Rectangles */}
            <div className="flex flex-wrap items-center gap-6">
              <Link 
                href={detailsHref}
                className="inline-flex h-14 items-center justify-center bg-[#0F172A] px-10 text-[13px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1E293B]"
              >
                Register
              </Link>
              <Link
                href={detailsHref}
                className="group inline-flex items-center gap-2 border-b border-[#0F172A] pb-1 text-[13px] font-bold uppercase tracking-widest text-[#0F172A]"
              >
                View Details
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}