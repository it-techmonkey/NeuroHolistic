import Section from "@/components/ui/Section";
import { H2, Body, BodySmall } from "@/components/ui/Typography";

const IMPACTS = [
  {
    title: "Focus and Cognitive Performance",
    description:
      "Clearer thinking, better decision-making, and improved problem-solving capacity.",
  },
  {
    title: "Productivity and Work Efficiency",
    description:
      "Reduced cognitive overload and greater mental clarity during demanding work cycles.",
  },
  {
    title: "Employee Retention and Loyalty",
    description:
      "Strengthening psychological safety and long-term engagement.",
  },
  {
    title: "Team Collaboration and Communication",
    description:
      "Improved emotional awareness and healthier relational dynamics.",
  },
  {
    title: "Resilience in High-Pressure Environments",
    description:
      "Helping individuals maintain stability and performance during periods of change.",
  },
];

export default function OrganizationalImpact() {
  return (
    <Section padding="xl" background="dark" className="!bg-slate-900">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <H2 className="text-white mb-4">Impact Across the Organization</H2>
        <Body className="text-slate-300">
          Organizations implementing regulation-informed wellbeing frameworks
          observe improvements across multiple operational areas.
        </Body>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {IMPACTS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 md:p-8 hover:bg-white/15 transition-all duration-300"
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              {item.title}
            </h3>
            <BodySmall className="text-slate-300">
              {item.description}
            </BodySmall>
          </div>
        ))}
      </div>
    </Section>
  );
}
