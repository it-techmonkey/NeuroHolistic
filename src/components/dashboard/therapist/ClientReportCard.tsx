'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Mail,
  Phone,
  User,
  Briefcase,
  Globe,
  Heart,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

type ReportClient = {
  name: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  dateOfBirth?: string | null;
  occupation?: string | null;
  relationshipStatus?: string | null;
  notes?: string | null;
  status?: string | null;
  program?: any;
};

type ClientReportCardProps = {
  client: ReportClient;
  source: 'active' | 'archived';
  sessions?: any[];
  bookings?: any[];
  assessments?: any[];
  devForms?: any[];
  materials?: any[];
};

const SCORE_FIELDS = [
  { key: 'nervous_system_score', label: 'Nervous System' },
  { key: 'emotional_state_score', label: 'Emotional State' },
  { key: 'cognitive_patterns_score', label: 'Cognitive Patterns' },
  { key: 'body_symptoms_score', label: 'Body Symptoms' },
  { key: 'behavioral_patterns_score', label: 'Behavioral Patterns' },
  { key: 'life_functioning_score', label: 'Life Functioning' },
];

const formatDate = (value?: string | null) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatShortDate = (value?: string | null) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const asArray = (value: unknown) => Array.isArray(value) ? value : [];

const scoreTotal = (item: any) => {
  if (typeof item?.goal_readiness_score === 'number') return item.goal_readiness_score;
  return SCORE_FIELDS.reduce((sum, field) => sum + (Number(item?.[field.key]) || 0), 0);
};

const getEntryDate = (item: any) =>
  item?.assessment_date || item?.assessed_at || item?.session_date || item?.date || item?.created_at || null;

const cleanText = (value: unknown) => {
  const normalize = (text: string) => text.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
  if (Array.isArray(value)) return normalize(value.filter(Boolean).join(', '));
  if (value === null || value === undefined || value === '') return 'Not recorded';
  return normalize(String(value));
};

export default function ClientReportCard({
  client,
  source,
  sessions = [],
  bookings = [],
  assessments = [],
  devForms = [],
  materials = [],
}: ClientReportCardProps) {
  const [downloading, setDownloading] = useState(false);

  const timeline = useMemo(() => {
    const items = [
      ...assessments.map((item) => ({
        id: `assessment-${item.id}`,
        type: 'Assessment',
        title: item.is_baseline ? 'Baseline Diagnostic Assessment' : item.session_number ? `Diagnostic Assessment - Session ${item.session_number}` : 'Diagnostic Assessment',
        date: getEntryDate(item),
        score: scoreTotal(item),
        data: item,
      })),
      ...devForms.map((item, index) => ({
        id: `dev-${item.id}`,
        type: 'Development Form',
        title: item.session_number ? `Session ${item.session_number} Development Form` : `Development Form ${index + 1}`,
        date: getEntryDate(item),
        score: scoreTotal(item),
        data: item,
      })),
    ];

    return items.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
  }, [assessments, devForms]);

  const firstScore = timeline[0]?.score ?? null;
  const latestScore = timeline[timeline.length - 1]?.score ?? null;
  const scoreDelta = firstScore !== null && latestScore !== null ? firstScore - latestScore : null;
  const completedSessions = sessions.filter((session) => session.status === 'completed').length;
  const reportId = `${source}-${client.name || 'client'}-${new Date().toISOString().slice(0, 10)}`;

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

      let page = pdf.addPage([595, 842]);
      const margin = 42;
      const width = page.getWidth() - margin * 2;
      let y = 790;

      const addPage = () => {
        page = pdf.addPage([595, 842]);
        y = 790;
      };

      const wrap = (text: string, fontSize: number, maxWidth: number) => {
        const words = text.replace(/\s+/g, ' ').trim().split(' ');
        const lines: string[] = [];
        let line = '';
        words.forEach((word) => {
          const next = line ? `${line} ${word}` : word;
          if (regularFont.widthOfTextAtSize(next, fontSize) > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = next;
          }
        });
        if (line) lines.push(line);
        return lines.length ? lines : ['Not recorded'];
      };

      const ensureSpace = (height: number) => {
        if (y - height < 48) addPage();
      };

      const drawText = (text: string, x: number, fontSize = 10, bold = false, color = rgb(0.13, 0.16, 0.22)) => {
        ensureSpace(fontSize + 8);
        page.drawText(text, { x, y, size: fontSize, font: bold ? boldFont : regularFont, color });
        y -= fontSize + 5;
      };

      const section = (title: string) => {
        ensureSpace(34);
        y -= 8;
        page.drawRectangle({ x: margin, y: y - 5, width, height: 22, color: rgb(0.94, 0.96, 0.99) });
        page.drawText(title, { x: margin + 10, y, size: 11, font: boldFont, color: rgb(0.18, 0.23, 0.33) });
        y -= 24;
      };

      const labelValue = (label: string, value: unknown) => {
        ensureSpace(34);
        drawText(label.toUpperCase(), margin, 7, true, rgb(0.45, 0.5, 0.6));
        wrap(cleanText(value), 10, width).forEach((line) => drawText(line, margin, 10));
        y -= 4;
      };

      page.drawText('NeuroHolistic Institute', { x: margin, y, size: 10, font: boldFont, color: rgb(0.31, 0.35, 0.44) });
      y -= 24;
      page.drawText('Client Report Card', { x: margin, y, size: 24, font: boldFont, color: rgb(0.08, 0.1, 0.16) });
      y -= 20;
      page.drawText(`Generated ${formatDate(new Date().toISOString())}`, { x: margin, y, size: 9, font: regularFont, color: rgb(0.45, 0.5, 0.6) });
      y -= 26;

      section('Client Overview');
      labelValue('Name', client.name);
      labelValue('Status', client.status || (source === 'archived' ? 'Archived Client' : 'Active Client'));
      labelValue('Email', client.email);
      labelValue('Phone', client.phone);
      labelValue('Country', client.country);
      labelValue('Date of Birth', client.dateOfBirth ? formatDate(client.dateOfBirth) : null);
      labelValue('Occupation', client.occupation);
      labelValue('Relationship Status', client.relationshipStatus);
      labelValue('Notes', client.notes);

      section('Clinical Summary');
      labelValue('Sessions Completed', `${completedSessions} completed, ${sessions.length} visible session records`);
      labelValue('Bookings', `${bookings.length} booking records`);
      labelValue('Assessments', `${assessments.length} diagnostic assessment records`);
      labelValue('Development Forms', `${devForms.length} session development records`);
      labelValue('Materials', `${materials.length} uploaded materials`);
      labelValue('Score Change', scoreDelta === null ? 'Not enough scored records' : `${firstScore}/60 to ${latestScore}/60 (${scoreDelta >= 0 ? 'reduced' : 'increased'} by ${Math.abs(scoreDelta)} points)`);

      section('Sessions');
      if (sessions.length === 0) labelValue('Session Records', 'No sessions recorded');
      sessions.forEach((session, index) => {
        labelValue(`Session ${session.session_number || index + 1}`, `${formatShortDate(session.date)} ${session.time || ''} | ${session.status || 'No status'} | ${session.type || session.session_type || 'Session'}`);
      });

      section('Bookings');
      if (bookings.length === 0) labelValue('Booking Records', 'No bookings recorded');
      bookings.forEach((booking, index) => {
        labelValue(`Booking ${index + 1}`, `${formatShortDate(booking.date)} ${booking.time || ''} | ${booking.status || 'No status'} | ${booking.type || 'Booking'}`);
      });

      section('Assessments');
      if (assessments.length === 0) labelValue('Assessment Records', 'No assessments recorded');
      assessments.forEach((assessment, index) => {
        labelValue(`Assessment ${index + 1}`, `${formatShortDate(getEntryDate(assessment))} | Total score ${scoreTotal(assessment)}/60`);
        labelValue('Main Complaint', assessment.main_complaint);
        labelValue('Symptoms', assessment.current_symptoms);
        labelValue('Clinical Condition', assessment.clinical_condition_brief);
        labelValue('Therapist Focus', assessment.therapist_focus);
        labelValue('Therapy Goal', assessment.therapy_goal);
      });

      section('Development Forms');
      if (devForms.length === 0) labelValue('Development Records', 'No development forms recorded');
      devForms.forEach((form, index) => {
        labelValue(`Development Form ${index + 1}`, `${formatShortDate(getEntryDate(form))} | Total score ${scoreTotal(form)}/60`);
        labelValue('Techniques Used', form.techniques_used);
        labelValue('Key Interventions', form.key_interventions);
        labelValue('Client Feedback', form.client_feedback);
        labelValue('Integration Notes', form.integration_notes);
        labelValue('Therapist Notes', form.therapist_internal_notes);
      });

      section('Uploaded Materials');
      if (materials.length === 0) labelValue('Materials', 'No materials uploaded');
      materials.forEach((material, index) => {
        labelValue(`Material ${index + 1}`, `${material.title || material.file_name || material.name || 'Untitled'} | ${formatShortDate(material.uploaded_at || material.created_at)}`);
      });

      const bytes = await pdf.save();
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `client-report-card-${client.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download client report card:', error);
    } finally {
      setDownloading(false);
    }
  };

  const detailItems = [
    { icon: Mail, label: 'Email', value: client.email },
    { icon: Phone, label: 'Phone', value: client.phone },
    { icon: Globe, label: 'Country', value: client.country },
    { icon: Calendar, label: 'Date of Birth', value: client.dateOfBirth ? formatDate(client.dateOfBirth) : null },
    { icon: Briefcase, label: 'Occupation', value: client.occupation },
    { icon: Heart, label: 'Relationship', value: client.relationshipStatus },
  ].filter((item) => item.value);

  return (
    <section id={reportId} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">NeuroHolistic Institute</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Client Report Card</h2>
            <p className="mt-1 text-sm text-slate-300">Generated {formatDate(new Date().toISOString())}</p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 border-b border-slate-200 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <User className="h-7 w-7 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-slate-950">{client.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${source === 'archived' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {client.status || (source === 'archived' ? 'Archived Client' : 'Active Client')}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {detailItems.length > 0 ? detailItems.map((item) => (
                  <div key={item.label} className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                    <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{item.value}</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">No demographic details recorded.</p>
                )}
              </div>
            </div>
          </div>
          {client.notes && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Therapist Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sessions', value: sessions.length, icon: Calendar },
              { label: 'Assessments', value: assessments.length, icon: FileText },
              { label: 'Forms', value: devForms.length, icon: Activity },
              { label: 'Materials', value: materials.length, icon: BarChart3 },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
                <item.icon className="h-4 w-4 text-indigo-500" />
                <p className="mt-3 text-2xl font-semibold text-slate-950">{item.value}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Score Movement</p>
            {scoreDelta === null ? (
              <p className="mt-2 text-sm text-slate-500">Not enough scored records to compare.</p>
            ) : (
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-slate-950">{firstScore}/60 to {latestScore}/60</p>
                  <p className={`text-sm font-medium ${scoreDelta >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {scoreDelta >= 0 ? 'Reduced' : 'Increased'} by {Math.abs(scoreDelta)} points
                  </p>
                </div>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full ${scoreDelta >= 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, Math.abs(scoreDelta) / 60 * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <ReportSection title="Sessions and Bookings" icon={Calendar}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {(() => {
              // Merge sessions and bookings while preserving order and avoiding duplicates by id
              const seen = new Set<string | number>();
              const merged: any[] = [];
              (sessions || []).forEach((s) => {
                if (s && s.id && !seen.has(s.id)) { seen.add(s.id); merged.push(s); }
              });
              (bookings || []).forEach((b) => {
                if (b && b.id && !seen.has(b.id)) { seen.add(b.id); merged.push(b); }
              });

              if (merged.length === 0) return <EmptyLine text="No session or booking records available." />;

              return merged.map((item, index) => (
                <div key={`${item.id || index}-session-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.session_number ? `Session ${item.session_number}` : item.type === 'free_consultation' ? 'Free Consultation' : `Record ${index + 1}`}</p>
                      <p className="mt-1 text-sm text-slate-500">{formatShortDate(item.date)} {item.time || ''}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">{item.status || 'recorded'}</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </ReportSection>

        <ReportSection title="Assessment Records" icon={FileText}>
          <div className="space-y-3">
            {assessments.length > 0 ? assessments.map((assessment, index) => (
              <ClinicalEntry key={assessment.id || index} item={assessment} title={assessment.is_baseline ? 'Baseline Diagnostic Assessment' : assessment.session_number ? `Diagnostic Assessment - Session ${assessment.session_number}` : `Diagnostic Assessment ${index + 1}`} accent="amber" />
            )) : (
              <EmptyLine text="No diagnostic assessments recorded." />
            )}
          </div>
        </ReportSection>

        <ReportSection title="Session Development Forms" icon={Activity}>
          <div className="space-y-3">
            {devForms.length > 0 ? devForms.map((form, index) => (
              <ClinicalEntry key={form.id || index} item={form} title={form.session_number ? `Session ${form.session_number} Development Form` : `Development Form ${index + 1}`} accent="emerald" />
            )) : (
              <EmptyLine text="No session development forms recorded." />
            )}
          </div>
        </ReportSection>

        <ReportSection title="Materials" icon={BarChart3}>
          {materials.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {materials.map((material, index) => (
                <div key={material.id || index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{material.title || material.file_name || material.name || `Material ${index + 1}`}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatShortDate(material.uploaded_at || material.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyLine text="No uploaded materials available." />
          )}
        </ReportSection>
      </div>
    </section>
  );
}

function ReportSection({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ClinicalEntry({ item, title, accent }: { item: any; title: string; accent: 'amber' | 'emerald' }) {
  const total = scoreTotal(item);
  const accentClasses = accent === 'amber'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{formatShortDate(getEntryDate(item))}</p>
        </div>
        <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${accentClasses}`}>{total}/60</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
        {SCORE_FIELDS.map((field) => (
          <div key={field.key} className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{field.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{Number(item?.[field.key]) || 0}/10</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          ['Main Complaint', item.main_complaint],
          ['Symptoms', asArray(item.current_symptoms).join(', ')],
          ['Techniques Used', asArray(item.techniques_used).join(', ')],
          ['Key Interventions', item.key_interventions],
          ['Clinical Condition', item.clinical_condition_brief],
          ['Therapist Focus', item.therapist_focus],
          ['Therapy Goal', item.therapy_goal],
          ['Client Feedback', item.client_feedback],
          ['Integration Notes', item.integration_notes],
          ['Therapist Notes', item.therapist_internal_notes],
        ].filter(([, value]) => value).map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
