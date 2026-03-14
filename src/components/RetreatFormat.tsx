import Image from "next/image";
import Section from "@/components/ui/Section";
import { H2, Body, BodySmall } from "@/components/ui/Typography";

const BULLETS = [
  "Guided sessions exploring the NeuroHolistic Method",
  "Group integration circles",
  "Individual reflection time",
  "Nature-based restoration practices",
];

export default function RetreatFormat() {
  return (
    <Section padding="xl" background="white">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <H2 className="text-neutral-900 mb-6">
            How the Retreat Experience Works
          </H2>
          <Body className="text-neutral-600 mb-8">
            Our retreats are designed as immersive containers where you step away
            from daily life and engage deeply in the transformational process.
            Each retreat combines structured sessions with space for integration,
            reflection, and connection—both within yourself and with the group.
          </Body>
          <ul className="space-y-3">
            {BULLETS.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-primary-500 flex-shrink-0 mt-0.5" aria-hidden>
                  •
                </span>
                <BodySmall className="text-neutral-700">{item}</BodySmall>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-neutral-100 aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
          <Image
            src="https://images.unsplash.com/photo-1470240731273-7821a6e5206f?w=800&q=80"
            alt="Retreat lifestyle - nature and restoration"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </Section>
  );
}
