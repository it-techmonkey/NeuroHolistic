'use client';

import { FileText, Video } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface SessionRecord {
  bookingId: string;
  date: string;
  time: string;
  score: number | null;
  therapistNotes: string | null;
  pdfUrl: string | null;
  videoUrl: string | null;
}

interface SessionHistoryProps {
  sessions: SessionRecord[];
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function ScoreBadge({ score }: { score: number }) {
  let color = 'bg-emerald-50 text-emerald-700';
  if (score >= 60) color = 'bg-amber-50 text-amber-700';
  if (score >= 80) color = 'bg-red-50 text-red-700';

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}
    </span>
  );
}

export default function SessionHistory({ sessions }: SessionHistoryProps) {
  if (sessions.length === 0) {
    return (
      <Card className="p-6" border>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Session History
        </h3>
        <p className="text-sm text-slate-400 text-center py-8">
          No completed sessions yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6" border>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Session History
      </h3>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s.bookingId}
            className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-900">
                  {fmtDate(s.date)}
                </span>
                <span className="text-xs text-slate-400">{fmtTime(s.time)}</span>
                {s.score !== null && <ScoreBadge score={s.score} />}
              </div>

              {s.therapistNotes && (
                <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                  {s.therapistNotes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {s.pdfUrl && (
                <a
                  href={s.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View PDF report"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#2B2F55] hover:border-[#2B2F55]/30 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                </a>
              )}
              {s.videoUrl && (
                <a
                  href={s.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Watch session recording"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#2B2F55] hover:border-[#2B2F55]/30 transition-colors"
                >
                  <Video className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
