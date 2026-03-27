'use client';

import Section from '@/components/ui/Section';
import BookNowButton from '@/components/booking/BookNowButton';

const PROGRAMS = [
  {
    icon: '●',
    title: 'Private Program',
    description:
      'The Private Program offers a personalized journey through the NeuroHolistic Method™. Working one-on-one allows the process to be fully adapted to your unique history, patterns, and goals.',
    descriptionSecondary:
      'Sessions are structured to support your pace and needs, with ongoing integration between meetings and dedicated support throughout your transformation.',
    suitedTitle: 'Ideal for you if you:',
    suitedBullets: [
      'Prefer a private and personalized setting',
      'Are navigating significant life challenges or transitions',
      'Seek deeper individual guidance and support',
      'Want to move through transformation at your own pace',
    ],
  },
  {
    icon: '◉',
    title: 'Group Program',
    description:
      'The Group Program offers the opportunity to experience the NeuroHolistic Method™ within a guided group setting. Participants move through the transformational process together in a supportive environment.',
    descriptionSecondary:
      'Shared learning, collective energy, and mutual understanding enrich the journey as participants witness and support one another through each transformation phase.',
    suitedTitle: 'Ideal for you if you:',
    suitedBullets: [
      'Feel comfortable exploring personal growth in a group setting',
      'Value shared learning and collective experience',
      'Wish to engage in the NeuroHolistic journey alongside others',
      'Are ready to commit to a structured transformational process',
    ],
  },
];

function ProgramCard(props: (typeof PROGRAMS)[0]) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-8 md:p-10 transition-all duration-500 hover:border-[#D1D5DB] hover:shadow-xl hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white flex items-center justify-center text-2xl shadow-md">
            {props.icon}
          </div>
          <h3 className="text-[#0B1028] text-[24px] md:text-[26px] font-bold leading-tight self-center">
            {props.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-[#475569] mb-5 text-[16px] leading-[1.7]">{props.description}</p>
        {props.descriptionSecondary && (
          <p className="text-[#64748B] mb-8 text-[15px] leading-[1.6]">{props.descriptionSecondary}</p>
        )}

        {/* Suited for */}
        <div className="mb-8 rounded-xl bg-gradient-to-br from-[#F0F4FF] to-[#F5F7FF] border border-[#E0E7FF] p-6">
          <p className="font-semibold text-[#0B1028] mb-4 text-[15px]">{props.suitedTitle}</p>
          <ul className="space-y-2.5">
            {props.suitedBullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 items-start">
                <span className="text-[#6366F1] mt-1 flex-shrink-0 font-bold">▸</span>
                <span className="text-[#475569] text-[14px] leading-[1.6]">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex">
          <BookNowButton className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-[#2B2F55] text-[#2B2F55] font-semibold text-[14px] hover:bg-[#2B2F55] hover:text-white transition-all duration-200">
            Book Consultation
          </BookNowButton>
        </div>
      </div>
    </div>
  );
}

export default function ProgramsSection() {
  return (
    <Section padding="lg" background="white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[32px] md:text-[42px] font-medium leading-[1.2] text-[#0B1028] mb-4">
            Choose Your Transformation Path
          </h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] max-w-[600px] mx-auto leading-[1.7]">
            Both programs deliver the full depth of the NeuroHolistic Method™, tailored to your
            personal needs and learning style.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.title} {...program} />
          ))}
        </div>
      </div>
    </Section>
  );
}
