import { notFound } from "next/navigation";
import { VISIBLE_EVENTS } from "@/components/events/events-data";
import EventDetailClient from "@/components/events/EventDetailClient";

// A hidden event has no public page at all: it is left out of the prerendered
// paths, and a direct visit to its address gets the normal "not found" page
// rather than a page that still offers checkout.
function findVisibleEvent(slug: string) {
  return VISIBLE_EVENTS.find((item) => item.slug === slug || item.id === slug);
}

export async function generateStaticParams() {
  return VISIBLE_EVENTS.map((event) => ({
    slug: event.slug || event.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = findVisibleEvent(slug);

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
  const event = findVisibleEvent(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
