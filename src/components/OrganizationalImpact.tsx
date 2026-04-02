"use client";

import { motion } from "framer-motion";

const IMPACTS = [
  {
    title: "Focus and Cognitive Performance",
    description:
      "Clearer thinking, better decision-making, and improved problem-solving capacity.",
  },
  {
    title: "Productivity and Work Efficiency",
    description:
      "Reduced cognitive overload and greater mental clarity during demanding work cycles.",
  },
  {
    title: "Employee Retention and Loyalty",
    description:
      "Strengthening psychological safety and long-term engagement.",
  },
  {
    title: "Team Collaboration and Communication",
    description:
      "Improved emotional awareness and healthier relational dynamics.",
  },
  {
    title: "Resilience in High-Pressure Environments",
    description:
      "Helping individuals maintain stability and performance during periods of change.",
  },
  {
    title: "Absenteeism and Burnout Reduction",
    description: "Supporting nervous system regulation and recovery from chronic stress patterns."
  }
];

export default function OrganizationalImpact() {
  return (
    <section className="bg-[#0F172A] py-16 md:py-20 lg:py-24 border-t border-white/5">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* ── Editorial Header ── */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-8 flex items-center gap-4"
            >

            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[34px] font-light leading-[1.1] tracking-tight text-white md:text-[52px]"
            >
              Measurable Impact Across <br />
              <span className="italic text-slate-400 font-normal">The Organization</span>
            </motion.h2>
          </div>
          
          <div className="lg:col-span-5 flex items-end">
          </div>
        </div>

        {/* ── The Impact Matrix ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-white/10">
          {IMPACTS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={`group flex flex-col p-8 md:p-10 border-b border-white/10 ${
                (i + 1) % 3 !== 0 ? "lg:border-r" : ""
              } ${
                (i + 1) % 2 !== 0 ? "md:border-r lg:border-r" : "md:border-r-0 lg:border-r"
              } lg:last:border-r-0 transition-colors hover:bg-white/[0.02]`}
            >
              {/* Monospaced Registry Number */}
              <div className="mb-12">
                <span className="font-mono text-[12px] text-white/20 group-hover:text-[#8B8BFF] transition-colors">
                  [ 0{i + 1} ]
                </span>
              </div>

              <h3 className="mb-4 text-[20px] font-semibold tracking-tight text-white leading-snug">
                {item.title}
              </h3>
              
              <p className="text-[15px] leading-[1.7] text-slate-400">
                {item.description}
              </p>

              {/* Minimal Accent */}
              <div className="mt-auto pt-10">
                <div className="h-px w-6 bg-white/10 transition-all group-hover:w-full group-hover:bg-[#8B8BFF]" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}