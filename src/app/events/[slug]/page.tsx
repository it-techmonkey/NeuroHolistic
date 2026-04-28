import { notFound } from "next/navigation";
import { MOCK_EVENTS } from "@/components/events/events-data";
import EventDetailClient from "@/components/events/EventDetailClient";

export async function generateStaticParams() {
  return MOCK_EVENTS.map((event) => ({
    slug: event.slug || event.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = MOCK_EVENTS.find((item) => item.slug === slug || item.id === slug);

  if (!event) {
    return { title: "Event not found | NeuroHolistic" };
  }

  const copy = event.locales.en;

  return {
    title: `${copy.title} | NeuroHolistic`,
    description: copy.description,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = MOCK_EVENTS.find((item) => item.slug === slug || item.id === slug);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
