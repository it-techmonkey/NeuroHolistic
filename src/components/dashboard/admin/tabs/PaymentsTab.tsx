'use client';

import { useState, useCallback } from 'react';
import {
  CreditCard, CheckCircle, XCircle, Loader2, Clock,
  User, Mail, DollarSign, Calendar, RefreshCw, MessageSquare,
  Search, Filter
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

interface PaymentsTabProps {
  initialPayments?: PendingPayment[];
}

const programTypeColors: Record<string, string> = {
  private: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  group: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  academy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

export default function PaymentsTab({ initialPayments = [] }: PaymentsTabProps) {
  const [payments, setPayments] = useState<PendingPayment[]>(initialPayments);
  const [loading, setLoading] = useState(false);
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
        message: action === 'accept'
          ? 'Payment verified — program activated'
          : 'Payment rejected — client notified',
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
    return (
      p.clientName.toLowerCase().includes(q) ||
      p.clientEmail.toLowerCase().includes(q) ||
      p.therapistName.toLowerCase().includes(q)
    );
  });

  const pendingCount = payments.length;
  const totalPendingAmount = payments.reduce((sum, p) => sum + p.pricePaid, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg border transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Pending Payments</h2>
        </div>
        <button
          onClick={fetchPayments}
          disabled={refreshing}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#111827] border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Pending</span>
          </div>
          <p className="text-2xl font-semibold text-white font-mono">{pendingCount}</p>
        </div>
        <div className="bg-[#111827] border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Total Amount</span>
          </div>
          <p className="text-2xl font-semibold text-white font-mono">
            AED {totalPendingAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#111827] border border-white/5 rounded-lg p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Avg. Amount</span>
          </div>
          <p className="text-2xl font-semibold text-white font-mono">
            AED {pendingCount > 0 ? Math.round(totalPendingAmount / pendingCount).toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by client name, email, or therapist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-white/5 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && !loading && (
        <div className="bg-[#111827] border border-white/5 rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery ? 'No payments match your search' : 'No pending payments'}
          </h3>
          <p className="text-sm text-slate-400">
            {searchQuery
              ? 'Try a different search term'
              : 'All payments have been verified. New submissions will appear here.'}
          </p>
        </div>
      )}

      {/* Payment Cards */}
      {filteredPayments.length > 0 && (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all"
            >
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Client Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white">{payment.clientName}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          programTypeColors[payment.programType] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}>
                          {payment.programType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Mail className="w-3 h-3" />
                          {payment.clientEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Therapist: {payment.therapistName}</span>
                        <span>{payment.totalSessions} sessions</span>
                        <span className="text-slate-600">
                          Submitted {formatRelativeTime(payment.paymentSubmittedAt || payment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-xl font-semibold text-white font-mono">
                        AED {payment.pricePaid.toLocaleString()}
                      </p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 mt-1">
                        <Clock className="w-3 h-3" />
                        Awaiting Verification
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Review Payment</h3>
              <p className="text-xs text-slate-400 mt-1">Verify payment details before accepting</p>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Client Details */}
              <div className="bg-[#0C1222] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Name</p>
                    <p className="text-white font-medium">{selectedPayment.clientName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="text-white font-medium text-xs">{selectedPayment.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Program Type</p>
                    <p className="text-white font-medium capitalize">{selectedPayment.programType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Therapist</p>
                    <p className="text-white font-medium">{selectedPayment.therapistName}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-[#0C1222] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Amount</p>
                    <p className="text-emerald-400 font-semibold text-lg font-mono">
                      AED {selectedPayment.pricePaid.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Sessions</p>
                    <p className="text-white font-medium">{selectedPayment.totalSessions} sessions</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500">Submitted</p>
                    <p className="text-white font-medium text-xs">
                      {formatDate(selectedPayment.paymentSubmittedAt || selectedPayment.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this payment verification..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0C1222] border border-white/5 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                />
              </div>

              {/* Verification Reminder */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-400">
                  <strong>Reminder:</strong> Please verify the payment on your payment platform (Ziina) before accepting. Check that the amount matches the expected price for this program type.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-white/5 flex gap-3">
              <button
                onClick={() => { setSelectedPayment(null); setNotes(''); }}
                className="flex-1 px-4 py-2.5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(selectedPayment.id, 'reject')}
                disabled={actionLoading === selectedPayment.id}
                className="flex-1 px-4 py-2.5 bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === selectedPayment.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </button>
              <button
                onClick={() => handleAction(selectedPayment.id, 'accept')}
                disabled={actionLoading === selectedPayment.id}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === selectedPayment.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 text-center">
        {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} pending verification
      </p>
    </div>
  );
}
