import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { H2, H3, BodySmall } from "@/components/ui/Typography";
import type { RetreatItem } from "./retreats/types";

interface RetreatGridProps {
  retreats: RetreatItem[];
}

export default function RetreatGrid({ retreats }: RetreatGridProps) {
  if (retreats.length === 0) return null;

  return (
    <Section padding="xl" background="light">
      <H2 className="text-neutral-900 mb-10">Upcoming Retreats</H2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {retreats.map((retreat) => {
          const href = retreat.slug
            ? `/retreats/${retreat.slug}`
            : `/retreats?id=${retreat.id}`;
          return (
            <Card
              key={retreat.id}
              className="rounded-xl overflow-hidden border border-neutral-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
              shadow="none"
              hoverable
            >
              <div className="relative w-full aspect-[16/10] flex-shrink-0">
                <Image
                  src={retreat.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <CardBody className="p-6 flex flex-col flex-1">
                <H3 className="text-neutral-900 mb-2">{retreat.title}</H3>
                <BodySmall className="text-neutral-600 mb-2">
                  📅 {retreat.date}
                </BodySmall>
                <BodySmall className="text-neutral-600 mb-4">
                  📍 {retreat.location}
                </BodySmall>
                <BodySmall className="text-neutral-600 mb-6 line-clamp-3 flex-1">
                  {retreat.description}
                </BodySmall>
                <Link
                  href={href}
                  className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors w-fit"
                >
                  View Retreat
                </Link>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
