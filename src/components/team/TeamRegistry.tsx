"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TEAM_PROFILES } from "./team-profiles";

export default function TeamRegistry() {
  return (
    <section className="bg-white py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* ── Editorial Header ── */}
        <div className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-4"
          >
            <div className="h-px w-8 bg-[#E2E8F0]" />
            <span className="font-mono text-[11px] tracking-[0.4em] text-[#94A3B8] uppercase">
              Faculty // Registry
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[34px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]"
          >
            Practitioners of the <span className="italic text-[#64748B] font-normal">Method.</span>
          </motion.h2>
        </div>

        {/* ── The Registry Matrix ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-[#E2E8F0]">
          {TEAM_PROFILES.map((member, i) => (
            <Link 
              key={member.slug} 
              href={`/team/${member.slug}`}
              className={`group flex flex-col p-8 md:p-12 border-b border-[#E2E8F0] ${
                (i + 1) % 3 !== 0 ? "lg:border-r" : ""
              } ${(i + 1) % 2 !== 0 ? "md:border-r lg:border-r" : "md:border-r-0 lg:border-r"} transition-colors hover:bg-[#FAFBFF]`}
            >
              {/* Framed Portrait */}
              <div className="relative mb-10 aspect-[4/5] w-full overflow-hidden bg-slate-100 grayscale-[40%] transition-all duration-700 group-hover:grayscale-0">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 border border-white/10" />
              </div>

              {/* Metadata */}
              <div className="flex flex-col flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#CBD5E1]">
                    [ 0{i + 1} ]
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">
                    {member.slug === "dr-fawzia-yassmina" ? "Founder" : "Practitioner"}
                  </span>
                </div>

                <h3 className="mb-2 text-[22px] font-semibold tracking-tight text-[#0F172A]">
                  {member.name}
                </h3>
                
                <p className="text-[14px] leading-relaxed text-[#64748B] line-clamp-2">
                  {member.shortBio}
                </p>

                <div className="mt-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">
                  <span className="border-b border-transparent pb-0.5 transition-all group-hover:border-[#0F172A]">
                    View Profile
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}