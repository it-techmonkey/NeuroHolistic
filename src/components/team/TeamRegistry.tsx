"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TEAM_PROFILES } from "./team-profiles";

export default function TeamRegistry() {
  const founder = TEAM_PROFILES.find(member => member.slug === "dr-fawzia-yassmina");
  const practitioners = TEAM_PROFILES.filter(member => member.slug !== "dr-fawzia-yassmina");

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
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
            Practitioners of the <span className="italic text-[#64748B] font-normal">Team</span>
          </motion.h2>
        </div>

        {/* ── Founder Section ── */}
        {founder && (
          <div className="mb-24 border-t border-[#E2E8F0] pt-16">
            <Link 
              href={`/team/${founder.slug}`}
              className="group flex flex-col md:flex-row items-start gap-12 transition-colors hover:opacity-90"
            >
              {/* Founder Portrait - Larger */}
              <div className="w-full md:w-2/5">
                <div className="relative mb-6 aspect-[4/5] w-full overflow-hidden bg-slate-100 transition-all duration-700">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 border border-white/10" />
                </div>
              </div>

              {/* Founder Details */}
              <div className="flex flex-col flex-1 md:pt-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1] mb-4">
                  Founder
                </span>
                
                <h3 className="mb-4 text-[32px] font-semibold tracking-tight text-[#0F172A]">
                  {founder.name}
                </h3>
                
                <p className="text-[15px] leading-relaxed text-[#64748B] mb-8">
                  {founder.shortBio}
                </p>

                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">
                  <span className="border-b border-transparent pb-0.5 transition-all group-hover:border-[#0F172A]">
                    View Full Profile
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Practitioners Grid (3x3) ── */}
        <div className="border-t border-[#E2E8F0]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {practitioners.map((member, i) => (
              <Link 
                key={member.slug} 
                href={`/team/${member.slug}`}
                className="group flex flex-col p-8 md:p-10 border-b border-[#E2E8F0] md:border-r md:border-b transition-colors hover:bg-[#FAFBFF]"
              >
                {/* Framed Portrait */}
                <div className="relative mb-8 aspect-[4/5] w-full overflow-hidden bg-slate-100 transition-all duration-700">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    unoptimized
                    className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${
                      member.slug === 'zekra-khayata' ? 'object-[center_22%]' : 'object-center'
                    }`}
                  />
                  <div className="absolute inset-0 border border-white/10" />
                </div>

                {/* Metadata */}
                <div className="flex flex-col flex-1">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#CBD5E1]">
                      [ 0{i + 2} ]
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">
                      Practitioner
                    </span>
                  </div>

                  <h3 className="mb-2 text-[20px] font-semibold tracking-tight text-[#0F172A]">
                    {member.name}
                  </h3>
                  
                  <p className="text-[14px] leading-relaxed text-[#64748B] line-clamp-2">
                    {member.shortBio}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">
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
      </div>
    </section>
  );
}