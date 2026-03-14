import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { H3, Body } from "@/components/ui/Typography";

export default function EventsEmptyState() {
  return (
    <Card className="rounded-xl shadow-md border border-neutral-100" shadow="none">
      <CardBody className="p-8 md:p-12 text-center">
        <H3 className="text-neutral-900 mb-3">No upcoming events right now.</H3>
        <Body className="text-neutral-600 mb-8 max-w-md mx-auto">
          Join our mailing list to be notified when new gatherings are
          announced.
        </Body>
        <Link
          href="#newsletter"
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
        >
          Get Event Updates
        </Link>
      </CardBody>
    </Card>
  );
}
