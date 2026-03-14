import Section from "@/components/ui/Section";
import { H2, Body } from "@/components/ui/Typography";

export default function CorporateApproach() {
  return (
    <Section padding="xl" background="light">
      <div className="max-w-3xl mx-auto text-center">
        <H2 className="text-neutral-900 mb-6">
          The NeuroHolistic Approach for Organizations
        </H2>
        <Body className="text-neutral-600">
          Our corporate programs integrate neuroscience-informed principles
          including regulation, perception, and cognitive flexibility. The goal
          is to support both individuals and teams in navigating complexity and
          pressure—building resilience, clarity, and sustainable performance
          without relying on short-term fixes or one-off interventions.
        </Body>
      </div>
    </Section>
  );
}
