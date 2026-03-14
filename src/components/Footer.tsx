import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-semibold text-white">
              NeuroHolistic
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              The NeuroHolistic Institute — Restoring balance within the human
              system for deep, lasting transformation.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Navigate</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/programs" className="text-sm hover:text-white transition-colors">Programs</Link></li>
              <li><Link href="/academy" className="text-sm hover:text-white transition-colors">Academy</Link></li>
              <li><Link href="/research" className="text-sm hover:text-white transition-colors">Research</Link></li>
              <li><Link href="/research" className="text-sm hover:text-white transition-colors">Science</Link></li>
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
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/book" className="text-sm hover:text-white transition-colors">
                  Book Session
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} NeuroHolistic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
