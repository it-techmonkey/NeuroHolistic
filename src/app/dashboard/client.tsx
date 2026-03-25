'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import DashboardShell from '@/components/dashboard/DashboardShell';
import NextSessionCard from '@/components/dashboard/client/NextSessionCard';
import ProgramProgress from '@/components/dashboard/client/ProgramProgress';
import SessionHistory from '@/components/dashboard/client/SessionHistory';
import TherapistScores from '@/components/dashboard/client/TherapistScores';

type SessionAssessment = {
  id: string;
  overall_dysregulation_score: number;
  nervous_system_score: number;
  emotional_pattern_score: number;
  family_imprint_score: number;
  incident_load_score: number;
  body_symptom_score: number;
  current_stress_score: number;
  therapist_notes: string | null;
  observations: string | null;
  recommendations: string | null;
  resource_pdf_url: string | null;
  resource_mp4_url: string | null;
  created_at: string;
};

type TimelineRow = {
  booking: {
    id: string;
    date: string;
    time: string;
    type: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    therapist_name: string | null;
    meeting_link: string | null;
  };
  sessionAssessment: SessionAssessment | null;
};

type DashboardData = {
  averageScore: number | null;
  latestAssessment: SessionAssessment | null;
  nextUpcomingBooking: {
    id: string;
    date: string;
    time: string;
    therapist_name: string | null;
    meeting_link: string | null;
    sessionNumber: number | null;
  } | null;
  summary: {
    totalSessions: number | null;
    usedSessions: number;
    completedSessions: number;
    scheduledSessions: number;
    remainingSessions: number | null;
    canScheduleNextSession: boolean;
    nextSchedulableSessionNumber: number | null;
    programType: 'private' | 'group' | null;
  };
  timeline: TimelineRow[];
};

export default function DashboardClient() {
  const [firstName, setFirstName] = useState('User');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const [{ data: profile }, progressRes] = await Promise.all([
          supabase.from('users').select('full_name').eq('id', user.id).single(),
          fetch('/api/users/session-progress'),
        ]);

        if (profile?.full_name) {
          setFirstName(profile.full_name.split(' ')[0]);
        }

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setData(progressData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardShell role="client">
        <div className="flex items-center justify-center py-32 font-medium text-slate-400">
          Loading...
        </div>
      </DashboardShell>
    );
  }

  const summary = data?.summary;
  const nextBooking = data?.nextUpcomingBooking;

  const nextSession = nextBooking
    ? {
        id: nextBooking.id,
        date: nextBooking.date,
        time: nextBooking.time,
        therapistName: nextBooking.therapist_name,
        meetingLink: nextBooking.meeting_link,
        sessionNumber: nextBooking.sessionNumber,
      }
    : null;

  const latestAssessment = data?.latestAssessment
    ? {
        overallScore: Math.round(data.latestAssessment.overall_dysregulation_score),
        nervousSystemScore: data.latestAssessment.nervous_system_score,
        emotionalPatternScore: data.latestAssessment.emotional_pattern_score,
        currentStressScore: data.latestAssessment.current_stress_score,
        therapistNotes: data.latestAssessment.therapist_notes,
        recommendations: data.latestAssessment.recommendations,
        createdAt: data.latestAssessment.created_at,
      }
    : null;

  const sessionRecords = (data?.timeline ?? [])
    .filter((row) => row.booking.status === 'completed')
    .map((row) => ({
      bookingId: row.booking.id,
      date: row.booking.date,
      time: row.booking.time,
      score: row.sessionAssessment
        ? Math.round(row.sessionAssessment.overall_dysregulation_score)
        : null,
      therapistNotes: row.sessionAssessment?.therapist_notes ?? null,
      pdfUrl: row.sessionAssessment?.resource_pdf_url ?? null,
      videoUrl: row.sessionAssessment?.resource_mp4_url ?? null,
    }));

  return (
    <DashboardShell role="client" userName={firstName}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <NextSessionCard
            session={nextSession}
            canScheduleNext={summary?.canScheduleNextSession ?? false}
            nextSessionNumber={summary?.nextSchedulableSessionNumber ?? null}
          />
          <ProgramProgress
            totalSessions={summary?.totalSessions ?? 0}
            completedSessions={summary?.completedSessions ?? 0}
            remainingSessions={summary?.remainingSessions ?? 0}
            programType={summary?.programType ?? null}
          />
        </div>
        <aside className="lg:col-span-4 space-y-6">
          <TherapistScores
            averageScore={data?.averageScore != null ? Math.round(data.averageScore) : null}
            latestAssessment={latestAssessment}
          />
          <SessionHistory sessions={sessionRecords} />
        </aside>
      </div>
    </DashboardShell>
  );
}
