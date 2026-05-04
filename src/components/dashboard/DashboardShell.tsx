'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  UserCog,
  TrendingUp,
  ClipboardList,
  Eye,
  FileText,
  Upload,
  BarChart3,
} from 'lucide-react';
import LogoutButton from '@/components/ui/LogoutButton';
import DashboardHomeLogo from '@/components/dashboard/DashboardHomeLogo';

type Role = 'client' | 'therapist' | 'admin';

interface DashboardShellProps {
  children: ReactNode;
  role: Role;
  userName?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NAV_CONFIG: Record<Role, { label: string; tabs: { key: string; label: string; icon: ReactNode }[] }> = {
  client: {
    label: 'Client Portal',
    tabs: [
      { key: 'sessions', label: 'Sessions', icon: <CalendarDays className="w-4 h-4" /> },
      { key: 'materials', label: 'Materials', icon: <BookOpen className="w-4 h-4" /> },
      { key: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
      { key: 'account', label: 'Account', icon: <UserCog className="w-4 h-4" /> },
    ],
  },
  therapist: {
    label: 'Therapist Workspace',
    tabs: [
      { key: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
      { key: 'sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
      { key: 'forms', label: 'Forms', icon: <FileText className="w-4 h-4" /> },
      { key: 'uploads', label: 'Uploads', icon: <Upload className="w-4 h-4" /> },
      { key: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
  admin: {
    label: 'Admin Dashboard',
    tabs: [
      { key: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
      { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
      { key: 'bookings', label: 'Bookings', icon: <CalendarDays className="w-4 h-4" /> },
      { key: 'programs', label: 'Programs', icon: <ClipboardList className="w-4 h-4" /> },
      { key: 'sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
    ],
  },
};

export default function DashboardShell({
  children,
  role,
  userName,
  activeTab,
  onTabChange,
}: DashboardShellProps) {
  const config = NAV_CONFIG[role];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DashboardHomeLogo className="mr-1" />
            <Link href="/" className="text-lg font-semibold text-[#2B2F55] tracking-tight">
              NeuroHolistic
            </Link>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {config.label}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {config.tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange?.(tab.key)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-[#2B2F55] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {userName && (
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {userName}
              </span>
            )}
            <LogoutButton className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors" />
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
          {config.tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${isActive
                    ? 'bg-[#2B2F55] text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        {children}
      </main>
    </div>
  );
}
