"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { H3, BodySmall } from "@/components/ui/Typography";
import type { EventItem } from "./events/types";
import { useContentLocale } from "./retreats/locale";

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const locale = useContentLocale();
  const copy = event.locales[locale];
  const detailsHref = event.slug ? `/events/${event.slug}` : `/events?id=${event.id}`;

  return (
    <Card
      className="overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      shadow="none"
      hoverable
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-video w-full shrink-0 sm:aspect-square sm:min-h-[200px] sm:w-2/5">
          <Image
            src={event.image}
            alt={`${copy.title} event image`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 40vw"
          />
        </div>
        <CardBody className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <H3 className="text-neutral-900">{copy.title}</H3>
            <Badge variant="primary" size="sm">
              {copy.typeLabel}
            </Badge>
          </div>
          <BodySmall className="mb-4 line-clamp-3 flex-1 text-neutral-600">{copy.description}</BodySmall>
          <dl className="mb-4 space-y-1 text-sm text-neutral-600">
            <div className="flex gap-2">
              <svg className="h-5 w-5 shrink-0 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M8 3v4M16 3v4M4 10h16M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                {copy.date}
                {copy.time ? ` · ${copy.time}` : ""}
              </span>
            </div>
            <div className="flex gap-2">
              <svg className="h-5 w-5 shrink-0 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>{copy.location}</span>
            </div>
          </dl>
          <div className="mt-auto flex flex-wrap gap-3">
            <Link href={detailsHref}>
              <Button size="sm">Register</Button>
            </Link>
            <Link
              href={detailsHref}
              className="inline-flex items-center justify-center rounded-lg border-2 border-primary-500 px-4 py-2.5 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-50"
            >
              View Details
            </Link>
          </div>
        </CardBody>
      </div>
    </Card>
  );
}
