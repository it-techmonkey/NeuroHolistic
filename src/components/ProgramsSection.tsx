'use client';

import Section from '@/components/ui/Section';
import { User, Users } from 'lucide-react';
import Link from 'next/link';
import { useLang } from '@/lib/translations/LanguageContext';

function ProgramCard({ icon, title, type, description, descriptionSecondary, suitedBullets, idealFor, bookConsultation }: {
  icon: React.ReactNode;
  title: string;
  type: 'private' | 'group';
  description: string;
  descriptionSecondary: string;
  suitedBullets: string[];
  idealFor: string;
  bookConsultation: string;
}) {
  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center transition-colors group-hover:bg-[#6366F1] group-hover:text-white">
            {icon}
          </div>
          <h3 className="text-[#0F172A] text-[22px] font-semibold tracking-tight">
            {title}
          </h3>
        </div>

        {/* Description */}
        <div className="flex-grow">
          <p className="text-[#475569] mb-4 text-[16px] leading-[1.7]">
            {description}
          </p>
          {descriptionSecondary && (
            <p className="text-[#64748B] mb-8 text-[14px] leading-[1.6]">
              {descriptionSecondary}
            </p>
          )}
        </div>

        {/* Suited for */}
        <div className="mb-8 rounded-[16px] bg-[#FAFBFF] border border-[#F1F5F9] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8] mb-4">
            {idealFor}
          </p>
          <ul className="space-y-2.5">
            {suitedBullets.map((bullet) => (
              <li key={bullet} className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-1.5 shrink-0" />
                <span className="text-[#475569] text-[14px] leading-[1.5]">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Link
            href={`/booking/paid-program-booking?type=${type}`}
            className="w-full inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0F172A] text-white font-medium text-[14.5px] transition-all duration-300 hover:bg-[#1E293B] hover:shadow-[0_8px_20px_rgba(15,23,42,0.15)]"
          >
            {bookConsultation}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProgramsSection() {
  const { t } = useLang();
  const ps = t.programsSection;
  const p = t.programs;

  const PROGRAMS = [
    {
      icon: <User className="w-6 h-6" />,
      title: p.privateProgram,
      type: 'private' as const,
      description: p.privateDescription,
      descriptionSecondary: ps.privateDescription2,
      suitedBullets: [...ps.privateBullets],
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: p.groupProgram,
      type: 'group' as const,
      description: p.groupDescription,
      descriptionSecondary: ps.groupDescription2,
      suitedBullets: [...ps.groupBullets],
    },
  ];

  return (
    <Section padding="lg" className="bg-white">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="max-w-[700px] mb-16">
          <h2 className="text-[36px] md:text-[46px] font-light leading-[1.1] text-[#0F172A] tracking-tight">
            {ps.heading} <span className="font-semibold">{ps.headingBold}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.title} {...program} idealFor={ps.idealFor} bookConsultation={ps.bookConsultation} />
          ))}
        </div>
      </div>
    </Section>
  );
}