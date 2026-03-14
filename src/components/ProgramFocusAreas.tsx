import Section from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { H2, BodySmall } from "@/components/ui/Typography";

const FOCUS_AREAS = [
  {
    title: "Mental Clarity & Cognitive Performance",
    description:
      "Supporting focus, decision-making, and psychological flexibility.",
    icon: "◆",
  },
  {
    title: "Stress Regulation & Resilience",
    description:
      "Helping individuals regulate pressure and recover from mental overload.",
    icon: "◇",
  },
  {
    title: "Leadership Awareness",
    description:
      "Developing self-awareness and emotional intelligence in leadership roles.",
    icon: "○",
  },
  {
    title: "Healthy Organizational Culture",
    description:
      "Strengthening communication, psychological safety, and collaboration.",
    icon: "△",
  },
];

export default function ProgramFocusAreas() {
  return (
    <Section padding="xl" background="white">
      <H2 className="text-neutral-900 mb-12 text-center">
        Program Focus Areas
      </H2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {FOCUS_AREAS.map((item) => (
          <Card
            key={item.title}
            className="rounded-xl border border-neutral-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
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
