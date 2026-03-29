import { useState, useMemo } from 'react';
import { Users, Search, Filter, UserCheck, Shield, Calendar } from 'lucide-react';
import type { AdminData } from './types';

interface UsersTabProps {
  data: AdminData;
}

type RoleFilter = 'all' | 'client' | 'therapist' | 'admin';

const roleBadgeClasses: Record<string, string> = {
  client: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  therapist: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  admin: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

const roleLabels: Record<string, string> = {
  client: 'Client',
  therapist: 'Therapist',
  admin: 'Admin',
};

export default function UsersTab({ data }: UsersTabProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const filteredUsers = useMemo(() => {
    return data.users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        user.fullName?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [data.users, search, roleFilter]);

  const stats = useMemo(() => {
    const counts = { client: 0, therapist: 0, admin: 0 };
    data.users.forEach((u) => {
      if (u.role in counts) counts[u.role as keyof typeof counts]++;
    });
    return counts;
  }, [data.users]);

  const filters: { label: string; value: RoleFilter; count?: number }[] = [
    { label: 'All', value: 'all', count: data.users.length },
    { label: 'Clients', value: 'client', count: stats.client },
    { label: 'Therapists', value: 'therapist', count: stats.therapist },
    { label: 'Admins', value: 'admin', count: stats.admin },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Users</h2>
          <p className="text-sm text-slate-400">
            Manage platform users and their roles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl font-semibold text-white font-mono">{data.users.length}</p>
        </div>
        <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Clients</span>
          </div>
          <p className="text-2xl font-semibold text-blue-400 font-mono">{stats.client}</p>
        </div>
        <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Therapists</span>
          </div>
          <p className="text-2xl font-semibold text-violet-400 font-mono">{stats.therapist}</p>
        </div>
        <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Admins</span>
          </div>
          <p className="text-2xl font-semibold text-amber-400 font-mono">{stats.admin}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111827] border border-white/5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-white/10 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-[#111827] border border-white/5 rounded-lg p-1">
          <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                roleFilter === f.value
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
              {f.count !== undefined && (
                <span className="ml-1 font-mono text-[10px] opacity-60">{f.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Country
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Programs
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Assigned Therapist
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No users found</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Try adjusting your search or filter criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">
                        {user.fullName || 'Unnamed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${roleBadgeClasses[user.role] || 'bg-slate-500/15 text-slate-400 border-slate-500/20'}`}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {user.country || '—'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-300">
                      {user.bookingsCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-300">
                      {user.programsCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {user.assignedTherapist ? (
                        <span className="text-slate-300">
                          {user.assignedTherapist.name}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing{' '}
            <span className="font-mono text-slate-300">{filteredUsers.length}</span>{' '}
            of{' '}
            <span className="font-mono text-slate-300">{data.users.length}</span>{' '}
            users
          </span>
        </div>
      )}
    </div>
  );
}
