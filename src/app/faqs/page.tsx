import PageHero from "@/components/ui/PageHero";

const FAQS = [
  {
    q: "What is the NeuroHolistic Method™?",
    a: "It is a structured, science-informed framework designed to support deep and lasting human transformation.",
  },
  {
    q: "How do I book a consultation?",
    a: "Use the Book a Session / Book Now actions on the site to start your consultation flow.",
  },
  {
    q: "Do you offer private and group formats?",
    a: "Yes. Programs are available in private and group formats based on your goals and readiness.",
  },
  {
    q: "Can I apply to the Academy?",
    a: "Yes. You can apply through the Academy page and follow the enrollment guidance there.",
  },
];

export const metadata = {
  title: "FAQs | NeuroHolistic",
  description: "Frequently asked questions about programs, consultations, and the NeuroHolistic Method.",
};

export default function FAQsPage() {
  return (
    <main className="w-full bg-white">
      <PageHero
        eyebrow="Support"
        title={
          <>
            Frequently Asked <br />
            <span className="italic text-white/60 font-normal">Questions.</span>
          </>
        }
        description="Quick answers about consultations, programs, and the NeuroHolistic journey."
        imageSrc="/images/pages/about.jpg"
        imageAlt="FAQs"
        metaTags={["Support", "Clarity", "Guidance"]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[960px] px-6 md:px-12 space-y-4">
          {FAQS.map((item) => (
            <div key={item.q} className="rounded-xl border border-slate-200 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-slate-900">{item.q}</h2>
              <p className="mt-2 text-slate-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
