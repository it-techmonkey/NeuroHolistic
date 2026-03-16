import Link from "next/link";
import BookNowButton from "@/components/booking/BookNowButton";

export default function Footer() {
  return (
    <footer className="bg-[#0B0F2B] text-slate-300">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-semibold text-white tracking-tight">
              NeuroHolistic
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              The NeuroHolistic Institute — Restoring balance within the human
              system for deep, lasting transformation.
            </p>
            <BookNowButton className="mt-6 inline-flex items-center rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-slate-100">
              Book a Session
            </BookNowButton>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Navigate</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/programs" className="text-sm hover:text-white transition-colors">Programs</Link></li>
              <li><Link href="/academy" className="text-sm hover:text-white transition-colors">Academy</Link></li>
              <li><Link href="/research" className="text-sm hover:text-white transition-colors">Research</Link></li>
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Programs</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/programs/private" className="text-sm hover:text-white transition-colors">
                  Private Sessions
                </Link>
              </li>
              <li>
                <Link href="/programs/group" className="text-sm hover:text-white transition-colors">
                  Group Program
                </Link>
              </li>
              <li>
                <Link href="/academy" className="text-sm hover:text-white transition-colors">
                  Academy
                </Link>
              </li>
              <li>
                <Link href="/corporate-wellbeing" className="text-sm hover:text-white transition-colors">
                  Corporate Wellbeing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <BookNowButton className="text-sm hover:text-white transition-colors">
                  Book Session
                </BookNowButton>
              </li>
              <li>
                <a href="mailto:info@neuroholistic.com" className="text-sm hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800/80 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} NeuroHolistic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
