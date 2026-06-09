'use client';

import { useState, useMemo } from 'react';
import { Users, Search, Filter, UserCheck, Shield, Calendar, Loader2, UserCog } from 'lucide-react';
import type { AdminData } from './types';

type RoleFilter = 'all' | 'client' | 'therapist' | 'admin';

const roleBadgeClasses: Record<string, string> = {
  client: 'bg-blue-50 text-blue-700 border border-blue-200',
  therapist: 'bg-violet-50 text-violet-700 border border-violet-200',
  admin: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function UsersTab({ data }: { data: AdminData }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      setToast({ message: `Role updated to ${newRole}`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
      window.location.reload();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update role', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUpdatingRole(null);
    }
  };

  const filters: { label: string; value: RoleFilter; count?: number }[] = [
    { label: 'All', value: 'all', count: data.users.length },
    { label: 'Clients', value: 'client', count: stats.client },
    { label: 'Therapists', value: 'therapist', count: stats.therapist },
    { label: 'Admins', value: 'admin', count: stats.admin },
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

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Users</h2>
        <p className="text-sm text-slate-500">Manage platform users and their roles</p>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
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
                    <td className="px-4 py-3 text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <div className="flex items-center gap-1">
                          {user.role === 'client' && (
                            <button onClick={() => handleRoleChange(user.id, 'therapist')} disabled={updatingRole === user.id}
                              className="text-[11px] text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50">
                              {updatingRole === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Make Therapist'}
                            </button>
                          )}
                          {user.role === 'therapist' && (
                            <button onClick={() => handleRoleChange(user.id, 'client')} disabled={updatingRole === user.id}
                              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">
                              {updatingRole === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Make Client'}
                            </button>
                          )}
                        </div>
                      )}
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
    </div>
  );
}
