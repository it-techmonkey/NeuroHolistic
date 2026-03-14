import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { H3, Body, BodySmall } from "@/components/ui/Typography";

export interface ProgramCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  descriptionSecondary?: string;
  suitedTitle: string;
  suitedBullets: string[];
  ctaLabel: string;
  ctaHref: string;
}

export default function ProgramCard({
  icon,
  title,
  description,
  descriptionSecondary,
  suitedTitle,
  suitedBullets,
  ctaLabel,
  ctaHref,
}: ProgramCardProps) {
  return (
    <Card
      className="rounded-xl shadow-lg border border-neutral-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
      shadow="none"
      border={false}
    >
      <CardBody className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 text-2xl">
              {icon}
            </div>
            <H3 className="text-neutral-900">{title}</H3>
          </div>
          <Link
            href={ctaHref}
            className="flex-shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors shadow-sm"
          >
            {ctaLabel}
          </Link>
        </div>

        <Body className="text-neutral-600 mb-4">{description}</Body>
        {descriptionSecondary && (
          <BodySmall className="text-neutral-600 mb-6">
            {descriptionSecondary}
          </BodySmall>
        )}

        <div className="rounded-xl bg-amber-50/80 border border-amber-100/80 p-5 md:p-6 mt-auto">
          <p className="font-semibold text-neutral-800 mb-3 text-sm md:text-base">
            {suitedTitle}
          </p>
          <ul className="space-y-2">
            {suitedBullets.map((bullet) => (
              <li key={bullet} className="flex gap-2 items-start">
                <span className="text-primary-500 mt-0.5 flex-shrink-0" aria-hidden>
                  •
                </span>
                <BodySmall className="text-neutral-700">{bullet}</BodySmall>
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
