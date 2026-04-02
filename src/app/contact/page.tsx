"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function ContactPage() {
  const { t } = useLang();

  return (
    <main className="w-full bg-white">
      <PageHero
        eyebrow={t.pageHero.contact}
        title={
          <>
            {t.contactPage.connectWith} <br />
            <span className="text-white/60 font-normal">{t.contactPage.neuroHolisticInstitute}</span>
          </>
        }
        description={t.contactPage.description}
        imageSrc="/images/pages/about.jpg"
        imageAlt="رابطہ"
        metaTags={["مشاورت", "اکیڈمی", "شراکت"]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[860px] px-6 md:px-12">
          <div className="rounded-2xl border border-slate-200 p-6 md:p-8 bg-slate-50">
            <h2 className="text-2xl font-semibold text-slate-900">{t.contactPage.contactDetails}</h2>
            <div className="mt-6 space-y-3 text-slate-700">
              <p>
                {t.contactPage.emailLabel}{" "}
                <a className="text-indigo-600 hover:underline" href="mailto:info@neuroholistic.com">
                  info@neuroholistic.com
                </a>
              </p>
              <p>{t.contactPage.locations}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
