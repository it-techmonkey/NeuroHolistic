import Section from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { H2, BodySmall } from "@/components/ui/Typography";

const ACCREDITATIONS = [
  { name: "Complementary Medical Association (CMA)", abbr: "CMA" },
  { name: "CPD Certification Service", abbr: "CPD" },
];

export default function Accreditation() {
  return (
    <Section padding="xl" background="white">
      <H2 className="text-neutral-900 text-center mb-6">
        Accreditation & Professional Recognition
      </H2>
      <div className="max-w-3xl mx-auto text-center mb-10">
        <BodySmall className="text-neutral-600">
          The program is issued by the NeuroHolistic Institute and supported by
          international professional accreditation bodies.
        </BodySmall>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {ACCREDITATIONS.map((item) => (
          <Card
            key={item.abbr}
            className="rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow min-w-[200px]"
            shadow="none"
          >
            <CardBody className="p-6 text-center">
              <p className="font-semibold text-neutral-800 text-sm">
                {item.name}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}
