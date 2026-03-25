'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/supabase/database.types';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  MoreHorizontal 
} from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

const supabase = createServiceClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getBookings() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

async function getProgramData(programId: string) {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error('Error fetching program:', error);
    return null;
  }
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatBookingTime(dateString: string) {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }

function formatDateTime(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export default async function AdminBookingsPage() {
  // Require authentication and therapist role
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await authClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'therapist') {
    redirect('/dashboard');
  }

  const bookings = await getBookings();

  // Fetch program data for paid bookings
  const bookingsWithPrograms = await Promise.all(
    bookings.map(async (booking) => ({
      ...booking,
      program: booking.program_id ? await getProgramData(booking.program_id) : null,
    }))
  );

  // Calculate stats
  const consultationCount = bookingsWithPrograms.filter(b => b.type === 'free_consultation').length;
  const programCount = bookingsWithPrograms.filter(b => b.type === 'program').length;

  return (
    <FadeIn className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#2B2F55] selection:text-white">
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 bg-[#2B2F55]" />
             <span className="text-xs font-medium tracking-wide text-slate-900">ADMINISTRATION</span>
             <span className="text-xs text-slate-300">/</span>
             <span className="text-xs font-medium tracking-wide text-slate-500">BOOKINGS</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">{programCount} Programs</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">{consultationCount} Consultations</span>
             </div>
             <div className="h-4 w-px bg-slate-200" />
             <span className="text-[10px] uppercase tracking-wider text-slate-900 font-medium">{bookingsWithPrograms.length} Total</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-[1800px] mx-auto">
        
        {/* ── CONTROLS ── */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-slate-100 pb-6">
           <div>
              <h1 className="text-3xl font-light text-slate-900 mb-2">Session Registry</h1>
              <p className="text-sm text-slate-500 font-light">Manage upcoming consultations and program sessions.</p>
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="SEARCH REGISTRY..." 
                   className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 text-[10px] uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:border-slate-300 transition-colors"
                 />
              </div>
              <button className="px-4 py-2 border border-slate-200 text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2">
                 <Filter className="w-3 h-3" />
                 Filter
              </button>
              <button className="px-4 py-2 bg-[#2B2F55] text-white border border-[#2B2F55] text-[10px] uppercase tracking-widest hover:bg-[#1E2140] transition-colors">
                 Export
              </button>
           </div>
        </div>

        {/* ── TABLE ── */}
        <div className="overflow-x-auto">
          {bookingsWithPrograms.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-slate-400 font-medium">Date/Time</th>
                  <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-slate-400 font-medium">Client</th>
                  <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-slate-400 font-medium">Therapist</th>
                  <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-slate-400 font-medium">Type</th>
                  <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-slate-400 font-medium">Program Status</th>
                  <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-slate-400 font-medium text-right">Created</th>
                  <th className="py-4 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookingsWithPrograms.map((booking) => {
                  const isPaid = booking.type === 'program';
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 group transition-colors">
                      <td className="py-4 px-4">
                         <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{formatDate(booking.date)}</span>
                            <span className="text-xs text-slate-500 font-light flex items-center gap-1.5">
                               <Clock className="w-3 h-3" />
                               {booking.time}
                            </span>
                         </div>
                      </td>
                      <td className="py-4 px-4">
                         <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{booking.name}</span>
                            <span className="text-xs text-slate-400 font-light">{booking.email}</span>
                         </div>
                      </td>
                      <td className="py-4 px-4">
                         <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1">
                           {booking.therapist_name}
                         </span>
                      </td>
                      <td className="py-4 px-4">
                         <span className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${
                           booking.type === 'free_consultation'
                             ? 'bg-blue-50 text-blue-900 border-blue-100'
                             : 'bg-emerald-50 text-emerald-900 border-emerald-100'
                         }`}>
                           {booking.type === 'free_consultation' ? 'Consultation' : 'Program Session'}
                         </span>
                      </td>
                      <td className="py-4 px-4 w-48">
                        {isPaid && booking.program ? (
                          <div className="flex items-center gap-3">
                             <span className="text-xs font-mono text-slate-500 w-8">{booking.program.used_sessions}/{booking.program.total_sessions}</span>
                             <div className="flex-1 h-px bg-slate-200">
                                <div className="h-px bg-[#2B2F55]" style={{ width: `${(booking.program.used_sessions / booking.program.total_sessions) * 100}%` }} />
                             </div>
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider text-slate-300">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                         <span className="text-xs text-slate-400 font-mono">{formatDateTime(booking.created_at)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                         <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#2B2F55] transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-200 bg-slate-50/50">
               <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                  <Calendar className="w-5 h-5" />
               </div>
               <p className="text-slate-900 font-medium">No active bookings</p>
               <p className="text-slate-400 text-sm font-light mt-1">Registry is currently empty.</p>
            </div>
          )}
        </div>
      </main>
    </FadeIn>
  );
}
