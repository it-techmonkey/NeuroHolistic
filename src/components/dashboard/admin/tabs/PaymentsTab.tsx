'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  CreditCard, CheckCircle, XCircle, Loader2, Clock,
  User, Mail, DollarSign, RefreshCw, MessageSquare, Search, Banknote,
  Filter,
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
  paymentMethod?: string;
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

type MethodFilter = 'all' | 'ziina' | 'cash';

export default function PaymentsTab() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');
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
    const matchesSearch = !searchQuery || (() => {
      const q = searchQuery.toLowerCase();
      return p.clientName.toLowerCase().includes(q) || p.clientEmail.toLowerCase().includes(q) || p.therapistName.toLowerCase().includes(q) || 'cash ziina online'.includes(q);
    })();
    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalPendingAmount = payments.reduce((sum, p) => sum + p.pricePaid, 0);
  const ziinaPayments = payments.filter(p => p.paymentMethod !== 'cash');
  const cashPayments = payments.filter(p => p.paymentMethod === 'cash');
  const ziinaRevenue = ziinaPayments.reduce((sum, p) => sum + p.pricePaid, 0);
  const cashRevenue = cashPayments.reduce((sum, p) => sum + p.pricePaid, 0);

  const filterTabs: { key: MethodFilter; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All', count: payments.length, color: 'slate' },
    { key: 'ziina', label: 'Online (Ziina)', count: ziinaPayments.length, color: 'indigo' },
    { key: 'cash', label: 'Cash', count: cashPayments.length, color: 'emerald' },
  ];

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

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pending</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">AED {totalPendingAmount.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{payments.length} payment{payments.length !== 1 ? 's' : ''} awaiting verification</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-200 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-indigo-700" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Online (Ziina)</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">AED {ziinaRevenue.toLocaleString()}</p>
          <p className="text-xs text-indigo-400 mt-1">{ziinaPayments.length} payment{ziinaPayments.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-200 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Cash</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">AED {cashRevenue.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-1">{cashPayments.length} payment{cashPayments.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setMethodFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                methodFilter === tab.key
                  ? tab.key === 'cash'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : tab.key === 'ziina'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.key === 'cash' && <Banknote className="w-3 h-3" />}
              {tab.key === 'ziina' && <CreditCard className="w-3 h-3" />}
              {tab.key === 'all' && <Filter className="w-3 h-3" />}
              {tab.label}
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                methodFilter === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by client name, email, or therapist..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
        </div>
      </div>

      {/* Empty */}
      {filteredPayments.length === 0 && !loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchQuery || methodFilter !== 'all' ? 'No payments match your filters' : 'No pending payments'}
          </h3>
          <p className="text-sm text-slate-500">
            {searchQuery || methodFilter !== 'all' ? 'Try adjusting your search or filter' : 'All payments have been verified.'}
          </p>
        </div>
      )}

      {/* Payment Cards */}
      {filteredPayments.length > 0 && (
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const isCash = payment.paymentMethod === 'cash';
            return (
              <div key={payment.id} className={`bg-white border rounded-xl p-5 transition-all hover:shadow-md ${
                isCash ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-indigo-300'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar with method indicator */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isCash ? 'bg-emerald-50' : 'bg-indigo-50'
                      }`}>
                        {isCash
                          ? <Banknote className="w-5 h-5 text-emerald-600" />
                          : <CreditCard className="w-5 h-5 text-indigo-600" />
                        }
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        isCash ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}>
                        {isCash
                          ? <Banknote className="w-2 h-2 text-white" />
                          : <CreditCard className="w-2 h-2 text-white" />
                        }
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900">{payment.clientName}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isCash
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {isCash ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                          {isCash ? 'Cash' : 'Ziina'}
                        </span>
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
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200">
            <div className={`px-6 py-4 border-b ${
              selectedPayment.paymentMethod === 'cash' ? 'border-emerald-100 bg-emerald-50' : 'border-indigo-100 bg-indigo-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedPayment.paymentMethod === 'cash' ? 'bg-emerald-100' : 'bg-indigo-100'
                }`}>
                  {selectedPayment.paymentMethod === 'cash'
                    ? <Banknote className="w-5 h-5 text-emerald-600" />
                    : <CreditCard className="w-5 h-5 text-indigo-600" />
                  }
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Review Payment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedPayment.paymentMethod === 'cash' ? 'Cash payment — verify receipt before activating' : 'Online payment via Ziina'}
                  </p>
                </div>
              </div>
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

              <div className={`rounded-xl p-4 space-y-3 ${
                selectedPayment.paymentMethod === 'cash' ? 'bg-emerald-50' : 'bg-slate-50'
              }`}>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-400">Amount</p><p className="font-bold text-lg text-emerald-600">AED {selectedPayment.pricePaid.toLocaleString()}</p></div>
                  <div><p className="text-slate-400">Sessions</p><p className="font-medium text-slate-900">{selectedPayment.totalSessions}</p></div>
                  <div><p className="text-slate-400">Method</p>
                    <p className="font-medium text-slate-900 flex items-center gap-1.5">
                      {selectedPayment.paymentMethod === 'cash' ? (
                        <><Banknote className="w-4 h-4 text-emerald-600" /> Cash Payment</>
                      ) : (
                        <><CreditCard className="w-4 h-4 text-indigo-600" /> Online (Ziina)</>
                      )}
                    </p>
                  </div>
                  <div><p className="text-slate-400">Submitted</p><p className="font-medium text-slate-900 text-xs">{formatDate(selectedPayment.paymentSubmittedAt || selectedPayment.createdAt)}</p></div>
                </div>
                {selectedPayment.paymentMethod === 'cash' && (
                  <div className="bg-emerald-100/50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-emerald-700 font-medium">
                      Confirm that cash payment has been received before verifying this payment.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Notes (optional)
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder={selectedPayment.paymentMethod === 'cash' ? 'e.g. Cash received at office, receipt #1234...' : 'Add notes about this payment verification...'}
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
