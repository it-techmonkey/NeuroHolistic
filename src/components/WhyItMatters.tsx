import Image from "next/image";
import Section from "@/components/ui/Section";
import { H2, Body } from "@/components/ui/Typography";

export default function WhyItMatters() {
  return (
    <Section padding="xl" background="white">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <H2 className="text-neutral-900 mb-6">Why It Matters</H2>
          <Body className="text-neutral-600 mb-6">
            Modern organizations face growing challenges: stress, burnout,
            cognitive overload, and reduced engagement. These challenges often
            stem from nervous system dysregulation and emotional fatigue—yet
            traditional wellbeing initiatives rarely address the underlying
            mechanisms.
          </Body>
          <Body className="text-neutral-600">
            The NeuroHolistic approach supports internal regulation, mental
            clarity, and sustainable performance by working with the human
            system as a whole. When individuals and teams can regulate
            effectively, they think more clearly, collaborate better, and
            perform under pressure without depleting themselves.
          </Body>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-neutral-100 aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
          <Image
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80"
            alt="Coaching or therapy session"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </Section>
  );
}
