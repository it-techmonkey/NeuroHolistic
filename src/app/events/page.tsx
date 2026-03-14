import EventsHero from "@/components/EventsHero";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import EventsNewsletter from "@/components/EventsNewsletter";
import { MOCK_EVENTS } from "@/components/events/events-data";

export const metadata = {
  title: "Events & Workshops | NeuroHolistic",
  description:
    "Gatherings, workshops, and online sessions exploring the NeuroHolistic Method™ and the principles of human transformation.",
};

export default function EventsPage() {
  return (
    <div className="w-full">
      <EventsHero />
      <UpcomingEventsSection events={MOCK_EVENTS} />
      <EventsNewsletter />
    </div>
  );
}
