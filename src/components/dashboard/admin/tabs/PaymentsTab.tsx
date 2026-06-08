'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  CreditCard, CheckCircle, XCircle, Loader2, Clock,
  User, Mail, DollarSign, RefreshCw, MessageSquare, Search
} from 'lucide-react';

interface PendingPayment {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  programType: string;
  pricePaid: number;
  paymentId: string;
  paymentStatus: string;
  paymentSubmittedAt: string;
  therapistName: string;
  totalSessions: number;
  status: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  } catch { return dateStr; }
}

export default function PaymentsTab() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleAction = async (programId: string, action: 'accept' | 'reject') => {
    setActionLoading(programId);
    try {
      const res = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, action, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setPayments(prev => prev.filter(p => p.id !== programId));
      setSelectedPayment(null);
      setNotes('');
      setToast({
        message: action === 'accept' ? 'Payment verified — program activated' : 'Payment rejected — client notified',
        type: 'success',
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setToast({ message: err.message || 'Action failed', type: 'error' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.clientName.toLowerCase().includes(q) || p.clientEmail.toLowerCase().includes(q) || p.therapistName.toLowerCase().includes(q);
  });

  const totalPendingAmount = payments.reduce((sum, p) => sum + p.pricePaid, 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Payment Approvals</h2>
          <p className="text-sm text-slate-500">Review and verify pending payments</p>
        </div>
        <button onClick={fetchPayments} disabled={refreshing}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500">Total Amount</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">AED {totalPendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">Avg. Amount</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            AED {payments.length > 0 ? Math.round(totalPendingAmount / payments.length).toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by client name, email, or therapist..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
      </div>

      {/* Empty */}
      {filteredPayments.length === 0 && !loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchQuery ? 'No payments match your search' : 'No pending payments'}
          </h3>
          <p className="text-sm text-slate-500">
            {searchQuery ? 'Try a different search term' : 'All payments have been verified.'}
          </p>
        </div>
      )}

      {/* Payment Cards */}
      {filteredPayments.length > 0 && (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900">{payment.clientName}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 capitalize">
                        {payment.programType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{payment.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Therapist: {payment.therapistName}</span>
                      <span>{payment.totalSessions} sessions</span>
                      <span className="text-slate-400">
                        Submitted {formatRelativeTime(payment.paymentSubmittedAt || payment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">AED {payment.pricePaid.toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 mt-1">
                      <Clock className="w-3 h-3" />
                      Awaiting Verification
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(payment.id, 'accept')} disabled={actionLoading === payment.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1.5">
                      {actionLoading === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Verify
                    </button>
                    <button onClick={() => setSelectedPayment(payment)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Review Payment</h3>
              <p className="text-xs text-slate-500 mt-1">Approve or reject based on your internal verification.</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-400">Name</p><p className="font-medium text-slate-900">{selectedPayment.clientName}</p></div>
                  <div><p className="text-slate-400">Email</p><p className="font-medium text-slate-900 text-xs">{selectedPayment.clientEmail}</p></div>
                  <div><p className="text-slate-400">Program</p><p className="font-medium text-slate-900 capitalize">{selectedPayment.programType}</p></div>
                  <div><p className="text-slate-400">Therapist</p><p className="font-medium text-slate-900">{selectedPayment.therapistName}</p></div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-400">Amount</p><p className="font-bold text-lg text-emerald-600">AED {selectedPayment.pricePaid.toLocaleString()}</p></div>
                  <div><p className="text-slate-400">Sessions</p><p className="font-medium text-slate-900">{selectedPayment.totalSessions}</p></div>
                  <div className="col-span-2"><p className="text-slate-400">Submitted</p><p className="font-medium text-slate-900 text-xs">{formatDate(selectedPayment.paymentSubmittedAt || selectedPayment.createdAt)}</p></div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Notes (optional)
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this payment verification..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setSelectedPayment(null); setNotes(''); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => handleAction(selectedPayment.id, 'reject')} disabled={actionLoading === selectedPayment.id}
                className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {actionLoading === selectedPayment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject
              </button>
              <button onClick={() => handleAction(selectedPayment.id, 'accept')} disabled={actionLoading === selectedPayment.id}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {actionLoading === selectedPayment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Verify & Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
