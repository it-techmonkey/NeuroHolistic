"use client";

import PageHero from "@/components/ui/PageHero";
import { CONTACT_INFO } from "@/lib/contact";
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
            <span className="text-white font-normal">{t.contactPage.neuroHolisticInstitute}</span>
          </>
        }
        description={t.contactPage.description}
        imageSrc="/images/pages/about.jpg"
        imageAlt="رابطہ"
        metaTags={["مشاورت", "اکیڈمی", "شراکت"]}
      />

      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-[860px] px-6 md:px-12">
          <div className="rounded-2xl border border-slate-200 p-6 md:p-8 bg-slate-50">
            <h2 className="text-2xl font-semibold text-slate-900">{t.contactPage.contactDetails}</h2>
            <div className="mt-6 space-y-3 text-slate-700">
              <p>
                {t.contactPage.emailLabel}{" "}
                <a className="text-indigo-600 hover:underline" href={`mailto:${CONTACT_INFO.email}`}>
                  {CONTACT_INFO.email}
                </a>
              </p>
              <p>
                Support{" "}
                <a className="text-indigo-600 hover:underline" href={`mailto:${CONTACT_INFO.supportEmail}`}>
                  {CONTACT_INFO.supportEmail}
                </a>
              </p>
              <p>
                WhatsApp{" "}
                <a className="text-indigo-600 hover:underline" href={CONTACT_INFO.whatsapp.href} target="_blank" rel="noreferrer">
                  {CONTACT_INFO.whatsapp.label}
                </a>
              </p>
              {CONTACT_INFO.mobiles.map((mobile, index) => (
                <p key={mobile.href}>
                  Mobile {index + 1}{" "}
                  <a className="text-indigo-600 hover:underline" href={mobile.href}>
                    {mobile.label}
                  </a>
                </p>
              ))}
              <p>{t.contactPage.locations}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
