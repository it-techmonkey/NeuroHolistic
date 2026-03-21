'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const THERAPISTS = [
  { id: 'dr-fawzia-yassmina', name: 'Dr. Fawzia Yassmina', role: 'Founder & Method Creator' },
  { id: 'mariam-al-kaisi', name: 'Mariam Al Kaisi', role: 'Certified Practitioner' },
  { id: 'noura-youssef', name: 'Noura Youssef', role: 'Certified Practitioner' },
  { id: 'reem-mobayed', name: 'Reem Mobayed', role: 'Certified Practitioner' },
  { id: 'fawares-azaar', name: 'Fawares Azaar', role: 'Certified Practitioner' },
  { id: 'joud-charafeddin', name: 'Joud Charafeddin', role: 'Certified Practitioner' },
];

const TIME_SLOTS = [
  { id: 'morning-early', display: '09:00', value: '09:00' },
  { id: 'morning-late', display: '11:00', value: '11:00' },
  { id: 'afternoon-early', display: '14:00', value: '14:00' },
  { id: 'afternoon-late', display: '16:00', value: '16:00' },
  { id: 'evening', display: '18:00', value: '18:00' },
];

// ─── Micro Components ────────────────────────────────────────────────────────

function CalendarPicker({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="py-6 border-t border-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-widest text-slate-900">
          {viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}
        </span>
        <div className="flex gap-4">
          <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="text-slate-400 hover:text-slate-900 transition-colors">
            ←
          </button>
          <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="text-slate-400 hover:text-slate-900 transition-colors">
            →
          </button>
        </div>
      </div>
      
      {/* FIXED: Using index for header keys to avoid 'S' and 'T' duplicates */}
      <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-lg overflow-hidden">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div key={`header-${idx}`} className="bg-white text-[10px] font-bold text-slate-300 py-3 text-center">
            {day}
          </div>
        ))}
        
        {blanks.map((i) => (
          <div key={`blank-${i}`} className="bg-white" />
        ))}
        
        {days.map((day) => {
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
          const isPast = date < today;
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          return (
            <button 
              key={`day-${day}`} 
              type="button" 
              disabled={isPast} 
              onClick={() => onSelect(date)}
              className={`bg-white aspect-square text-[12px] font-medium transition-all ${
                isPast ? 'text-slate-100 cursor-not-allowed' :
                isSelected ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ConsultationBookPage() {
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [therapist, setTherapist] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('consultation_lead');
    if (!stored) { router.replace('/consultation'); return; }
    setLead(JSON.parse(stored));
  }, [router]);

  async function handleBook() {
    if (!therapist || !selectedDate || !time) return;
    setLoading(true);
    try {
      const selectedTherapist = THERAPISTS.find((t) => t.id === therapist);
      const res = await fetch('/api/consultation/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lead,
          therapist_id: therapist,
          therapist_name: selectedTherapist?.name,
          date: selectedDate.toISOString().split('T')[0],
          time,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess({ therapistName: selectedTherapist?.name, date: selectedDate.toDateString(), time, meetingLink: data.meetingLink });
        sessionStorage.removeItem('consultation_lead');
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  if (!lead) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[540px] text-center">
          <header className="mb-12">
            <div className="w-12 h-12 bg-emerald-500 rounded-full mx-auto mb-8 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 block mb-4">Confirmed</span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Appointment Secured.</h1>
          </header>

          <div className="border-y border-slate-100 py-10 mb-12 space-y-6 text-left">
            {[
              { label: 'Practitioner', val: success.therapistName },
              { label: 'Schedule', val: `${success.date} at ${success.time}` },
              { label: 'Virtual Room', val: success.meetingLink, isLink: true },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                <span className={`text-[13px] font-medium ${item.isLink ? 'text-indigo-600 truncate max-w-[200px]' : 'text-slate-900'}`}>{item.val}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <a href={success.meetingLink} target="_blank" className="block w-full py-4 rounded-full bg-[#2B2F55] text-white text-[11px] font-bold uppercase tracking-widest text-center">Enter Consultation</a>
            <button onClick={() => router.push('/')} className="block w-full text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors text-center">Return to Institute</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 py-24 px-6">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
        
        <div className="lg:col-span-5">
          <header className="sticky top-24">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 block mb-6">Step 02 // Schedule</span>
            <h1 className="text-4xl font-bold tracking-tight leading-[1.1] mb-8">
              Select Your <br />
              <span className="text-[#2B2F55]">Practitioner.</span>
            </h1>
            <p className="text-[15px] leading-relaxed text-slate-500 font-light mb-12">
              Welcome, {lead.name.split(' ')[0]}. Finalize your intake by selecting a specialist and time that aligns with your current schedule.
            </p>
            
            <div className="space-y-1">
              {THERAPISTS.map((t) => (
                <button 
                  key={t.id} 
                  onClick={() => setTherapist(t.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex justify-between items-center ${therapist === t.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-wide">{t.name}</p>
                    <p className={`text-[11px] font-medium ${therapist === t.id ? 'text-slate-400' : 'text-slate-400'}`}>{t.role}</p>
                  </div>
                  {therapist === t.id && <span className="text-xs">●</span>}
                </button>
              ))}
            </div>
          </header>
        </div>

        <div className="lg:col-span-7 space-y-16">
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Calendar Selection</h2>
            <CalendarPicker selectedDate={selectedDate} onSelect={setSelectedDate} />
          </section>

          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Time Allocation (UAE)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button 
                  key={slot.id} 
                  onClick={() => setTime(slot.value)}
                  className={`py-4 rounded-lg text-[12px] font-bold transition-all ${
                    time === slot.value ? 'bg-[#2B2F55] text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          </section>

          <div className="pt-12 border-t border-slate-100">
            <button 
              onClick={handleBook} 
              disabled={loading || !therapist || !selectedDate || !time}
              className="w-full py-5 rounded-full bg-[#2B2F55] text-white text-[11px] font-bold uppercase tracking-[0.3em] transition-all hover:bg-slate-800 disabled:opacity-20 active:scale-[0.98]"
            >
              {loading ? 'Finalizing...' : 'Confirm Appointment →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}