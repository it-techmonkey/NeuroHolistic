'use client';

import Section from '@/components/ui/Section';
import { User, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const PROGRAMS = [
  {
    icon: <User className="w-6 h-6" />,
    title: 'Private Program',
    type: 'private' as const,
    description:
      'The Private Program offers a personalized journey through the NeuroHolistic Method™. Working one-on-one allows the process to be fully adapted to your unique history, patterns, and goals.',
    descriptionSecondary:
      'Sessions are structured to support your pace and needs, with ongoing integration between meetings and dedicated support.',
    suitedTitle: 'Ideal for you if you:',
    suitedBullets: [
      'Prefer a private and personalized setting',
      'Are navigating significant life challenges',
      'Seek deeper individual guidance',
      'Want to move at your own pace',
    ],
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Group Program',
    type: 'group' as const,
    description:
      'The Group Program offers the opportunity to experience the NeuroHolistic Method™ within a guided group setting. Participants move through the transformational process together.',
    descriptionSecondary:
      'Shared learning and collective energy enrich the journey as participants witness and support one another.',
    suitedTitle: 'Ideal for you if you:',
    suitedBullets: [
      'Feel comfortable in a group setting',
      'Value shared learning and collective experience',
      'Wish to engage alongside others',
      'Are ready for a structured group process',
    ],
  },
];

function ProgramCard(props: (typeof PROGRAMS)[0]) {
  return (
    /* 1. Added 'h-full' and 'flex flex-col' to the card.
       2. Grid parent will ensure both cards are the same height.
    */
    <div className="group relative flex flex-col h-full overflow-hidden rounded-[32px] border border-slate-100 bg-white p-8 md:p-12 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50">
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-5">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#F2F7F4] text-[#2D5A43] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {props.icon}
          </div>
          <h3 className="text-slate-900 text-2xl font-bold tracking-tight">
            {props.title}
          </h3>
        </div>

        {/* Description - The 'flex-grow' here pushes the suited-for box down */}
        <div className="flex-grow">
          <p className="text-slate-600 mb-4 text-[16px] leading-[1.7] font-medium">
            {props.description}
          </p>
          {props.descriptionSecondary && (
            <p className="text-slate-400 mb-8 text-[14px] leading-[1.6]">
              {props.descriptionSecondary}
            </p>
          )}
        </div>

        {/* Suited for - This will now start at the same vertical position if flex-grow is used correctly above */}
        <div className="mb-10 rounded-[24px] bg-[#F9FBF9] border border-slate-50 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
            {props.suitedTitle}
          </p>
          <ul className="space-y-3">
            {props.suitedBullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 items-start">
                <ChevronRight className="w-3.5 h-3.5 text-[#2D5A43] mt-0.5 shrink-0" />
                <span className="text-slate-600 text-[13px] font-medium leading-[1.5]">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA - mt-auto ensures this stays at the absolute bottom */}
        <div className="mt-auto">
          <Link
            href={`/booking/paid-program-booking?type=${props.type}`}
            className="w-full inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#2D5A43] text-white font-bold text-[13px] uppercase tracking-widest shadow-lg shadow-[#2D5A43]/10 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProgramsSection() {
  return (
    <Section padding="lg" className="bg-[#F9FBF9] font-sans antialiased">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-[700px] mb-16">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">
            Transformation Paths
          </p>
          <h2 className="text-[40px] md:text-[52px] font-bold leading-[1.1] text-slate-900 tracking-tight">
            Choose Your <br/>
            <span className="text-[#2D5A43]">Growth Protocol.</span>
          </h2>
        </div>

        {/* Grid 'items-stretch' (default) ensures cards are same height.
        */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.title} {...program} />
          ))}
        </div>
      </div>
    </Section>
  );
}