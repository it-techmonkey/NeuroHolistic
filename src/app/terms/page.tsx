import Link from 'next/link';

export const metadata = { title: 'Terms of Service — NeuroHolistic' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-4">Terms of Service</h1>
          <p className="text-slate-500 mt-2 text-sm">Last updated: March 2026</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <section>
          <h2 className="text-lg font-semibold mb-3">Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing or using the NeuroHolistic Institute platform, you agree to be bound by
            these Terms of Service. If you do not agree with any part of these terms, you may not
            use our services. We reserve the right to update these terms at any time, and continued
            use of the platform constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Services Provided</h2>
          <p className="text-slate-600 leading-relaxed">
            NeuroHolistic Institute provides therapeutic services including individual and group
            sessions, assessments, and related wellness programs. Services are delivered by
            qualified therapists through our online platform. Session content, therapist notes, and
            assessment scores are provided for informational purposes and do not constitute medical
            advice or diagnosis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Booking and Cancellation Policy</h2>
          <p className="text-slate-600 leading-relaxed">
            Sessions must be booked through the platform and are subject to therapist availability.
            Cancellations or reschedules must be made at least 24 hours before the scheduled session
            time. Late cancellations or no-shows may result in the session being marked as used from
            your program allocation. Repeated no-shows may lead to restrictions on future bookings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Payment Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            Payment for programs and sessions is required in advance. All fees are listed on the
            platform at the time of purchase. Refunds are handled on a case-by-case basis and are
            subject to our refund policy. We use third-party payment processors and do not store
            your full payment card details on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            NeuroHolistic Institute and its therapists shall not be liable for any indirect,
            incidental, or consequential damages arising from the use of our services. Our total
            liability is limited to the amount paid for the specific service giving rise to the
            claim. We do not guarantee specific therapeutic outcomes, as results vary by individual.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            For questions regarding these terms, please contact us at{' '}
            <a href="mailto:info@neuroholistic.com" className="text-[#2B2F55] font-medium hover:underline">
              info@neuroholistic.com
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} NeuroHolistic Institute. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
