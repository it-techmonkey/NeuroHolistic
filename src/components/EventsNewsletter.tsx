"use client";

import { useState } from "react";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { H2, Body } from "@/components/ui/Typography";

export default function EventsNewsletter() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: submit to mailing list
  }

  return (
    <Section padding="xl" background="light" id="newsletter" className="scroll-mt-24">
      <div className="max-w-2xl mx-auto text-center">
        <H2 className="text-neutral-900 mb-4">Stay Updated on Upcoming Events</H2>
        <Body className="text-neutral-600 mb-8">
          Join our mailing list to receive updates about upcoming workshops,
          retreats, and online sessions.
        </Body>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 md:p-8 shadow-md border border-neutral-100"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="events-email" className="sr-only">
                Email
              </label>
              <input
                id="events-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <Button type="submit" size="lg" className="sm:self-auto">
              Get Event Updates
            </Button>
          </div>
        </form>
      </div>
    </Section>
  );
}
