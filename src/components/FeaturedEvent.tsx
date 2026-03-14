import Image from "next/image";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { H2, Body, BodySmall } from "@/components/ui/Typography";
import type { EventItem } from "./events/types";

interface FeaturedEventProps {
  event: EventItem;
}

export default function FeaturedEvent({ event }: FeaturedEventProps) {
  const detailsHref = event.slug ? `/events/${event.slug}` : `/events?id=${event.id}`;

  return (
    <Card
      className="rounded-xl overflow-hidden border-2 border-primary-200/60 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
      shadow="none"
      hoverable
    >
      <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-2/5 aspect-[16/10] md:aspect-auto md:min-h-[280px] flex-shrink-0">
            <Image
              src={event.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>
          <CardBody className="flex-1 p-6 md:p-8 flex flex-col justify-center">
            <H2 className="text-neutral-900 mb-3">{event.title}</H2>
            <Body className="text-neutral-600 mb-6 line-clamp-3">
              {event.description}
            </Body>
            <dl className="space-y-2 mb-6">
              <div className="flex gap-2">
                <span className="text-neutral-500" aria-hidden>📅</span>
                <BodySmall className="text-neutral-700">
                  {event.date}
                  {event.time ? ` · ${event.time}` : ""}
                </BodySmall>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-500" aria-hidden>📍</span>
                <BodySmall className="text-neutral-700">{event.location}</BodySmall>
              </div>
              {event.capacity != null && (
                <div className="flex gap-2">
                  <span className="text-neutral-500" aria-hidden>👥</span>
                  <BodySmall className="text-neutral-700">
                    Capacity: {event.capacity} participants
                  </BodySmall>
                </div>
              )}
            </dl>
            <div className="flex flex-wrap gap-3">
              <Link href={detailsHref}>
                <Button>Register</Button>
              </Link>
            </div>
          </CardBody>
        </div>
    </Card>
  );
}
