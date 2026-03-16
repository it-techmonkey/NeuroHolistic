import Image from "next/image";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { H2, Body, BodySmall } from "@/components/ui/Typography";
import type { FeaturedRetreatData } from "./retreats/types";

interface FeaturedRetreatProps {
  retreat: FeaturedRetreatData;
}

export default function FeaturedRetreat({ retreat }: FeaturedRetreatProps) {
  const detailsHref = retreat.slug
    ? `/retreats/${retreat.slug}`
    : `/retreats?id=${retreat.id}`;

  return (
    <Card
      className="rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
      shadow="none"
      hoverable
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-2/5 aspect-[16/10] lg:aspect-auto lg:min-h-[320px] flex-shrink-0">
          <Image
            src={retreat.image}
            alt={`${retreat.title} retreat image`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
            priority
          />
        </div>
        <CardBody className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <H2 className="text-neutral-900 mb-4">{retreat.title}</H2>
          <Body className="text-neutral-600 mb-8">
            {retreat.description}
          </Body>
          <dl className="space-y-3 mb-8">
            <div className="flex gap-2">
              <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M8 3v4M16 3v4M4 10h16M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <BodySmall className="text-neutral-700">{retreat.date}</BodySmall>
            </div>
            <div className="flex gap-2">
              <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <BodySmall className="text-neutral-700">{retreat.location}</BodySmall>
            </div>
            {retreat.capacity != null && (
              <div className="flex gap-2">
                <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <BodySmall className="text-neutral-700">
                  Capacity: {retreat.capacity} participants
                </BodySmall>
              </div>
            )}
            {retreat.duration && (
              <div className="flex gap-2">
                <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M8 3h8M8 21h8M9 3v4l3 3-3 3v8m6-18v4l-3 3 3 3v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <BodySmall className="text-neutral-700">
                  Duration: {retreat.duration}
                </BodySmall>
              </div>
            )}
          </dl>
          {retreat.tags && retreat.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {retreat.tags.map((tag) => (
                <Badge key={tag} variant="primary" size="md" className="rounded-full px-4">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Link href={detailsHref}>
              <Button size="md">Register</Button>
            </Link>
            <Link
              href={detailsHref}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border-2 border-primary-500 text-primary-500 font-medium hover:bg-primary-50 transition-colors"
            >
              View Details
            </Link>
          </div>
        </CardBody>
      </div>
    </Card>
  );
}
