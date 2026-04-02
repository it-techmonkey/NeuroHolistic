"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLang } from "@/lib/translations/LanguageContext";

export default function AcademyIntro() {
  const { t, isUrdu } = useLang();

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* Centered Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 max-w-[800px] mx-auto"
        >
          <h2 className="text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
            {t.academyIntro.heading1} <br/>
            <span className="italic text-slate-500 font-normal">{t.academyIntro.heading2}</span>
          </h2>
        </motion.div>

        {/* Full-Bleed Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[1100px] mb-12"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[8px] bg-[#F8FAFC]">
            <Image
              src="/images/team/team.png"
              alt="Academy Training Session"
              fill
              unoptimized
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 80vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F172A]/10 via-transparent to-transparent" />
          </div>
        </motion.div>

        {/* Centered Description Below Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mx-auto max-w-[700px] text-center"
        >
          <p className={`text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-slate-600 md:text-[18px] mb-6`}>
            {t.academyIntro.mainDescription}
          </p>

          <div className="mx-auto h-px w-12 bg-slate-200 mb-6" />

          <div className={`space-y-4 text-[16px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-slate-500`}>
            <p>{t.academyIntro.paragraph1}</p>
            <p>{t.academyIntro.paragraph2}</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
