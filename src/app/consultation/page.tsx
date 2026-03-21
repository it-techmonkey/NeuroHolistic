'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ConsultationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    country: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/consultation/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Connection error.');
        return;
      }

      sessionStorage.setItem('consultation_lead', JSON.stringify(formData));
      router.push('/consultation/book');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 block";
  const inputClass = "w-full bg-transparent border-b border-slate-200 py-3 text-[15px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#2B2F55] transition-colors rounded-none";

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#2B2F55] selection:text-white flex items-center justify-center py-24 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[480px]"
      >
        {/* Editorial Header */}
        <header className="mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 block mb-6">
            Intake Protocol
          </span>
          <h1 className="text-4xl font-bold tracking-tight leading-[1.1] mb-6">
            Begin Your <br />
            <span className="text-[#2B2F55]">Consultation.</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-500 font-light">
            Share your details to schedule a complimentary session with the NeuroHolistic Institute.
          </p>
        </header>

        {/* Form Container */}
        <div className="space-y-12">
          {error && (
            <div className="text-[12px] font-bold text-red-500 uppercase tracking-wider bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 gap-10">
              <div className="relative">
                <label className={labelClass}>Full Identity</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Legal Name"
                  className={inputClass}
                  required
                />
              </div>

              <div className="relative">
                <label className={labelClass}>Communications</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="Primary Email Address"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative">
                  <label className={labelClass}>Contact</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setField('mobile', e.target.value)}
                    placeholder="Mobile Number"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="relative">
                  <label className={labelClass}>Residency</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setField('country', e.target.value)}
                    placeholder="Country"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#2B2F55] text-white text-[11px] font-bold uppercase tracking-[0.25em] transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Processing Protocol...' : 'Secure Appointment →'}
              </button>
              
              <p className="mt-8 text-center text-[11px] text-slate-400 font-light leading-relaxed">
                By submitting, you acknowledge the systematic data processing <br /> protocols of the NeuroHolistic Institute.
              </p>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <footer className="mt-16 pt-8 border-t border-slate-100 flex justify-center">
          <a href="/programs" className="text-[12px] font-medium text-slate-400 hover:text-[#2B2F55] transition-colors flex items-center gap-2">
            Explore Program Methodologies <span className="text-lg">→</span>
          </a>
        </footer>
      </motion.div>
    </div>
  );
}