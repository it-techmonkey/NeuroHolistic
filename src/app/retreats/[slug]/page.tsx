import { notFound } from "next/navigation";
import { ALL_RETREATS } from "@/components/retreats/retreats-data";
import RetreatDetailClient from "@/components/retreats/RetreatDetailClient";

export async function generateStaticParams() {
  return ALL_RETREATS.map((retreat) => ({
    slug: retreat.slug || retreat.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const retreat = ALL_RETREATS.find((item) => item.slug === slug || item.id === slug);

  if (!retreat) {
    return { title: "Retreat Not Found | NeuroHolistic" };
  }

  const copy = retreat.locales.en;

  return {
    title: `${copy.title} | NeuroHolistic`,
    description: copy.description,
  };
}

export default async function RetreatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const retreat = ALL_RETREATS.find((item) => item.slug === slug || item.id === slug);

  if (!retreat) {
    notFound();
  }

  return <RetreatDetailClient retreat={retreat} />;
}
