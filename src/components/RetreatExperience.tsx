import Section from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { H2, BodySmall } from "@/components/ui/Typography";

const EXPERIENCES = [
  {
    title: "Deep Nervous System Regulation",
    description:
      "Guided practices to restore balance and coherence within the autonomic nervous system, creating a foundation for lasting change.",
    icon: "◆",
  },
  {
    title: "Guided Transformational Processes",
    description:
      "Structured sessions that move through the five-phase architecture of the NeuroHolistic Method™ in a held container.",
    icon: "◇",
  },
  {
    title: "Group Reflection & Integration",
    description:
      "Shared circles and dialogue that support integration of new patterns and collective learning.",
    icon: "○",
  },
  {
    title: "Nature-Based Restoration",
    description:
      "Time in nature to support regulation, reflection, and connection to the body and environment.",
    icon: "△",
  },
];

export default function RetreatExperience() {
  return (
    <Section padding="xl" background="light">
      <H2 className="text-neutral-900 mb-12 text-center">What You&apos;ll Experience</H2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {EXPERIENCES.map((item) => (
          <Card
            key={item.title}
            className="rounded-xl border border-neutral-100 shadow-md hover:shadow-lg transition-all duration-300"
            shadow="none"
            hoverable
          >
            <CardBody className="p-6 md:p-8">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold mb-5">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {item.title}
              </h3>
              <BodySmall className="text-neutral-600">
                {item.description}
              </BodySmall>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}
