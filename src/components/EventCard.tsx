import Image from "next/image";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { H3, BodySmall } from "@/components/ui/Typography";
import type { EventItem } from "./events/types";

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const detailsHref = event.slug ? `/events/${event.slug}` : `/events?id=${event.id}`;

  return (
    <Card
      className="rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
      shadow="none"
      hoverable
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-2/5 aspect-video sm:aspect-square sm:min-h-[200px] flex-shrink-0">
          <Image
            src={event.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 40vw"
          />
        </div>
        <CardBody className="flex-1 p-6 flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <H3 className="text-neutral-900">{event.title}</H3>
            <Badge variant="primary" size="sm">
              {event.type}
            </Badge>
          </div>
          <BodySmall className="text-neutral-600 mb-4 line-clamp-3 flex-1">
            {event.description}
          </BodySmall>
          <dl className="space-y-1 mb-4 text-sm text-neutral-600">
            <div className="flex gap-2">
              <span aria-hidden>📅</span>
              <span>
                {event.date}
                {event.time ? ` · ${event.time}` : ""}
              </span>
            </div>
            <div className="flex gap-2">
              <span aria-hidden>📍</span>
              <span>{event.location}</span>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3 mt-auto">
            <Link href={detailsHref}>
              <Button size="sm">Register</Button>
            </Link>
            <Link
              href={detailsHref}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border-2 border-primary-500 text-primary-500 font-medium text-sm hover:bg-primary-50 transition-colors"
            >
              View Details
            </Link>
          </div>
        </CardBody>
      </div>
    </Card>
  );
}
