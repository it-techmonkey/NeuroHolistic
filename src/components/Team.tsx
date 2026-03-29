"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TEAM_PROFILES } from "./team/team-profiles";

export default function Team() {
  const founder = TEAM_PROFILES.find(member => member.slug === "fawzia-yassmina");
  const practitioners = TEAM_PROFILES.filter(member => member.slug !== "fawzia-yassmina");

  return (
    <section className="bg-[#FCFCFD] py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        
        {/* ── Header: Editorial Style ── */}
        <div className="max-w-[800px] mb-12">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[12px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4"
          >
            {/* The Collective */}
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[40px] md:text-[56px] font-light text-slate-900 leading-[1.1] tracking-tight"
          >
            {/* Practitioners of the <br/> */}
            <span className="font-semibold text-[#2B2F55]">The Team</span>
          </motion.h2>
        </div>

        {/* ── Founder Spotlight ── */}
        {founder && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Link 
              href={`/team/${founder.slug}`}
              className="group relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12 bg-white p-6 md:p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-700"
            >
              {/* Image Container - Left Side */}
              <div className="w-full lg:w-5/12 aspect-[4/5] relative overflow-hidden rounded-[24px] bg-slate-50">
                <Image
                  src="/images/team/Fawzia Yassmina Landing.jpeg"
                  alt={founder.name}
                  fill
                  className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#2B2F55]/5 group-hover:bg-transparent transition-colors duration-700" />
              </div>

              {/* Text Content - Right Side */}
              <div className="w-full lg:w-7/12 flex flex-col items-start pr-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-[#2B2F55] mb-4">
                  Founder   
                </span>
                <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                  {founder.name}
                </h3>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light mb-8 italic">
                  "{founder.shortBio}"
                </p>
                <div className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.2em] text-[#2B2F55]">
                  <span>View Profile</span>
                  <div className="h-[1px] w-8 bg-[#2B2F55]/30 group-hover:w-16 group-hover:bg-[#2B2F55] transition-all" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── Practitioners Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {practitioners.map((member, i) => (
            <motion.div
              key={member.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
            >
              <Link href={`/team/${member.slug}`} className="group block">
                {/* Image Wrap */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-[#FCFCFD] mb-8 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-slate-200">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale-[0.3] contrast-[1.1] transition-all duration-1000 group-hover:grayscale-0 scale-105 group-hover:scale-110"
                  />
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div className="px-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                    Practitioner
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#2B2F55] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-slate-500 font-light line-clamp-2 mb-6">
                    {member.shortBio}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-[#2B2F55] transition-all">
                    <span>View Profile</span>
                    <div className="h-[1px] w-6 bg-slate-200 group-hover:bg-[#2B2F55] group-hover:w-10 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}