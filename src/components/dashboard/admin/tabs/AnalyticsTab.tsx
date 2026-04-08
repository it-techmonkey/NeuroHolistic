import { BarChart3, TrendingUp, Globe, Target, Mail, AlertTriangle, Users, PieChart } from "lucide-react";
import type { AdminData } from "./types";

interface AnalyticsTabProps {
  data: AdminData;
}

export default function AnalyticsTab({ data }: AnalyticsTabProps) {
  const maxRevenue = Math.max(...data.monthlyRevenue.map((d) => d.revenue), 1);
  const maxBookings = Math.max(...data.monthlyBookings.map((d) => d.total), 1);
  const maxAssessment = Math.max(...data.assessmentTrends.map((d) => d.avgScore), 1);
  const maxCountryCount = Math.max(...data.countryDistribution.map((d) => d.count), 1);
  const totalBookingTypes = Object.values(data.bookingTypeCounts).reduce((a, b) => a + b, 0) || 1;
  const totalNotifications = data.notificationStats.total || 1;

  const bookingTypes = Object.entries(data.bookingTypeCounts);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-slate-500">Conversion Rate</span>
          </div>
          <p className="font-mono text-3xl font-bold text-emerald-400">
            {data.kpis.conversionRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-slate-500">Completion Rate</span>
          </div>
          <p className="font-mono text-3xl font-bold text-emerald-400">
            {data.kpis.sessionCompletionRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-500">No-Show Rate</span>
          </div>
          <p className="font-mono text-3xl font-bold text-amber-400">
            {data.kpis.noShowRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-slate-500">Cancel Rate</span>
          </div>
          <p className="font-mono text-3xl font-bold text-red-400">
            {data.kpis.cancelRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h3 className="text-slate-900 font-semibold">Monthly Revenue</h3>
          </div>
          <div className="flex items-end gap-2 h-48">
            {data.monthlyRevenue.map((item, i) => {
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-slate-500">
                    {(item.revenue / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 truncate w-full text-center">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h3 className="text-slate-900 font-semibold">Monthly Bookings</h3>
          </div>
          <div className="flex items-end gap-2 h-48">
            {data.monthlyBookings.map((item, i) => {
              const totalH = (item.total / maxBookings) * 100;
              const completedH = (item.completed / maxBookings) * 100;
              const cancelledH = (item.cancelled / maxBookings) * 100;
              const noShowH = (item.noShow / maxBookings) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-slate-500">{item.total}</span>
                  <div className="w-full relative flex-1 flex items-end gap-[2px]">
                    <div
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-500"
                      style={{ height: `${totalH}%` }}
                    />
                    <div
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500"
                      style={{ height: `${completedH}%` }}
                    />
                    <div
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-red-600 to-red-400 transition-all duration-500"
                      style={{ height: `${cancelledH}%` }}
                    />
                    <div
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500"
                      style={{ height: `${noShowH}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 truncate w-full text-center">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-violet-500" />
              <span className="text-[11px] text-slate-500">Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-emerald-500" />
              <span className="text-[11px] text-slate-500">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-red-500" />
              <span className="text-[11px] text-slate-500">Cancelled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-amber-500" />
              <span className="text-[11px] text-slate-500">No-Show</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <h3 className="text-slate-900 font-semibold">Assessment Trends</h3>
          </div>
          <div className="flex items-end gap-2 h-40">
            {data.assessmentTrends.map((item, i) => {
              const height = (item.avgScore / maxAssessment) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-slate-500">
                    {item.avgScore.toFixed(1)}
                  </span>
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-fuchsia-500 transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 truncate w-full text-center">
                    {item.month}
                  </span>
                  <span className="text-[9px] text-slate-500">n={item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-violet-400" />
            <h3 className="text-slate-900 font-semibold">Country Distribution</h3>
          </div>
          <div className="space-y-3">
            {data.countryDistribution.map((item, i) => {
              const width = (item.count / maxCountryCount) * 100;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{item.country}</span>
                    <span className="font-mono text-sm text-slate-600">{item.count}</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-400 transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="w-5 h-5 text-violet-400" />
            <h3 className="text-slate-900 font-semibold">Booking Types</h3>
          </div>
          <div className="space-y-4">
            {bookingTypes.map(([type, count]) => {
              const pct = (count / totalBookingTypes) * 100;
              const label = type === "free_consultation" ? "Free Consultation" : type === "program" ? "Program" : type;
              const color = type === "free_consultation" ? "from-emerald-600 to-emerald-400" : "from-indigo-600 to-violet-400";
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{label}</span>
                    <span className="font-mono text-sm text-slate-600">
                      {count} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Mail className="w-5 h-5 text-violet-400" />
            <h3 className="text-slate-900 font-semibold">Notification Stats</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Sent", value: data.notificationStats.sent, color: "from-emerald-600 to-emerald-400" },
              { label: "Failed", value: data.notificationStats.failed, color: "from-red-600 to-red-400" },
              { label: "Pending", value: data.notificationStats.pending, color: "from-amber-600 to-amber-400" },
            ].map((item) => {
              const pct = (item.value / totalNotifications) * 100;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <span className="font-mono text-sm text-slate-600">
                      {item.value} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email</span>
                <span className="font-mono text-slate-700">{data.notificationStats.byEmail}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-500">WhatsApp</span>
                <span className="font-mono text-slate-700">{data.notificationStats.byWhatsApp}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-violet-400" />
            <h3 className="text-slate-900 font-semibold">Leads</h3>
          </div>
          <div className="flex flex-col items-center justify-center h-[calc(100%-2.5rem)]">
            <p className="font-mono text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              {data.leads.length}
            </p>
            <p className="text-slate-500 mt-2">Total Leads</p>
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                {data.kpis.totalLeads} total generated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
