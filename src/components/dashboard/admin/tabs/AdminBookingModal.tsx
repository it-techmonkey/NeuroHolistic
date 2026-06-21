'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Search, ChevronRight, ChevronLeft, Check, Loader2,
  CalendarDays, User, CreditCard, AlertCircle, Activity, BookOpen,
} from 'lucide-react';
import { toDisplayTime } from '@/lib/booking/slots';
import { getPricingConfig } from '@/lib/payments/pricing';

type Step = 'client' | 'details' | 'payment' | 'review';

type Client = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
};

type Therapist = {
  id: string;
  full_name: string;
  email: string;
};

type Program = {
  id: string;
  program_type: string;
  total_sessions: number;
  sessions_completed: number;
  used_sessions: number;
  status: string;
  therapist_name: string;
  therapist_user_id: string;
  price_paid: number | null;
  payment_status: string;
  created_at: string;
};

type Slot = { time: string; display: string };

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const stepOrder: Step[] = ['client', 'details', 'payment', 'review'];

const stepLabels: Record<Step, { label: string; icon: typeof User }> = {
  client: { label: 'Select Client', icon: User },
  details: { label: 'Session Details', icon: CalendarDays },
  payment: { label: 'Payment', icon: CreditCard },
  review: { label: 'Review', icon: Check },
};

export default function AdminBookingModal({ isOpen, onClose, onSuccess }: AdminBookingModalProps) {
  const [step, setStep] = useState<Step>('client');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientPrograms, setClientPrograms] = useState<Program[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);

  // Form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [sessionType, setSessionType] = useState<'free_consultation' | 'program'>('free_consultation');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [paymentStatus, setPaymentStatus] = useState<'free' | 'paid' | 'pending'>('free');
  const [amountAed, setAmountAed] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Availability
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // New program creation state
  const [newTotalSessions, setNewTotalSessions] = useState<number>(10);
  const [newProgramType, setNewProgramType] = useState<'private' | 'group' | 'academy'>('private');

  // Fetch clients, therapists, and programs on open
  useEffect(() => {
    if (!isOpen) return;
    setStep('client');
    setError('');
    setSuccess(false);
    setSelectedClient(null);
    setSelectedTherapist(null);
    setSessionType('free_consultation');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedProgram(null);
    setSessionNumber(1);
    setPaymentStatus('free');
    setAmountAed('');
    setAdminNotes('');
    setClientSearch('');
    setClientPrograms([]);
    setSlots([]);
    setNewTotalSessions(10);
    setNewProgramType('private');

    setLoading(true);
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then((dashboard) => {
        setClients((dashboard.users ?? []).filter((u: any) => u.role === 'client').map((u: any) => ({
          id: u.id,
          full_name: u.fullName || u.full_name || 'Unknown',
          email: u.email || '',
          phone: u.phone || null,
          country: u.country || null,
        })));
        setTherapists((dashboard.therapists ?? []).map((t: any) => ({
          id: t.id,
          full_name: t.name || t.fullName || t.full_name || 'Therapist',
          email: t.email,
        })));
        setAllPrograms(dashboard.programs ?? []);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // When client is selected, find their programs
  useEffect(() => {
    if (!selectedClient) { setClientPrograms([]); return; }
    const programs = allPrograms
      .filter((p: any) => p.user_id === selectedClient.id)
      .map((p: any) => ({
        id: p.id,
        program_type: p.program_type || 'private',
        total_sessions: p.total_sessions || 0,
        sessions_completed: p.sessions_completed || 0,
        used_sessions: p.used_sessions || 0,
        status: p.status || 'pending',
        therapist_name: p.therapist_name || 'Unassigned',
        therapist_user_id: p.therapist_user_id || '',
        price_paid: p.price_paid ?? null,
        payment_status: p.payment_status || 'pending',
        created_at: p.created_at || '',
      }));
    setClientPrograms(programs);

    // Auto-select if client has exactly one active program
    const activePrograms = programs.filter(p => p.status === 'active');
    if (activePrograms.length === 1) {
      setSelectedProgram(activePrograms[0]);
      setSessionType('program');
      setSessionNumber(activePrograms[0].used_sessions + 1);
    } else {
      setSelectedProgram(null);
    }
  }, [selectedClient, allPrograms]);

  // Fetch available slots when therapist or date changes
  useEffect(() => {
    if (!selectedTherapist || !selectedDate) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    setSelectedTime('');

    fetch(`/api/bookings/availability?therapistId=${encodeURIComponent(selectedTherapist.id)}&date=${encodeURIComponent(selectedDate)}`)
      .then(res => res.json())
      .then(data => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedTherapist, selectedDate]);

  // Auto-calculate price when therapist or new program type changes
  useEffect(() => {
    if (sessionType !== 'program') return;
    if (!selectedTherapist) return;

    const type = newProgramType === 'academy' ? 'private' : newProgramType;
    const config = getPricingConfig(type, selectedTherapist.full_name);
    const autoPrice = config.fullProgram;
    setAmountAed(String(autoPrice));
    setPaymentStatus('paid');
  }, [sessionType, selectedTherapist, newProgramType]);

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  // Generate next 14 days for date picker
  const availableDates = useMemo(() => {
    const dates: { value: string; label: string; dayName: string }[] = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const value = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dates.push({ value, label, dayName });
    }
    return dates;
  }, []);

  const canNext = useMemo(() => {
    switch (step) {
      case 'client': return !!selectedClient;
      case 'details': return !!selectedTherapist && !!selectedDate && !!selectedTime &&
        (sessionType === 'free_consultation' || selectedProgram !== undefined);
      case 'payment': return true;
      case 'review': return true;
      default: return false;
    }
  }, [step, selectedClient, selectedTherapist, selectedDate, selectedTime, sessionType, selectedProgram]);

  const handleNext = () => {
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
  };

  const handleBack = () => {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
  };

  const handleSubmit = async () => {
    if (!selectedClient || !selectedTherapist || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError('');

    // Determine if we're creating a new program or using existing
    const isNewProgram = sessionType === 'program' && !selectedProgram;

    try {
      const res = await fetch('/api/admin/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientUserId: selectedClient.id,
          therapistUserId: selectedTherapist.id,
          date: selectedDate,
          time: selectedTime,
          sessionType,
          programId: selectedProgram?.id || null,
          sessionNumber: sessionType === 'program' ? (isNewProgram ? 1 : sessionNumber) : null,
          paymentStatus,
          amountAed: amountAed ? parseFloat(amountAed) : null,
          adminNotes: adminNotes || null,
          createNewProgram: isNewProgram,
          totalSessions: isNewProgram ? newTotalSessions : null,
          programType: isNewProgram ? newProgramType : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '90vh' }}
            initial={{ scale: 0.96, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Book Session for Client</h2>
                <p className="text-sm text-slate-500">Schedule a session on behalf of a client</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                {stepOrder.map((s, i) => {
                  const { label, icon: Icon } = stepLabels[s];
                  const isActive = s === step;
                  const isComplete = stepOrder.indexOf(s) < stepOrder.indexOf(step);
                  return (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                        isComplete ? 'bg-emerald-500 text-white' :
                        isActive ? 'bg-[#2B2F55] text-white' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        {isComplete ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {label}
                      </span>
                      {i < stepOrder.length - 1 && (
                        <div className={`flex-1 h-0.5 ${isComplete ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#2B2F55] mx-auto mb-4" />
                  <p className="text-sm text-slate-500">Loading data...</p>
                </div>
              ) : success ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Session Booked!</h3>
                  <p className="text-sm text-slate-500">Notifications have been sent to client and therapist.</p>
                </div>
              ) : (
                <>
                  {step === 'client' && (
                    <StepClient
                      clients={filteredClients}
                      search={clientSearch}
                      onSearchChange={setClientSearch}
                      selected={selectedClient}
                      onSelect={(c) => {
                        setSelectedClient(c);
                        setSelectedTime('');
                        setSelectedDate('');
                        setSlots([]);
                      }}
                      clientPrograms={clientPrograms}
                    />
                  )}
                  {step === 'details' && (
                    <StepDetails
                      therapists={therapists}
                      selectedTherapist={selectedTherapist}
                      onSelectTherapist={(t) => { setSelectedTherapist(t); setSelectedTime(''); }}
                      sessionType={sessionType}
                      onSessionTypeChange={setSessionType}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      selectedTime={selectedTime}
                      onSelectTime={setSelectedTime}
                      availableDates={availableDates}
                      slots={slots}
                      slotsLoading={slotsLoading}
                      selectedClient={selectedClient}
                      clientPrograms={clientPrograms}
                      selectedProgram={selectedProgram}
                      onSelectProgram={setSelectedProgram}
                      sessionNumber={sessionNumber}
                      onSessionNumberChange={setSessionNumber}
                      newTotalSessions={newTotalSessions}
                      onNewTotalSessionsChange={setNewTotalSessions}
                      newProgramType={newProgramType}
                      onNewProgramTypeChange={setNewProgramType}
                    />
                  )}
                  {step === 'payment' && (
                    <StepPayment
                      paymentStatus={paymentStatus}
                      onPaymentStatusChange={setPaymentStatus}
                      amountAed={amountAed}
                      onAmountChange={setAmountAed}
                      adminNotes={adminNotes}
                      onNotesChange={setAdminNotes}
                      sessionType={sessionType}
                    />
                  )}
                  {step === 'review' && (
                    <StepReview
                      client={selectedClient}
                      therapist={selectedTherapist}
                      sessionType={sessionType}
                      date={selectedDate}
                      time={selectedTime}
                      paymentStatus={paymentStatus}
                      amountAed={amountAed}
                      adminNotes={adminNotes}
                      selectedProgram={selectedProgram}
                      sessionNumber={sessionNumber}
                      newTotalSessions={newTotalSessions}
                      newProgramType={newProgramType}
                    />
                  )}
                </>
              )}

              {error && (
                <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && !success && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={step === 'client'}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                {step === 'review' ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#2B2F55] text-white text-sm font-medium rounded-lg hover:bg-[#1e2140] transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#2B2F55] text-white text-sm font-medium rounded-lg hover:bg-[#1e2140] transition-colors disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Step 1: Select Client ── */
function StepClient({
  clients, search, onSearchChange, selected, onSelect, clientPrograms,
}: {
  clients: Client[];
  search: string;
  onSearchChange: (v: string) => void;
  selected: Client | null;
  onSelect: (c: Client) => void;
  clientPrograms: Program[];
}) {
  const activePrograms = clientPrograms.filter(p => p.status === 'active');
  const completedSessions = clientPrograms.reduce((sum, p) => sum + (p.sessions_completed || 0), 0);
  const totalSessions = clientPrograms.reduce((sum, p) => sum + (p.total_sessions || 0), 0);

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Search Client</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Selected Client Info */}
      {selected && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-semibold text-indigo-700">
              {selected.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{selected.full_name}</p>
              <p className="text-xs text-slate-500">{selected.email}</p>
            </div>
          </div>

          {/* Program Info */}
          {clientPrograms.length > 0 && (
            <div className="border-t border-indigo-200 pt-3 space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Program History</p>
              {clientPrograms.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 capitalize">{p.program_type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      p.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{p.status}</span>
                  </div>
                  <span className="text-slate-500 text-xs">
                    {p.sessions_completed || 0}/{p.total_sessions} sessions
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">{completedSessions} completed</span>
                </div>
                {activePrograms.length > 0 && (
                  <span className="text-xs text-emerald-600 font-medium">{activePrograms.length} active program(s)</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
        {clients.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No clients found</div>
        ) : (
          clients.map(client => (
              <button
                key={client.id}
                onClick={() => onSelect(client)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  selected?.id === client.id
                    ? 'bg-indigo-50 border-l-2 border-l-indigo-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 shrink-0">
                  {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{client.full_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400 truncate">{client.email}</p>
                </div>
                {selected?.id === client.id && (
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                )}
              </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Step 2: Session Details ── */
function StepDetails({
  therapists, selectedTherapist, onSelectTherapist,
  sessionType, onSessionTypeChange,
  selectedDate, onSelectDate,
  selectedTime, onSelectTime,
  availableDates, slots, slotsLoading,
  selectedClient, clientPrograms,
  selectedProgram, onSelectProgram,
  sessionNumber, onSessionNumberChange,
  newTotalSessions, onNewTotalSessionsChange,
  newProgramType, onNewProgramTypeChange,
}: {
  therapists: Therapist[];
  selectedTherapist: Therapist | null;
  onSelectTherapist: (t: Therapist) => void;
  sessionType: 'free_consultation' | 'program';
  onSessionTypeChange: (t: 'free_consultation' | 'program') => void;
  selectedDate: string;
  onSelectDate: (d: string) => void;
  selectedTime: string;
  onSelectTime: (t: string) => void;
  availableDates: { value: string; label: string; dayName: string }[];
  slots: Slot[];
  slotsLoading: boolean;
  selectedClient: Client | null;
  clientPrograms: Program[];
  selectedProgram: Program | null;
  onSelectProgram: (p: Program | null) => void;
  sessionNumber: number;
  onSessionNumberChange: (n: number) => void;
  newTotalSessions: number;
  onNewTotalSessionsChange: (n: number) => void;
  newProgramType: 'private' | 'group' | 'academy';
  onNewProgramTypeChange: (t: 'private' | 'group' | 'academy') => void;
}) {
  const activePrograms = clientPrograms.filter(p => p.status === 'active');

  return (
    <div className="p-6 space-y-5">
      {/* Session Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Session Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { onSessionTypeChange('free_consultation'); onSelectProgram(null); }}
            className={`p-3 rounded-xl border-2 text-left transition-colors ${
              sessionType === 'free_consultation'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-sm font-medium text-slate-900">Free Consultation</p>
            <p className="text-xs text-slate-500 mt-0.5">Initial assessment session</p>
          </button>
          <button
            onClick={() => {
              onSessionTypeChange('program');
              if (activePrograms.length === 0) onSelectProgram(null);
            }}
            className={`p-3 rounded-xl border-2 text-left transition-colors ${
              sessionType === 'program'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-sm font-medium text-slate-900">Program Session</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {activePrograms.length === 0 ? 'Create new program' : 'Part of a treatment program'}
            </p>
          </button>
        </div>
      </div>

      {/* New Program Creation (when no active programs and program type selected) */}
      {sessionType === 'program' && activePrograms.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">No Active Program Found</p>
              <p className="text-xs text-amber-600 mt-0.5">Create a new program for this client and schedule the first session.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Program Type</label>
              <select
                value={newProgramType}
                onChange={(e) => onNewProgramTypeChange(e.target.value as 'private' | 'group' | 'academy')}
                className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              >
                <option value="private">Private</option>
                <option value="group">Group</option>
                <option value="academy">Academy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Total Sessions</label>
              <input
                type="number"
                min={1}
                max={50}
                value={newTotalSessions}
                onChange={(e) => onNewTotalSessionsChange(parseInt(e.target.value) || 1)}
                className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Program Selection (when program type selected and has active programs) */}
      {sessionType === 'program' && activePrograms.length > 0 && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Program</label>
            <select
              value={selectedProgram?.id || ''}
              onChange={(e) => {
                const p = activePrograms.find(p => p.id === e.target.value);
                onSelectProgram(p || null);
                if (p) onSessionNumberChange(p.used_sessions + 1);
              }}
              className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            >
              <option value="">Choose a program...</option>
              {activePrograms.map(p => (
                <option key={p.id} value={p.id}>
                  {p.program_type} — {p.sessions_completed || 0}/{p.total_sessions} sessions — Therapist: {p.therapist_name}
                </option>
              ))}
            </select>
          </div>

          {selectedProgram && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Program Details</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="font-medium text-slate-700 capitalize">{selectedProgram.program_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Therapist</p>
                  <p className="font-medium text-slate-700">{selectedProgram.therapist_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Sessions Done</p>
                  <p className="font-medium text-slate-700">{selectedProgram.sessions_completed || 0} of {selectedProgram.total_sessions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Payment</p>
                  <p className="font-medium text-slate-700 capitalize">{selectedProgram.payment_status}</p>
                </div>
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(((selectedProgram.sessions_completed || 0) / selectedProgram.total_sessions) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${((selectedProgram.sessions_completed || 0) / selectedProgram.total_sessions) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Session Number */}
          {selectedProgram && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Session Number</label>
              <select
                value={sessionNumber}
                onChange={(e) => onSessionNumberChange(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              >
                {Array.from({ length: selectedProgram.total_sessions }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n} disabled={n <= (selectedProgram.sessions_completed || 0)}>
                    Session {n} {n <= (selectedProgram.sessions_completed || 0) ? '(completed)' : n === selectedProgram.used_sessions + 1 ? '(next)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Therapist */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Therapist</label>
        <select
          value={selectedTherapist?.id || ''}
          onChange={(e) => {
            const t = therapists.find(t => t.id === e.target.value);
            onSelectTherapist(t || null as any);
          }}
          className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          <option value="">Select therapist...</option>
          {therapists.map(t => (
            <option key={t.id} value={t.id}>{t.full_name}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {availableDates.map(d => (
            <button
              key={d.value}
              onClick={() => onSelectDate(d.value)}
              className={`p-2 rounded-xl text-center transition-colors ${
                selectedDate === d.value
                  ? 'bg-[#2B2F55] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <p className="text-[10px] font-medium opacity-70">{d.dayName}</p>
              <p className="text-sm font-semibold">{d.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Time (UAE)</label>
        {slotsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">Loading available slots...</span>
          </div>
        ) : !selectedTherapist || !selectedDate ? (
          <div className="text-center py-8 text-sm text-slate-400">
            Select a therapist and date to see available slots
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            No available slots for this date. Try another date.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map(s => (
              <button
                key={s.time}
                onClick={() => onSelectTime(s.time)}
                className={`p-2.5 rounded-xl text-center text-sm font-medium transition-colors ${
                  selectedTime === s.time
                    ? 'bg-[#2B2F55] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {s.display}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 3: Payment & Notes ── */
function StepPayment({
  paymentStatus, onPaymentStatusChange,
  amountAed, onAmountChange,
  adminNotes, onNotesChange,
  sessionType,
}: {
  paymentStatus: 'free' | 'paid' | 'pending';
  onPaymentStatusChange: (s: 'free' | 'paid' | 'pending') => void;
  amountAed: string;
  onAmountChange: (v: string) => void;
  adminNotes: string;
  onNotesChange: (v: string) => void;
  sessionType: 'free_consultation' | 'program';
}) {
  return (
    <div className="p-6 space-y-5">
      {/* Payment Status */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'free' as const, label: 'Free', desc: 'No charge' },
            { value: 'paid' as const, label: 'Paid', desc: 'Payment received' },
            { value: 'pending' as const, label: 'Pending', desc: 'Awaiting payment' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onPaymentStatusChange(opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-colors ${
                paymentStatus === opt.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-medium text-slate-900">{opt.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      {paymentStatus === 'paid' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (AED)</label>
          <input
            type="number"
            placeholder="0.00"
            value={amountAed}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
          <p className="text-[11px] text-slate-400 mt-1">Auto-calculated from therapist pricing. You can edit if needed.</p>
        </div>
      )}

      {/* Admin Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Notes (optional)</label>
        <textarea
          placeholder="Internal notes about this booking..."
          value={adminNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className="w-full border border-slate-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
        />
      </div>
    </div>
  );
}

/* ── Step 4: Review ── */
function StepReview({
  client, therapist, sessionType, date, time, paymentStatus, amountAed, adminNotes,
  selectedProgram, sessionNumber, newTotalSessions, newProgramType,
}: {
  client: Client | null;
  therapist: Therapist | null;
  sessionType: string;
  date: string;
  time: string;
  paymentStatus: string;
  amountAed: string;
  adminNotes: string;
  selectedProgram: Program | null;
  sessionNumber: number;
  newTotalSessions: number;
  newProgramType: 'private' | 'group' | 'academy';
}) {
  const formattedDate = date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }) : '—';

  const formattedTime = time ? toDisplayTime(time) : '—';

  return (
    <div className="p-6 space-y-4">
      <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
        <ReviewRow label="Client" value={client ? `${client.full_name} (${client.email})` : '—'} />
        <ReviewRow label="Therapist" value={therapist?.full_name || '—'} />
        <ReviewRow label="Session Type" value={sessionType === 'free_consultation' ? 'Free Consultation' : 'Program Session'} />
        {sessionType === 'program' && (
          <>
            {selectedProgram ? (
              <ReviewRow label="Program" value={`${selectedProgram.program_type} (${selectedProgram.sessions_completed || 0}/${selectedProgram.total_sessions} sessions)`} />
            ) : (
              <ReviewRow label="Program" value={`New ${newProgramType} program — ${newTotalSessions} sessions`} />
            )}
            <ReviewRow label="Session #" value={`#${sessionNumber}`} />
          </>
        )}
        <ReviewRow label="Date" value={formattedDate} />
        <ReviewRow label="Time" value={`${formattedTime} (UAE)`} />
        <ReviewRow label="Payment" value={
          paymentStatus === 'free' ? 'Free' :
          paymentStatus === 'paid' ? `Paid — AED ${amountAed || '0'}` :
          'Pending'
        } />
        {adminNotes && <ReviewRow label="Notes" value={adminNotes} />}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <span className="text-sm text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
