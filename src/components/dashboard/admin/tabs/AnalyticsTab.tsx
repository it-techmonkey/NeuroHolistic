import { BarChart3, TrendingUp, Globe, Target, Mail, AlertTriangle, Users, PieChart } from "lucide-react";
import type { AdminData } from "./types";

export default function AnalyticsTab({ data }: { data: AdminData }) {
  const maxRevenue = Math.max(...data.monthlyRevenue.map((d) => d.revenue), 1);
  const maxBookings = Math.max(...data.monthlyBookings.map((d) => d.total), 1);
  const maxAssessment = Math.max(...data.assessmentTrends.map((d) => d.avgScore), 1);
  const maxCountryCount = Math.max(...data.countryDistribution.map((d) => d.count), 1);
  const totalBookingTypes = Object.values(data.bookingTypeCounts).reduce((a, b) => a + b, 0) || 1;
  const totalNotifications = data.notificationStats.total || 1;

  const bookingTypes = Object.entries(data.bookingTypeCounts);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Conversion Rate" value={`${data.kpis.conversionRate.toFixed(1)}%`} icon={<Target className="w-5 h-5" />} accent="emerald" />
        <KpiCard label="Completion Rate" value={`${data.kpis.sessionCompletionRate.toFixed(1)}%`} icon={<TrendingUp className="w-5 h-5" />} accent="blue" />
        <KpiCard label="No-Show Rate" value={`${data.kpis.noShowRate.toFixed(1)}%`} icon={<AlertTriangle className="w-5 h-5" />} accent="amber" />
        <KpiCard label="Cancel Rate" value={`${data.kpis.cancelRate.toFixed(1)}%`} icon={<AlertTriangle className="w-5 h-5" />} accent="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Monthly Revenue</h3>
          <div className="flex items-end gap-2 h-48">
            {data.monthlyRevenue.map((item, i) => {
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {item.revenue > 0 ? `${(item.revenue / 1000).toFixed(0)}k` : '—'}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full rounded-t-md bg-[#2B2F55] transition-all duration-500" style={{ height: `${Math.max(height, 4)}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Bookings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Monthly Bookings</h3>
          <div className="flex items-end gap-2 h-48">
            {data.monthlyBookings.map((item, i) => {
              const totalH = (item.total / maxBookings) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">{item.total}</span>
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full rounded-t-md bg-[#2B2F55] transition-all duration-500" style={{ height: `${Math.max(totalH, 4)}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Trends */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Assessment Trends</h3>
          <div className="flex items-end gap-2 h-40">
            {data.assessmentTrends.map((item, i) => {
              const height = (item.avgScore / maxAssessment) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">{item.avgScore.toFixed(1)}</span>
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full rounded-t-md bg-violet-500 transition-all duration-500" style={{ height: `${Math.max(height, 4)}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400">{item.month}</span>
                  <span className="text-[10px] text-slate-400">n={item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            Country Distribution
          </h3>
          <div className="space-y-3">
            {data.countryDistribution.map((item, i) => {
              const width = (item.count / maxCountryCount) * 100;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{item.country}</span>
                    <span className="text-sm text-slate-500 font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#2B2F55] transition-all duration-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Types */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Booking Types</h3>
          <div className="space-y-4">
            {bookingTypes.map(([type, count]) => {
              const pct = (count / totalBookingTypes) * 100;
              const label = type === "free_consultation" ? "Free Consultation" : type === "program" ? "Program" : type;
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{label}</span>
                    <span className="text-sm text-slate-500 font-medium">{count} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#2B2F55] transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            Notifications
          </h3>
          <div className="space-y-4">
            {[
              { label: "Sent", value: data.notificationStats.sent, color: "bg-emerald-500" },
              { label: "Failed", value: data.notificationStats.failed, color: "bg-red-500" },
              { label: "Pending", value: data.notificationStats.pending, color: "bg-amber-500" },
            ].map((item) => {
              const pct = (item.value / totalNotifications) * 100;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <span className="text-sm text-slate-500 font-medium">{item.value} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-900">{data.notificationStats.byEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">WhatsApp</span>
                <span className="font-medium text-slate-900">{data.notificationStats.byWhatsApp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leads */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Leads
          </h3>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-4xl font-bold text-slate-900">{data.leads.length}</p>
            <p className="text-sm text-slate-500 mt-2">Total Leads</p>
            <p className="text-xs text-slate-400 mt-1">{data.kpis.totalLeads} generated</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, accent }: {
  label: string; value: string; icon: React.ReactNode; accent: string;
}) {
  const accentMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentMap[accent] || 'text-slate-600 bg-slate-50'}`}>
          {icon}
        </div>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
