"use client";

import { useMemo, useState } from "react";
import Section from "@/components/ui/Section";
import { H2 } from "@/components/ui/Typography";
import FeaturedEvent from "./FeaturedEvent";
import EventCard from "./EventCard";
import EventFilters from "./EventFilters";
import type { EventFiltersState } from "./EventFilters";
import EventsEmptyState from "./EventsEmptyState";
import type { EventItem } from "./events/types";

function extractDateOptions(events: EventItem[]): { value: string; label: string }[] {
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [{ value: "all", label: "All dates" }];
  for (const e of events) {
    const match = e.date.match(/([A-Za-z]+)\s+\d+/);
    if (match) {
      const month = match[1];
      const yearMatch = e.date.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : "";
      const key = `${month} ${year}`;
      if (key && !seen.has(key)) {
        seen.add(key);
        options.push({ value: key, label: key });
      }
    }
  }
  return options.sort((a, b) => {
    if (a.value === "all") return -1;
    if (b.value === "all") return 1;
    return a.label.localeCompare(b.label);
  });
}

function filterEvents(
  events: EventItem[],
  filters: EventFiltersState
): EventItem[] {
  return events.filter((e) => {
    if (filters.type !== "all" && e.type !== filters.type) return false;
    if (filters.date !== "all") {
      const match = e.date.match(/([A-Za-z]+)\s+\d+/);
      const yearMatch = e.date.match(/\d{4}/);
      const month = match ? match[1] : "";
      const year = yearMatch ? yearMatch[0] : "";
      if (`${month} ${year}` !== filters.date) return false;
    }
    return true;
  });
}

interface UpcomingEventsSectionProps {
  events: EventItem[];
}

export default function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  const [filters, setFilters] = useState<EventFiltersState>({
    type: "all",
    date: "all",
  });

  const dateOptions = useMemo(() => extractDateOptions(events), [events]);
  const filtered = useMemo(
    () => filterEvents(events, filters),
    [events, filters]
  );

  const [featured, ...rest] = filtered;

  return (
    <Section padding="xl" background="white">
      <H2 className="text-neutral-900 mb-10">Upcoming Events</H2>

      {filtered.length === 0 ? (
        <EventsEmptyState />
      ) : (
        <>
          {featured && (
            <div className="mb-10">
              <FeaturedEvent event={featured} />
            </div>
          )}

          {rest.length > 0 && (
            <>
              <div className="mb-8">
                <EventFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  dateOptions={dateOptions}
                />
              </div>
              <div className="space-y-6">
                {rest.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}

          {rest.length === 0 && featured && (
            <div className="mb-8">
              <EventFilters
                filters={filters}
                onFiltersChange={setFilters}
                dateOptions={dateOptions}
              />
            </div>
          )}
        </>
      )}
    </Section>
  );
}
