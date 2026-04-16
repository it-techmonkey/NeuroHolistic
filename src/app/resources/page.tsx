"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function ResourcesPage() {
  const { t } = useLang();
  const rp = t.resourcesPage;

  const resourceSections = [
    {
      title: rp.articlesTitle,
      desc: rp.articlesDesc,
    },
    {
      title: rp.mediaTitle,
      desc: rp.mediaDesc,
    },
    {
      title: rp.audioTitle,
      desc: rp.audioDesc,
    },
  ];

  return (
    <main className="w-full bg-white">
      <PageHero
        eyebrow={rp.eyebrow}
        title={
          <>
            {rp.title1}<br />
            <span className="text-white font-normal">{rp.title2}</span>
          </>
        }
        description={rp.description}
        imageSrc="/images/pages/teams.jpg"
        imageAlt={rp.eyebrow}
        metaTags={[...rp.metaTags]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {resourceSections.map((section) => (
            <div key={section.title} className="rounded-xl border border-slate-200 p-6 bg-slate-50/50">
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">{section.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
