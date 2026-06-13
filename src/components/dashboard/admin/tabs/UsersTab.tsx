'use client';

import { useState, useMemo } from 'react';
import { Users, Search, Filter, UserCheck, Shield, GraduationCap, Key, X, Copy, Check } from 'lucide-react';
import type { AdminData } from './types';

type RoleFilter = 'all' | 'client' | 'therapist' | 'admin';

const roleBadgeClasses: Record<string, string> = {
  client: 'bg-blue-50 text-blue-700 border border-blue-200',
  therapist: 'bg-violet-50 text-violet-700 border border-violet-200',
  admin: 'bg-amber-50 text-amber-700 border border-amber-200',
};

interface ResetResult {
  tempPassword: string;
  user: { id: string; email: string; name: string; role: string };
}

export default function UsersTab({ data }: { data: AdminData }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string; email: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [resetError, setResetError] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredUsers = useMemo(() => {
    return data.users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q || user.fullName?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [data.users, search, roleFilter]);

  const stats = useMemo(() => {
    const counts = { client: 0, therapist: 0, admin: 0 };
    data.users.forEach((u) => { if (u.role in counts) counts[u.role as keyof typeof counts]++; });
    return counts;
  }, [data.users]);

  const filters: { label: string; value: RoleFilter; count?: number }[] = [
    { label: 'All', value: 'all', count: data.users.length },
    { label: 'Clients', value: 'client', count: stats.client },
    { label: 'Therapists', value: 'therapist', count: stats.therapist },
    { label: 'Admins', value: 'admin', count: stats.admin },
  ];

  const openResetModal = (user: { id: string; fullName?: string; email: string }) => {
    setResetTarget({ id: user.id, name: user.fullName || 'Unnamed', email: user.email });
    setResetResult(null);
    setResetError('');
    setCopied(false);
    setResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetLoading(true);
    setResetError('');
    setResetResult(null);

    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setResetResult(data);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const copyPassword = () => {
    if (resetResult?.tempPassword) {
      navigator.clipboard.writeText(resetResult.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Users</h2>
        <p className="text-sm text-slate-500">View and manage platform users</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-500">Total</span></div>
          <p className="text-2xl font-bold text-slate-900">{data.users.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><UserCheck className="w-4 h-4 text-blue-500" /><span className="text-xs text-slate-500">Clients</span></div>
          <p className="text-2xl font-bold text-blue-600">{stats.client}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Shield className="w-4 h-4 text-violet-500" /><span className="text-xs text-slate-500">Therapists</span></div>
          <p className="text-2xl font-bold text-violet-600">{stats.therapist}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Shield className="w-4 h-4 text-amber-500" /><span className="text-xs text-slate-500">Admins</span></div>
          <p className="text-2xl font-bold text-amber-600">{stats.admin}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          {filters.map((f) => (
            <button key={f.value} onClick={() => setRoleFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === f.value ? 'bg-[#2B2F55] text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}>
              {f.label}{f.count !== undefined && <span className="ml-1 text-[10px] opacity-60">{f.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Country</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Bookings</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Programs</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{user.fullName || 'Unnamed'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${roleBadgeClasses[user.role] || 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.country || '—'}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{user.bookingsCount ?? 0}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{user.programsCount ?? 0}</td>
                    <td className="px-4 py-3">
                      {user.programTypes === 'academy' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <GraduationCap className="w-3 h-3" />Academy
                        </span>
                      )}
                      {user.programTypes === 'therapy' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Therapy
                        </span>
                      )}
                      {user.programTypes === 'both' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Both
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openResetModal(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                        title={`Reset password for ${user.fullName || user.email}`}
                      >
                        <Key className="w-3 h-3" />
                        Reset
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          Showing {filteredUsers.length} of {data.users.length} users
        </p>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !resetLoading && setResetModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500 mt-0.5">{resetTarget.name} &mdash; {resetTarget.email}</p>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                disabled={resetLoading}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {!resetResult ? (
                <>
                  <p className="text-sm text-slate-600">
                    This will generate a new temporary password for this user. Share it securely with them.
                  </p>

                  {resetError && (
                    <div className="text-xs text-red-600 bg-red-50 p-3 border-l-2 border-red-500">
                      {resetError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setResetModalOpen(false)}
                      disabled={resetLoading}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={resetLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      {resetLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      {resetLoading ? 'Generating...' : 'Generate New Password'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-emerald-800">
                      New password generated successfully
                    </p>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-emerald-200 px-3 py-2.5">
                      <code className="flex-1 text-sm font-mono text-slate-900 break-all select-all">
                        {resetResult.tempPassword}
                      </code>
                      <button
                        onClick={copyPassword}
                        className="shrink-0 p-1.5 text-slate-400 hover:text-emerald-600 rounded-md transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-emerald-700">
                      Share this password securely with {resetTarget.name}. They can change it from their profile after logging in.
                    </p>
                  </div>

                  <button
                    onClick={() => setResetModalOpen(false)}
                    className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#2B2F55] rounded-xl hover:bg-[#1E2140] transition-colors"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
