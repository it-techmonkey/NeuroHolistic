"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { publicImageSrc } from "@/lib/public-image";
import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function AboutPage() {
  const { t, isArabic } = useLang();

  const JOURNEY = useMemo(
    () =>
      [
        {
          title: t.about.theBeginning,
          description: [...t.about.evolutionJourney1],
          image: "/images/team/Fawzia Yassmina.png",
          isFullWidth: true,
        },
        {
          title: t.about.yearsOfExploration,
          description: [...t.about.evolutionJourney2],
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80",
        },
        {
          title: t.about.structuringMethod,
          description: [...t.about.evolutionJourney3],
          image: "/images/pages/dna.jpeg",
        },
      ] as { title: string; description: string[]; image: string; isFullWidth?: boolean }[],
    [t],
  );

  return (
    <div className="w-full bg-white">
      <PageHero
        eyebrow={t.pageHero.aboutUs}
        title={
          <>
            <span className="text-white font-normal">
              {t.about.evolutionHeroTitle}
              <br />
            </span>
          </>
        }
        description={t.about.evolutionHeroSubtitle}
        imageSrc="/images/pages/about.jpg"
        imageAlt="Premium wellbeing consultation environment"
        metaTags={[...t.about.evolutionMetaTags]}
      />

      {/* ── Section 01: The Chronology (Editorial Spreads) ── */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 space-y-20 md:space-y-32">
          {JOURNEY.map((block, i) => (
            <div key={block.title}>
              {block.isFullWidth ? (
                /* Full Width: Centered Text Only */
                <div className="text-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8 text-[36px] font-light leading-[1.4] tracking-tight text-[#0F172A] md:text-[52px]"
                  >
                    {block.title}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mx-auto max-w-[700px] space-y-6"
                  >
                    {block.description.map((p, idx) => (
                      <p key={idx} className={`text-[17px] ${isArabic ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>{p}</p>
                    ))}
                  </motion.div>
                </div>
              ) : (
                /* Side by Side Layout */
                <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
                  {/* Text Column */}
                  <motion.div 
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}
                  >
                    <h2 className="mb-8 text-[36px] font-light leading-[1.4] tracking-tight text-[#0F172A] md:text-[52px]">
                      {block.title}
                    </h2>
                    <div className="space-y-6 border-l border-[#E2E8F0] pl-8">
                      {block.description.map((p, idx) => (
                        <p key={idx} className={`text-[17px] ${isArabic ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>{p}</p>
                      ))}
                    </div>
                  </motion.div>

                  {/* Image Column */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-1" : ""}`}
                  >
                    <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
                      <div className="relative aspect-[16/11] w-full overflow-hidden transition-all duration-1000 bg-white">
                        <Image
                          src={block.image}
                          alt={block.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 02: Institute Functions (Registry Matrix) ── */}
      <section className="bg-[#FAFBFF] py-24 md:py-32 border-y border-[#E2E8F0]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-[34px] font-light tracking-tight text-[#0F172A] md:text-[48px]">{t.about.birthOfInstitute}</h2>
            </div>
            <div className={`flex flex-col justify-center space-y-6 text-[17px] ${isArabic ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>
              <p>{t.about.instituteGrowthParagraph}</p>
              <p>{t.about.todayFunctions}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#E2E8F0]">
            {[
              t.about.function1,
              t.about.function2,
              t.about.function3,
            ].map((text, i) => (
              <div key={i} className="group flex flex-col justify-between border-b border-[#E2E8F0] p-10 transition-colors hover:bg-white md:border-l last:md:border-l-0">
                <span className="mb-8 font-mono text-[12px] text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors">[ 0{i+1} ]</span>
                <p className="text-[17px] font-medium text-[#0F172A] leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ── Section 03: Founder (Editorial Spread) ── */}
<section className="py-24 md:py-32 lg:py-40 bg-white">
  <div className="mx-auto max-w-[1280px] px-6 md:px-12">
    <div className="mb-16 md:mb-24">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[34px] font-light text-[#0F172A] md:text-[52px] leading-tight"
      >
        {t.about.founderName}
      </motion.h2>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      
      {/* Left Column (Image) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        className="lg:col-span-6 lg:sticky lg:top-32"
      >
        <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9] rounded-xl">
          <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg bg-white">
            <Image 
              src={publicImageSrc("/images/team/Fawzia Yassmina.png")} 
              alt={t.about.founderName} 
              fill 
              unoptimized 
              className="object-cover object-top scale-125 transition-transform duration-700 group-hover:scale-110" 
            />
          </div>
        </div>
      </motion.div>
      
      {/* Right Column (Content) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        className="lg:col-span-6"
      >
        <div className={`text-[17px] ${isArabic ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569] space-y-12 lg:pt-4`}>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#0F172A]">
              {t.about.naturalState}
            </h3>
            <p>{t.about.naturalStateText}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">{t.about.naturalAccess}</h3>
            <p>{t.about.naturalAccessText}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">{t.about.learnOrRecycle}</h3>
            <p>{t.about.learnOrRecycleText1}</p>
            <p>{t.about.learnOrRecycleText2}</p>
            <p>{t.about.learnOrRecycleText3}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">{t.about.matterOfChoice}</h3>
            <p>{t.about.matterOfChoiceText1}</p>
            <p>{t.about.matterOfChoiceText2}</p>
            <p>{t.about.matterOfChoiceText3}</p>
          </div>

        </div>
      </motion.div>
    </div>
  </div>
</section>

      {/* ── Section 04: Vision for the Future ── */}
      <section className="bg-gradient-to-b from-[#FAFBFF] to-[#F1F5F9] py-24 md:py-32 border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-[34px] font-light tracking-tight text-[#0F172A] md:text-[48px]"
          >
            {t.about.visionForFuture}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              t.about.visionParagraph1,
              t.about.visionParagraph2,
              t.about.visionParagraph3,
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.8 }}
                className="group rounded-[20px] border border-[#E2E8F0] bg-white p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 hover:border-[#CBD5E1] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              >
                <span className="mb-8 block font-mono text-[12px] text-[#6366F1]/50 group-hover:text-[#6366F1] transition-colors">
                  0{i + 1}
                </span>
                <p className={`text-[16px] ${isArabic ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
