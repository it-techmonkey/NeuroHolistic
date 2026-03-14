import Section from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { H2, Body, BodySmall } from "@/components/ui/Typography";

const MODULES = [
  {
    step: 1,
    title: "Foundations of Human Change",
    description:
      "Neuroscience, psychology, and epigenetic mechanisms of perception, behavior, and transformation.",
  },
  {
    step: 2,
    title: "Practitioner Development",
    description:
      "Professional identity, ethics, communication, and responsibility in applied psychological work.",
  },
  {
    step: 3,
    title: "Applied Psychology Practice",
    description:
      "Observation, pattern recognition, and structured intervention logic.",
  },
  {
    step: 4,
    title: "NeuroHolistic Method™ Application",
    description:
      "Learning the internal logic and ethical application of the five-phase NeuroHolistic protocol.",
  },
];

export default function TrainingStructure() {
  return (
    <Section padding="xl" background="light">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <H2 className="text-neutral-900 mb-4">
          NeuroHolistic Applied Psychology Mastery for Practitioners
        </H2>
        <Body className="text-neutral-600">
          The program combines scientific foundations, practitioner formation,
          and supervised practice to prepare you for ethical, effective applied
          work.
        </Body>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {MODULES.map((module) => (
          <Card
            key={module.step}
            className="rounded-xl border border-neutral-100 shadow-md hover:shadow-lg transition-all duration-300"
            shadow="none"
            hoverable
          >
            <CardBody className="p-6 md:p-8">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold mb-5">
                {module.step}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {module.title}
              </h3>
              <BodySmall className="text-neutral-600">
                {module.description}
              </BodySmall>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}
