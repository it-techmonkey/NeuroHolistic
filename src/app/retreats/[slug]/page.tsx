import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURED_RETREAT, UPCOMING_RETREATS } from "@/components/retreats/retreats-data";

const RETREATS = [FEATURED_RETREAT, ...UPCOMING_RETREATS];

export async function generateStaticParams() {
  return RETREATS.map((retreat) => ({
    slug: retreat.slug || retreat.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const retreat = RETREATS.find((item) => item.slug === slug || item.id === slug);

  if (!retreat) {
    return { title: "Retreat Not Found | NeuroHolistic" };
  }

  return {
    title: `${retreat.title} | NeuroHolistic`,
    description: retreat.description,
  };
}

export default async function RetreatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const retreat = RETREATS.find((item) => item.slug === slug || item.id === slug);

  if (!retreat) {
    notFound();
  }

  return (
    <section className="bg-white pt-36 pb-24 md:pt-44 md:pb-28">
      <div className="mx-auto max-w-[1000px] px-6 md:px-10">
        <Link href="/retreats" className="text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5]">
          Back to Retreats
        </Link>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#E2E8F0]">
          <div className="relative h-[280px] w-full md:h-[420px]">
            <Image src={retreat.image} alt={retreat.title} fill className="object-cover" priority />
          </div>
        </div>

        <h1 className="mt-8 text-[34px] font-semibold leading-tight text-[#0F172A] md:text-[44px]">
          {retreat.title}
        </h1>

        <p className="mt-6 text-[17px] leading-[1.8] text-[#475569]">{retreat.description}</p>

        <div className="mt-10 grid gap-4 rounded-[14px] border border-[#E2E8F0] bg-[#FAFBFF] p-6 md:grid-cols-2">
          <p className="text-[15px] text-[#334155]"><strong>Date:</strong> {retreat.date}</p>
          <p className="text-[15px] text-[#334155]"><strong>Duration:</strong> {retreat.duration || "TBD"}</p>
          <p className="text-[15px] text-[#334155]"><strong>Location:</strong> {retreat.location}</p>
          <p className="text-[15px] text-[#334155]"><strong>Capacity:</strong> {retreat.capacity ? `${retreat.capacity} participants` : "TBD"}</p>
        </div>
      </div>
    </section>
  );
}
