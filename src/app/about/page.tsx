"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function AboutPage() {
  const { t, isUrdu } = useLang();

  const JOURNEY = useMemo(() => [
    {
      title: t.about.theBeginning,
      description: isUrdu
        ? [
            "ڈاکٹر فوزیہ یاسمینا نے بیس سال سے زیادہ وقت پہلے پیچیدہ جذباتی اور نفسیاتی چیلنجز کا سامنا کرنے والے افراد کے ساتھ قریب سے کام کرنا شروع کیا۔ ہزاروں گھنٹوں کی مشاہدے کے ذریعے، انسانی ادراک اور تبدیلی کے گہرے نمونے ظاہر ہونے لگے۔",
            "ان ابتدائی تجربات نے اس کی بنیاد رکھی جو آخرکار نیوروحولسٹک طریقہ™ بن گیا۔",
          ]
        : [
            "More than twenty years ago, Dr. Fawzia Yassmina began working closely with individuals facing complex emotional and psychological challenges. Through thousands of hours of observation, deeper patterns of human perception and transformation began to reveal themselves.",
            "These early experiences laid the foundation for what would eventually become the NeuroHolistic Method™.",
          ],
      image: "/images/team/Fawzia Yassmina.png",
      isFullWidth: true,
    },
    {
      title: t.about.yearsOfExploration,
      description: isUrdu
        ? [
            "جیسے جیسے کام گہرا ہوتا گیا، نیوروسائنس، نفسیات، اور نظامی شعور سے ملنے والی بصیرتیں ایک دوسرے سے ملنے لگیں۔ یہ واضح ہو گیا کہ مستقل تبدیلی کو صرف ایک ہی شعبے کے ذریعے نہیں سمجھا جا سکتا۔",
            "برسوں کی جواکشی کے ذریعے، مختلف پس منظر اور زندگی کے حالات میں تبدیلی کے بار بار آنے والے طریقے نظر آنے لگے۔",
          ]
        : [
            "As the work deepened, insights from neuroscience, psychology, and systemic awareness began to converge. It became clear that lasting transformation could not be understood through a single discipline alone.",
            "Through years of refinement, recurring mechanisms of change became visible across diverse backgrounds and life situations.",
          ],
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80",
    },
    {
      title: t.about.structuringMethod,
      description: isUrdu
        ? [
            "وقت کے ساتھ، ان بصیرتوں کو ایک ہم آہنگ فریم ورک میں منظم کیا گیا۔ عمل کے ذریعے جو کچھ سامنے آیا اسے تبدیلی کی ایک منظم ماڈل میں بیان کیا گیا۔",
            "اس سے نیوروحولسٹک طریقہ™ کا پانچ مرحلوں کا ڈھانچہ سامنے آیا، جو انسانی تبدیلی کو سہارا دینے کا ایک منظم طریقہ فراہم کرتا ہے۔",
          ]
        : [
            "Over time, these insights were organized into a coherent framework. What emerged through practice was articulated into a structured model of transformation.",
            "This led to the five-phase architecture of the NeuroHolistic Method™, providing a systematic way to facilitate human change.",
          ],
      image: "/images/pages/dna.jpeg",
    },
  ] as { title: string; description: string[]; image: string; isFullWidth?: boolean }[], [t, isUrdu]);

  return (
    <div className="w-full bg-white">
      <PageHero
        eyebrow={t.pageHero.aboutUs}
        title={
          <>
            <span className="text-white font-normal">{isUrdu ? 'نیوروحولسٹک طریقہ™ کا ارتقاء' : 'The Evolution of the NeuroHolistic Method™'}<br /></span>
          </>
        }
        description={isUrdu ? 'حقیقی تبدیلی کیسے ہوتی ہے اس کی نئی تعریف' : 'A new definition of how true transformation happens'}
        imageSrc="/images/pages/about.jpg"
        imageAlt="Premium wellbeing consultation environment"
        metaTags={isUrdu ? ["20+ سال", "عملی تجربہ", "بین الفروعی"] : ["20+ Years", "Practical Experience", "Cross-Disciplinary"]}
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
                      <p key={idx} className={`text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>{p}</p>
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
                    <div className={`space-y-6 ${isUrdu ? 'border-r' : 'border-l'} border-[#E2E8F0] ${isUrdu ? 'pr-8' : 'pl-8'}`}>
                      {block.description.map((p, idx) => (
                        <p key={idx} className={`text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>{p}</p>
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
            <div className={`flex flex-col justify-center space-y-6 text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>
              <p>{isUrdu
                ? "جیسے جیسے اس کام میں دلچسپی بڑھتی گئی، طریقہ کی مسلسل ترقی اور ذمہ دارانہ اشاعت کی حمایت کے لیے نیوروحولسٹک انسٹی ٹیوٹ قائم کیا گیا۔"
                : "As interest in the work continued to grow, the NeuroHolistic Institute was established to support the continued development and responsible dissemination of the method."
              }</p>
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
              src="/images/team/Fawzia Yassmina.png" 
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
        <div className={`text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569] space-y-12 lg:pt-4`}>
          
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
                <p className={`text-[16px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>
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
