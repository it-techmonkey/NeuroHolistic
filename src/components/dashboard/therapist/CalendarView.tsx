'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Video, User } from 'lucide-react';

type Session = {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  client_name?: string;
  clients?: { full_name?: string; email?: string };
  meet_link?: string;
  meeting_link?: string;
  session_number?: number;
};

type CalendarViewProps = {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CalendarView({ sessions, onSessionClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    sessions.forEach(session => {
      const dateKey = session.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    return grouped;
  }, [sessions]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(formatDateKey(new Date()));
  };

  const today = formatDateKey(new Date());

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const selectedSessions = selectedDate ? sessionsByDate[selectedDate] || [] : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-24 border-b border-r border-slate-100 bg-slate-50/50" />;
          }

          const date = new Date(year, month, day);
          const dateKey = formatDateKey(date);
          const daySessions = sessionsByDate[dateKey] || [];
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDate;
          const isPast = date < new Date() && !isToday;

          return (
            <div
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className={`h-24 p-1 border-b border-r border-slate-100 cursor-pointer transition hover:bg-slate-50 ${
                isSelected ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                    isToday
                      ? 'bg-indigo-600 text-white font-semibold'
                      : isSelected
                      ? 'bg-indigo-100 text-indigo-700'
                      : isPast
                      ? 'text-slate-400'
                      : 'text-slate-700'
                  }`}
                >
                  {day}
                </span>
                {daySessions.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                    {daySessions.length}
                  </span>
                )}
              </div>

              {/* Session Pills */}
              <div className="space-y-0.5 overflow-hidden">
                {daySessions.slice(0, 2).map(session => (
                  <div
                    key={session.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionClick?.(session);
                    }}
                    className={`text-xs px-1.5 py-0.5 rounded truncate ${
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {session.time} {session.clients?.full_name?.split(' ')[0] || session.client_name?.split(' ')[0] || 'Session'}
                  </div>
                ))}
                {daySessions.length > 2 && (
                  <div className="text-xs text-slate-500 px-1.5">
                    +{daySessions.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>

          {selectedSessions.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions scheduled</p>
          ) : (
            <div className="space-y-2">
              {selectedSessions
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(session => (
                  <div
                    key={session.id}
                    onClick={() => onSessionClick?.(session)}
                    className={`p-3 rounded-lg border cursor-pointer transition hover:shadow-md ${
                      session.status === 'completed'
                        ? 'bg-white border-green-200'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.type === 'free_consultation'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {session.type === 'free_consultation' ? (
                            <User className="w-5 h-5" />
                          ) : (
                            <Video className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {session.type === 'free_consultation'
                              ? 'Free Consultation'
                              : `Session #${session.session_number || 1}`}
                          </p>
                          <p className="text-sm text-slate-500">
                            {session.clients?.full_name || session.client_name || 'Client'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {session.time}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {session.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                    {(session.meet_link || session.meeting_link) && session.status !== 'completed' && (
                      <a
                        href={session.meet_link || session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
