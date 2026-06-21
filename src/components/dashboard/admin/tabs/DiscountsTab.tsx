'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Percent, Loader2, Search, Trash2, UserPlus, X, CheckCircle,
  Mail, Calendar, MessageSquare, RefreshCw
} from 'lucide-react';
import { STANDARD_PRICING, GROUP_PRICING } from '@/lib/payments/pricing';

const DISCOUNT_TIERS = [10, 15, 20] as const;

interface DiscountRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  discountPercent: number;
  assignedBy: string;
  assignedByName: string;
  reason: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientOption {
  id: string;
  full_name: string | null;
  email: string;
}

const discountColors: Record<number, string> = {
  10: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  15: 'bg-amber-50 text-amber-700 border border-amber-200',
  20: 'bg-rose-50 text-rose-700 border border-rose-200',
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function DiscountsTab() {
  const [discounts, setDiscounts] = useState<DiscountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [search, setSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [selectedPercent, setSelectedPercent] = useState<number>(10);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDiscounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/discounts');
      if (!res.ok) throw new Error('Failed to load discounts');
      const data = await res.json();
      setDiscounts(data.discounts ?? []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load discounts', 'error');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDiscounts().finally(() => setLoading(false));
  }, [fetchDiscounts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDiscounts();
    setRefreshing(false);
  };

  const searchClients = async (query: string) => {
    if (query.length < 2) {
      setClientOptions([]);
      return;
    }
    setSearchingClients(true);
    try {
      const res = await fetch(`/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        const users = Array.isArray(data) ? data : (data.users ?? []);
        const q = query.toLowerCase();
        const filtered = users.filter((u: any) =>
          u.role === 'client' && (
            u.full_name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
          )
        );
        setClientOptions(filtered);
      }
    } catch {
      // ignore
    } finally {
      setSearchingClients(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedClient) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          discountPercent: selectedPercent,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign discount');

      showToast(`${selectedPercent}% discount assigned to ${selectedClient.full_name || selectedClient.email}`, 'success');
      setShowAssignModal(false);
      setSelectedClient(null);
      setSelectedPercent(10);
      setReason('');
      setClientSearch('');
      setClientOptions([]);
      await fetchDiscounts();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign discount', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (clientId: string, clientName: string) => {
    if (!confirm(`Remove discount from ${clientName}?`)) return;
    setRemovingId(clientId);
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove discount');
      }

      showToast(`Discount removed from ${clientName}`, 'success');
      await fetchDiscounts();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove discount', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredDiscounts = discounts.filter(d => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.clientName.toLowerCase().includes(q) ||
      d.clientEmail.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Percent className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Client Discounts</h2>
            <p className="text-sm text-slate-400">
              Assign 10%, 15%, or 20% discounts to special clients
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Assign Discount
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {DISCOUNT_TIERS.map(pct => (
          <div key={pct} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">{pct}% Discount</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900 font-mono">
              {discounts.filter(d => d.discountPercent === pct && d.isActive).length}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by client name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />
      </div>

      {/* Discounts Table */}
      {filteredDiscounts.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Percent className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {discounts.length === 0
              ? 'No discounts assigned yet. Click "Assign Discount" to get started.'
              : 'No discounts match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDiscounts.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{d.clientName}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {d.clientEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${discountColors[d.discountPercent] || 'bg-slate-100 text-slate-600'}`}>
                      <Percent className="w-3 h-3" />
                      {d.discountPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.reason ? (
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        {d.reason}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{d.assignedByName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(d.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemove(d.clientId, d.clientName)}
                      disabled={removingId === d.clientId}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove discount"
                    >
                      {removingId === d.clientId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Discount Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Assign Discount</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedClient(null);
                  setSelectedPercent(10);
                  setReason('');
                  setClientSearch('');
                  setClientOptions([]);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Client</label>
              {selectedClient ? (
                <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-indigo-900">{selectedClient.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-indigo-600">{selectedClient.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setClientSearch('');
                    }}
                    className="p-1 text-indigo-400 hover:text-indigo-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={clientSearch}
                    onChange={e => {
                      setClientSearch(e.target.value);
                      searchClients(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                  {searchingClients && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                  )}
                  {clientOptions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {clientOptions.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedClient(c);
                            setClientOptions([]);
                            setClientSearch('');
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                        >
                          <p className="text-sm font-medium text-slate-900">{c.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Discount Tiers */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Discount Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {DISCOUNT_TIERS.map(pct => (
                  <button
                    key={pct}
                    onClick={() => setSelectedPercent(pct)}
                    className={`py-3 rounded-xl text-center font-bold transition-all ${
                      selectedPercent === pct
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (optional)</label>
              <input
                type="text"
                placeholder="e.g. VIP client, referral, loyalty..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>

            {/* Preview */}
            {selectedClient && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Preview — Example pricing with {selectedPercent}% discount:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Private (Full):</span>{' '}
                    <span className="line-through text-slate-400">{STANDARD_PRICING.fullProgram.toLocaleString()}</span>{' '}
                    <span className="font-semibold text-indigo-600">{Math.round(STANDARD_PRICING.fullProgram * (1 - selectedPercent / 100)).toLocaleString()} AED</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Group (Full):</span>{' '}
                    <span className="line-through text-slate-400">{GROUP_PRICING.fullProgram.toLocaleString()}</span>{' '}
                    <span className="font-semibold text-indigo-600">{Math.round(GROUP_PRICING.fullProgram * (1 - selectedPercent / 100)).toLocaleString()} AED</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedClient(null);
                  setSelectedPercent(10);
                  setReason('');
                  setClientSearch('');
                  setClientOptions([]);
                }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedClient || submitting}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Assign Discount
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


