import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — NeuroHolistic' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-4">Privacy Policy</h1>
          <p className="text-slate-500 mt-2 text-sm">Last updated: March 2026</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <section>
          <h2 className="text-lg font-semibold mb-3">Data Collection</h2>
          <p className="text-slate-600 leading-relaxed">
            We collect personal information you provide when creating an account, booking sessions,
            or communicating with our team. This includes your name, email address, phone number,
            and session-related data such as therapist notes and assessment scores. We also collect
            standard usage data through cookies and analytics to improve our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">How We Use Your Data</h2>
          <p className="text-slate-600 leading-relaxed">
            Your personal information is used to provide and improve our therapeutic services,
            manage bookings and scheduling, send session reminders and notifications, process
            payments, and communicate important service updates. We do not sell or share your
            personal data with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Data Security</h2>
          <p className="text-slate-600 leading-relaxed">
            We implement industry-standard security measures to protect your personal information.
            All data is encrypted in transit and at rest. Access to client records is restricted to
            authorised personnel, and our systems are regularly audited for vulnerabilities.
            Therapeutic session data is handled with the highest level of confidentiality in
            accordance with professional standards.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Your Rights</h2>
          <p className="text-slate-600 leading-relaxed">
            You have the right to access, correct, or delete your personal data at any time. You
            may request a copy of all data we hold about you, ask us to update inaccurate
            information, or request the deletion of your account and associated data. To exercise
            any of these rights, please contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have questions about this privacy policy or wish to exercise your data rights,
            please contact us at{' '}
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
