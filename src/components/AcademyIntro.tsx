import Image from "next/image";
import Section from "@/components/ui/Section";
import { H2, Body } from "@/components/ui/Typography";

export default function AcademyIntro() {
  return (
    <Section padding="xl" background="white">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <H2 className="text-neutral-900 mb-6">
            The First Generation of NeuroHolistic Practitioners
          </H2>
          <Body className="text-neutral-600 mb-6">
            The NeuroHolistic Academy exists to train practitioners who integrate
            neuroscience, psychology, and systemic human development into a
            coherent framework for applied practice. Our vision is to develop
            professionals who can support deep, lasting transformation in
            others while maintaining rigorous ethical and professional
            standards.
          </Body>
          <Body className="text-neutral-600">
            Practitioners trained through the academy are among the first
            professionals applying this integrative framework in practice—working
            in applied psychology, emotional regulation, and wellbeing contexts
            with a method grounded in science and human systems thinking.
          </Body>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-neutral-100 aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
          <Image
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
            alt="Therapy or training session"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </Section>
  );
}
