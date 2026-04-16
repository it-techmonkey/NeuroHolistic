import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_EVENTS } from "@/components/events/events-data";

export async function generateStaticParams() {
  return MOCK_EVENTS.map((event) => ({
    slug: event.slug || event.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = MOCK_EVENTS.find((item) => item.slug === slug || item.id === slug);

  if (!event) return { title: "الفعالية غير موجودة | NeuroHolistic" };

  return {
    title: `${event.title} | NeuroHolistic`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = MOCK_EVENTS.find((item) => item.slug === slug || item.id === slug);

  if (!event) {
    notFound();
  }

  return (
    <section className="bg-white pt-36 pb-24 md:pt-44 md:pb-28">
      <div className="mx-auto max-w-[1000px] px-6 md:px-10">
        <Link href="/events" className="text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5]">
          العودة إلى الفعاليات
        </Link>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#E2E8F0]">
          <div className="relative h-[280px] w-full md:h-[420px]">
            <Image src={event.image} alt={event.title} fill className="object-cover" priority />
          </div>
        </div>

        <h1 className="mt-8 text-[34px] font-semibold leading-tight text-[#0F172A] md:text-[44px]">
          {event.title}
        </h1>

        <p className="mt-6 text-[17px] leading-[1.8] text-[#475569]">{event.description}</p>

        <div className="mt-10 grid gap-4 rounded-[14px] border border-[#E2E8F0] bg-[#FAFBFF] p-6 md:grid-cols-2">
          <p className="text-[15px] text-[#334155]"><strong>التاريخ:</strong> {event.date}</p>
          <p className="text-[15px] text-[#334155]"><strong>الوقت:</strong> {event.time || "يحدد لاحقا"}</p>
          <p className="text-[15px] text-[#334155]"><strong>الموقع:</strong> {event.location}</p>
          <p className="text-[15px] text-[#334155]"><strong>النوع:</strong> {event.type}</p>
        </div>
      </div>
    </section>
  );
}
