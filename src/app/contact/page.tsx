import PageHero from "@/components/ui/PageHero";

export const metadata = {
  title: "Contact | NeuroHolistic",
  description: "Get in touch with the NeuroHolistic Institute for consultations, academy applications, and partnerships.",
};

export default function ContactPage() {
  return (
    <main className="w-full bg-white">
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Connect with the <br />
            <span className="text-white/60 font-normal">NeuroHolistic Institute</span>
          </>
        }
        description="For consultations, academy applications, and collaborations."
        imageSrc="/images/pages/about.jpg"
        imageAlt="Contact"
        metaTags={["Consultation", "Academy", "Partnerships"]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[860px] px-6 md:px-12">
          <div className="rounded-2xl border border-slate-200 p-6 md:p-8 bg-slate-50">
            <h2 className="text-2xl font-semibold text-slate-900">Contact Details</h2>
            <div className="mt-6 space-y-3 text-slate-700">
              <p>
                Email:{" "}
                <a className="text-indigo-600 hover:underline" href="mailto:info@neuroholistic.com">
                  info@neuroholistic.com
                </a>
              </p>
              <p>Locations: Dubai // London</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
