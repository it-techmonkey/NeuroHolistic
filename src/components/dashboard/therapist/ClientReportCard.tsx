'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  User,
  Loader2,
  TrendingDown,
  TrendingUp,
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
  { key: 'nervous_system_score', label: 'Nervous System', color: 'bg-rose-400' },
  { key: 'emotional_state_score', label: 'Emotional State', color: 'bg-amber-400' },
  { key: 'cognitive_patterns_score', label: 'Cognitive Patterns', color: 'bg-violet-400' },
  { key: 'body_symptoms_score', label: 'Body Symptoms', color: 'bg-sky-400' },
  { key: 'behavioral_patterns_score', label: 'Behavioral', color: 'bg-emerald-400' },
  { key: 'life_functioning_score', label: 'Life Functioning', color: 'bg-indigo-400' },
];

const SYMPTOM_CATEGORIES = [
  { key: 'emotional_patterns', label: 'Emotional' },
  { key: 'nervous_system_symptoms', label: 'Nervous System' },
  { key: 'cognitive_patterns', label: 'Cognitive' },
  { key: 'behavioral_patterns', label: 'Behavioral' },
  { key: 'body_symptoms', label: 'Physical' },
  { key: 'sleep_symptoms', label: 'Sleep' },
];

const formatDate = (value?: string | null) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const cleanText = (value: unknown): string => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

const joinList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value) return [value];
  return [];
};

const scoreTotal = (item: any) => {
  if (typeof item?.goal_readiness_score === 'number') return item.goal_readiness_score;
  return SCORE_FIELDS.reduce((sum, field) => sum + (Number(item?.[field.key]) || 0), 0);
};

/* ─── Table Cell ─── */
function Td({ label, children, span }: { label?: string; children?: ReactNode; span?: number }) {
  return (
    <td className={`px-4 py-2.5 align-top ${span ? `col-span-${span}` : ''}`}>
      {label && <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>}
      <div className="text-sm text-slate-700 leading-relaxed">{children || <span className="text-slate-300">-</span>}</div>
    </td>
  );
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-slate-300">-</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 leading-relaxed">{item}</span>
      ))}
    </div>
  );
}

function ScoreRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < score ? 'bg-indigo-500' : 'bg-slate-200'}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-700">{score}</span>
    </div>
  );
}

/* ─── Section Label (table row header) ─── */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <td className="px-4 py-2.5 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap align-top">
      {children}
    </td>
  );
}

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

  const baseline = useMemo(() => assessments.find((a: any) => a.is_baseline) || assessments[0] || null, [assessments]);
  const latest = useMemo(() => {
    const sorted = [...assessments].sort((x, y) => new Date(x.assessed_at || 0).getTime() - new Date(y.assessed_at || 0).getTime());
    return sorted.length ? sorted[sorted.length - 1] : null;
  }, [assessments]);
  const a = baseline || {};

  const firstScore = useMemo(() => {
    const sorted = [...assessments].sort((x, y) => new Date(x.assessed_at || 0).getTime() - new Date(y.assessed_at || 0).getTime());
    return sorted[0] ? scoreTotal(sorted[0]) : null;
  }, [assessments]);
  const latestScore = useMemo(() => {
    const sorted = [...assessments].sort((x, y) => new Date(x.assessed_at || 0).getTime() - new Date(y.assessed_at || 0).getTime());
    return sorted.length ? scoreTotal(sorted[sorted.length - 1]) : null;
  }, [assessments]);
  const scoreDelta = firstScore !== null && latestScore !== null ? firstScore - latestScore : null;

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

      const addPage = () => { page = pdf.addPage([595, 842]); y = 790; };
      const ensureSpace = (h: number) => { if (y - h < 48) addPage(); };

      const wrap = (text: string, fontSize: number, maxW: number) => {
        const words = text.replace(/\s+/g, ' ').trim().split(' ');
        const lines: string[] = [];
        let line = '';
        words.forEach((word) => {
          const next = line ? `${line} ${word}` : word;
          if (regularFont.widthOfTextAtSize(next, fontSize) > maxW && line) { lines.push(line); line = word; }
          else { line = next; }
        });
        if (line) lines.push(line);
        return lines.length ? lines : ['-'];
      };

      const drawText = (text: string, x: number, fontSize = 10, bold = false, color = rgb(0.13, 0.16, 0.22)) => {
        ensureSpace(fontSize + 6);
        page.drawText(text, { x, y, size: fontSize, font: bold ? boldFont : regularFont, color });
        y -= fontSize + 4;
      };

      const section = (title: string) => {
        ensureSpace(30);
        y -= 6;
        page.drawRectangle({ x: margin, y: y - 4, width, height: 20, color: rgb(0.96, 0.97, 0.98) });
        page.drawText(title, { x: margin + 8, y, size: 11, font: boldFont, color: rgb(0.18, 0.23, 0.33) });
        y -= 20;
      };

      const lv = (label: string, value: unknown) => {
        ensureSpace(28);
        const t = cleanText(value) || '-';
        drawText(label, margin, 7, true, rgb(0.45, 0.5, 0.6));
        wrap(t, 9, width - 10).forEach((l) => drawText(l, margin + 2, 9));
        y -= 2;
      };

      const colW = Math.floor(width / 3);

      // Title
      page.drawText('NeuroHolistic Institute', { x: margin, y, size: 10, font: boldFont, color: rgb(0.31, 0.35, 0.44) });
      y -= 20;
      page.drawText('Report Card', { x: margin, y, size: 22, font: boldFont, color: rgb(0.08, 0.1, 0.16) });
      y -= 16;
      page.drawText(`Generated ${formatDate(new Date().toISOString())}`, { x: margin, y, size: 8, font: regularFont, color: rgb(0.45, 0.5, 0.6) });
      y -= 20;

      // Table 1: Basic Info
      section('Basic Information');
      const basicRows = [
        ['Full Name', client.name, 'Gender', a.gender, 'Occupation', client.occupation || a.client_occupation],
        ['Date of Birth', client.dateOfBirth || a.date_of_birth, 'Nationality', a.nationality, 'Marital Status', client.relationshipStatus || a.relationship_status],
      ];
      basicRows.forEach((row) => {
        ensureSpace(24);
        for (let i = 0; i < 6; i += 2) {
          const x = margin + (i / 2) * colW;
          drawText(`${row[i]}:`, x, 7, true, rgb(0.45, 0.5, 0.6));
          drawText(cleanText(row[i + 1]) || '-', x + 2, 9);
        }
        y -= 6;
      });

      // Table 2: Main Concerns
      section('Main Concerns & Desired Outcomes');
      lv('Current Concern', a.main_complaint);
      lv('Areas of Life Affected', joinList(a.affected_life_areas).join(', '));
      lv('Experiencing Since', a.symptom_duration);
      lv('Impact', a.life_impact);
      lv('Goal or Desire', a.biggest_goal);
      y -= 4;

      // Table 3: Symptoms
      section('Symptoms & Presenting Patterns');
      const symColW = Math.floor(width / (SYMPTOM_CATEGORIES.length + 1));
      ensureSpace(50);
      // Header
      page.drawRectangle({ x: margin, y: y - 4, width, height: 16, color: rgb(0.96, 0.97, 0.98) });
      drawText('Symptoms', margin + 4, 7, true, rgb(0.45, 0.5, 0.6));
      SYMPTOM_CATEGORIES.forEach((cat, i) => {
        drawText(cat.label, margin + symColW + (i * symColW) + 4, 7, true, rgb(0.18, 0.23, 0.33));
      });
      y -= 14;
      // Symptoms list
      const maxRows = Math.max(...SYMPTOM_CATEGORIES.map((cat) => joinList(a[cat.key]).length), 1);
      const symH = Math.min(maxRows * 11, 70);
      SYMPTOM_CATEGORIES.forEach((cat, i) => {
        const syms = joinList(a[cat.key]);
        const other = a[`${cat.key}_other`];
        const all = other ? [...syms, other] : syms;
        let sy = y;
        all.forEach((s) => {
          if (sy - 9 < 48) return;
          page.drawText(s.length > 16 ? s.slice(0, 14) + '..' : s, { x: margin + symColW + (i * symColW) + 4, y: sy, size: 8, font: regularFont, color: rgb(0.3, 0.35, 0.44) });
          sy -= 11;
        });
      });
      y -= symH + 4;
      // Severity row
      ensureSpace(18);
      page.drawRectangle({ x: margin, y: y - 4, width, height: 14, color: rgb(0.96, 0.97, 0.98) });
      drawText('Severity', margin + 4, 7, true, rgb(0.45, 0.5, 0.6));
      SYMPTOM_CATEGORIES.forEach((cat, i) => {
        const sk = cat.key === 'nervous_system_symptoms' ? 'nervous_system_score' : cat.key === 'emotional_patterns' ? 'emotional_state_score' : cat.key === 'cognitive_patterns' ? 'cognitive_patterns_score' : cat.key === 'behavioral_patterns' ? 'behavioral_patterns_score' : cat.key === 'body_symptoms' ? 'body_symptoms_score' : 'sleep_symptoms_score';
        drawText(`${Number(a[sk]) || 0}/10`, margin + symColW + (i * symColW) + 4, 8, true, rgb(0.18, 0.23, 0.33));
      });
      y -= 16;
      lv('Previously Tried', joinList(a.tried_previously).join(', '));
      if (a.current_experience_words) lv('Client Experience (Own Words)', a.current_experience_words);
      y -= 4;

      // Table 4: Life Status
      section('Life Status & Functional Assessment');
      const lifeColW = Math.floor(width / 2);
      const lifeRows = [
        [['Current Relationship Status', client.relationshipStatus || a.relationship_status], ['Relationship Quality', Array.isArray(a.relationship_quality) ? a.relationship_quality.join(', ') : a.relationship_quality]],
        [['Emotional Safety', a.relationship_emotional_safety], ['Relationship Challenges', a.relationship_challenges]],
        [['Relationship Fulfillment', a.relationship_fulfillment_score ? `${a.relationship_fulfillment_score}/10` : null], ['Children', a.has_children]],
        [['Relationship with Children', Array.isArray(a.children_relationship) ? a.children_relationship.join(', ') : a.children_relationship], ['Fulfillment as Parent', a.parenting_fulfillment_score ? `${a.parenting_fulfillment_score}/10` : null]],
      ];
      lifeRows.forEach((row) => {
        ensureSpace(24);
        row.forEach((cell, i) => {
          const x = margin + i * lifeColW;
          drawText(`${cell[0]}:`, x, 7, true, rgb(0.45, 0.5, 0.6));
          drawText(cleanText(cell[1]) || '-', x + 2, 9);
        });
        y -= 10;
      });
      // Work
      ensureSpace(20);
      drawText('Work & Fulfillment:', margin, 7, true, rgb(0.45, 0.5, 0.6));
      drawText(cleanText(a.employment_status) || '-', margin + 2, 9);
      y -= 8;
      ensureSpace(20);
      drawText('Work State:', margin, 7, true, rgb(0.45, 0.5, 0.6));
      drawText(cleanText(Array.isArray(a.work_state) ? a.work_state.join(', ') : a.work_state) || '-', margin + 2, 9);
      y -= 8;
      if (a.work_fulfillment_score) { ensureSpace(20); drawText(`Work Fulfillment: ${a.work_fulfillment_score}/10`, margin, 9); y -= 8; }
      // Social
      ensureSpace(20);
      drawText('Social Life:', margin, 7, true, rgb(0.45, 0.5, 0.6));
      drawText(cleanText(Array.isArray(a.social_life) ? a.social_life.join(', ') : a.social_life) || '-', margin + 2, 9);
      y -= 8;
      ensureSpace(20);
      drawText('Understood by Others:', margin, 7, true, rgb(0.45, 0.5, 0.6));
      drawText(cleanText(a.feel_understood) || '-', margin + 2, 9);
      y -= 8;
      // Sleep
      ensureSpace(20);
      drawText('Sleep Status:', margin, 7, true, rgb(0.45, 0.5, 0.6));
      drawText(cleanText(Array.isArray(a.sleep_description) ? a.sleep_description.join(', ') : a.sleep_description) || '-', margin + 2, 9);
      y -= 8;
      ensureSpace(20);
      drawText('Average Sleep Hours:', margin, 7, true, rgb(0.45, 0.5, 0.6));
      drawText(cleanText(a.average_sleep_hours) || '-', margin + 2, 9);
      y -= 8;

      // Table 5-6: Family System
      section('Root Cause & Family System Assessment');
      const famColW = Math.floor(width / 6);
      const famHeaders = ['Emotional Presence', 'Physical Presence', 'Emotional State', 'Characteristics', 'Relationship', 'Emotional Safety'];
      ensureSpace(50);
      page.drawRectangle({ x: margin, y: y - 4, width, height: 16, color: rgb(0.96, 0.97, 0.98) });
      drawText('', margin + 4, 7, true, rgb(0.45, 0.5, 0.6));
      famHeaders.forEach((h, i) => drawText(h, margin + famColW * i + 4, 7, true, rgb(0.18, 0.23, 0.33)));
      y -= 14;
      // Mother
      ensureSpace(30);
      drawText('Mother', margin + 4, 8, true, rgb(0.18, 0.23, 0.33));
      const motherVals = [a.mother_emotional_presence, a.mother_physical_presence, joinList(a.mother_emotional_state).join(', '), joinList(a.mother_characteristics).join(', '), a.mother_relationship, a.mother_emotional_safety];
      motherVals.forEach((v, i) => drawText(cleanText(v) || '-', margin + famColW * i + 4, 8));
      y -= 14;
      // Father
      ensureSpace(30);
      drawText('Father', margin + 4, 8, true, rgb(0.18, 0.23, 0.33));
      const fatherVals = [a.father_emotional_presence, a.father_physical_presence, joinList(a.father_emotional_state).join(', '), joinList(a.father_characteristics).join(', '), a.father_relationship, a.father_emotional_safety];
      fatherVals.forEach((v, i) => drawText(cleanText(v) || '-', margin + famColW * i + 4, 8));
      y -= 16;
      lv('Parents Relationship', a.parents_relationship);
      lv('Impact on Child', a.parents_relationship_impact);
      y -= 4;
      // Siblings
      lv('Birth Order', a.birth_order);
      lv('Siblings', a.number_of_siblings);
      lv('Age Gap', a.sibling_age_gap);
      lv('Relationship', joinList(a.sibling_relationship).join(', '));
      lv('Role as Child', joinList(a.family_role).join(', '));
      y -= 4;

      // Table 7: Clinical Summary
      section('Clinical Summary');
      lv('Predominant Nervous System Presentation', a.predominant_nervous_system_state);
      lv('Predominant Emotional State', a.predominant_emotional_state);
      lv('Subconscious Patterns Identified', joinList(a.subconscious_patterns).join(', '));
      lv('Attachment Style Indicators', joinList(a.attachment_style_indicators).join(', '));
      lv('Possible Root Mechanisms', joinList(a.possible_root_mechanisms).join(', '));
      lv('Defense Mechanisms Observed', joinList(a.defense_mechanisms).join(', '));
      y -= 4;

      // Table 8: Therapist Observation
      section('Therapist Observation');
      lv('General Presentation', a.general_presentation_notes);
      lv('Emotional Congruence', a.emotional_congruence);
      lv('Body Language / Somatic', joinList(a.body_language).join(', '));
      lv('Additional Somatic Notes', a.body_language_notes);
      lv('Resistance Patterns', joinList(a.resistance_patterns).join(', '));
      lv('Additional Resistance Notes', a.resistance_notes);
      lv('Key Themes Emerging', joinList(a.key_themes).join(', '));
      lv('Additional Themes / Insights', a.clinical_insights);
      lv('Current Therapeutic Priority', joinList(a.therapeutic_priority).join(', '));
      lv('Recommended Session Frequency', a.recommended_session_frequency);
      lv('Additional Notes / Recommendations', a.additional_recommendations);

      // Score Movement
      if (scoreDelta !== null) {
        y -= 8;
        section('Score Movement');
        lv('Score Change', `${firstScore}/60 to ${latestScore}/60 (${scoreDelta >= 0 ? 'reduced' : 'increased'} by ${Math.abs(scoreDelta)} points)`);
        SCORE_FIELDS.forEach((f) => {
          const bv = baseline?.[f.key] ?? 0;
          const lv2 = latest?.[f.key] ?? 0;
          lv(`  ${f.label}`, `${bv}/10 -> ${lv2}/10`);
        });
      }

      const bytes = await pdf.save();
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-card-${client.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report card:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">NeuroHolistic Institute</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">Report Card</h2>
            <p className="mt-1 text-sm text-slate-400">Generated {formatDate(new Date().toISOString())}</p>
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

      <div className="p-6 space-y-6">

        {/* Table 1: Basic Information */}
        <TableSection title="Basic Information">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <Td label="Full Name">{client.name}</Td>
                <Td label="Gender">{cleanText(a.gender)}</Td>
                <Td label="Occupation">{cleanText(client.occupation || a.client_occupation)}</Td>
              </tr>
              <tr>
                <Td label="Date of Birth">{formatDate(client.dateOfBirth || a.date_of_birth)}</Td>
                <Td label="Nationality">{cleanText(a.nationality)}</Td>
                <Td label="Marital Status">{cleanText(client.relationshipStatus || a.relationship_status)}</Td>
              </tr>
            </tbody>
          </table>
        </TableSection>

        {/* Table 2: Main Concerns */}
        <TableSection title="Main Concerns & Desired Outcomes">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <Td label="Current Concern" span={3}>{cleanText(a.main_complaint)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Areas of Life Affected"><TagList items={joinList(a.affected_life_areas)} /></Td>
                <Td label="Experiencing Since">{cleanText(a.symptom_duration)}</Td>
              </tr>
              <tr>
                <Td label="Impact" span={1}>{cleanText(a.life_impact)}</Td>
                <Td label="Goal or Desire" span={2}>{cleanText(a.biggest_goal)}</Td>
              </tr>
            </tbody>
          </table>
        </TableSection>

        {/* Table 3: Symptoms & Presenting Patterns */}
        <TableSection title="Symptoms & Presenting Patterns">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">Symptoms</th>
                  {SYMPTOM_CATEGORIES.map((cat) => (
                    <th key={cat.key} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">{cat.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 align-top"></td>
                  {SYMPTOM_CATEGORIES.map((cat) => {
                    const syms = joinList(a[cat.key]);
                    const other = a[`${cat.key}_other`];
                    const all = other ? [...syms, other] : syms;
                    return (
                      <td key={cat.key} className="px-4 py-3 align-top">
                        <TagList items={all} />
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-slate-50">
                  <SectionLabel>Severity</SectionLabel>
                  {SYMPTOM_CATEGORIES.map((cat) => {
                    const sk = cat.key === 'nervous_system_symptoms' ? 'nervous_system_score' : cat.key === 'emotional_patterns' ? 'emotional_state_score' : cat.key === 'cognitive_patterns' ? 'cognitive_patterns_score' : cat.key === 'behavioral_patterns' ? 'behavioral_patterns_score' : cat.key === 'body_symptoms' ? 'body_symptoms_score' : 'sleep_symptoms_score';
                    return (
                      <td key={cat.key} className="px-4 py-2.5">
                        <ScoreRow score={Number(a[sk]) || 0} />
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <table className="w-full text-sm mt-3 border-t border-slate-100">
            <tbody>
              <tr>
                <Td label="Previously Tried" span={1}><TagList items={joinList(a.tried_previously)} /></Td>
                {a.current_experience_words && <Td label="Client Experience (Own Words)" span={1}>{cleanText(a.current_experience_words)}</Td>}
              </tr>
            </tbody>
          </table>
        </TableSection>

        {/* Table 4: Life Status & Functional Assessment */}
        <TableSection title="Life Status & Functional Assessment">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <Td label="Current Relationship Status">{cleanText(client.relationshipStatus || a.relationship_status)}</Td>
                <Td label="Relationship Quality">{cleanText(Array.isArray(a.relationship_quality) ? a.relationship_quality.join(', ') : a.relationship_quality)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Emotional Safety">{cleanText(a.relationship_emotional_safety)}</Td>
                <Td label="Relationship Challenges">{cleanText(a.relationship_challenges)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Relationship Fulfillment">{a.relationship_fulfillment_score ? `${a.relationship_fulfillment_score}/10` : '-'}</Td>
                <Td label="Children">{cleanText(a.has_children)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Relationship with Children">{cleanText(Array.isArray(a.children_relationship) ? a.children_relationship.join(', ') : a.children_relationship)}</Td>
                <Td label="Fulfillment as Parent">{a.parenting_fulfillment_score ? `${a.parenting_fulfillment_score}/10` : '-'}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Employment Status">{cleanText(a.employment_status)}</Td>
                <Td label="Work State">{cleanText(Array.isArray(a.work_state) ? a.work_state.join(', ') : a.work_state)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Work/Career Fulfillment">{a.work_fulfillment_score ? `${a.work_fulfillment_score}/10` : '-'}</Td>
                <Td label="Social Life Status">{cleanText(Array.isArray(a.social_life) ? a.social_life.join(', ') : a.social_life)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Understood by Others">{cleanText(a.feel_understood)}</Td>
                <Td label="Sleep Status">{cleanText(Array.isArray(a.sleep_description) ? a.sleep_description.join(', ') : a.sleep_description)}</Td>
              </tr>
              <tr>
                <Td label="Average Sleep Hours">{cleanText(a.average_sleep_hours)}</Td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </TableSection>

        {/* Table 5: Root Cause & Family System Assessment */}
        <TableSection title="Root Cause & Family System Assessment">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Parents</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-20"></th>
                  {['Emotional Presence', 'Physical Presence', 'Emotional State', 'Characteristics', 'Relationship', 'Emotional Safety'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <SectionLabel>Mother</SectionLabel>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{cleanText(a.mother_emotional_presence)}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{cleanText(a.mother_physical_presence)}</td>
                  <td className="px-4 py-2.5"><TagList items={joinList(a.mother_emotional_state)} /></td>
                  <td className="px-4 py-2.5"><TagList items={joinList(a.mother_characteristics)} /></td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{cleanText(a.mother_relationship)}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{cleanText(a.mother_emotional_safety)}</td>
                </tr>
                <tr>
                  <SectionLabel>Father</SectionLabel>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{cleanText(a.father_emotional_presence)}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{cleanText(a.father_physical_presence)}</td>
                  <td className="px-4 py-2.5"><TagList items={joinList(a.father_emotional_state)} /></td>
                  <td className="px-4 py-2.5"><TagList items={joinList(a.father_characteristics)} /></td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{cleanText(a.father_relationship)}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{cleanText(a.father_emotional_safety)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <Td label="Parents Relationship">{cleanText(a.parents_relationship)}</Td>
                <Td label="Impact on Child">{cleanText(a.parents_relationship_impact)}</Td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2">Siblinghood</p>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <Td label="Birth Order">{cleanText(a.birth_order)}</Td>
                <Td label="Siblings">{cleanText(a.number_of_siblings)}</Td>
                <Td label="Age Gap">{cleanText(a.sibling_age_gap)}</Td>
              </tr>
              <tr>
                <Td label="Relationship"><TagList items={joinList(a.sibling_relationship)} /></Td>
                <Td label="Role as Child"><TagList items={joinList(a.family_role)} /></Td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </TableSection>

        {/* Table 6: Clinical Summary */}
        <TableSection title="Clinical Summary">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <Td label="Predominant Nervous System Presentation">{cleanText(a.predominant_nervous_system_state)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Predominant Emotional State">{cleanText(a.predominant_emotional_state)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Subconscious Patterns Identified"><TagList items={joinList(a.subconscious_patterns)} /></Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Attachment Style Indicators"><TagList items={joinList(a.attachment_style_indicators)} /></Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Possible Root Mechanisms"><TagList items={joinList(a.possible_root_mechanisms)} /></Td>
              </tr>
              <tr>
                <Td label="Defense Mechanisms Observed"><TagList items={joinList(a.defense_mechanisms)} /></Td>
              </tr>
            </tbody>
          </table>
        </TableSection>

        {/* Table 7: Therapist Observation */}
        <TableSection title="Therapist Observation">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <Td label="General Presentation">{cleanText(a.general_presentation_notes)}</Td>
                <Td label="Emotional Congruence">{cleanText(a.emotional_congruence)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Body Language / Somatic"><TagList items={joinList(a.body_language)} /></Td>
                <Td label="Additional Somatic Notes">{cleanText(a.body_language_notes)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Resistance Patterns Observed"><TagList items={joinList(a.resistance_patterns)} /></Td>
                <Td label="Additional Resistance Notes">{cleanText(a.resistance_notes)}</Td>
              </tr>
              <tr className="border-b border-slate-100">
                <Td label="Key Themes Emerging"><TagList items={joinList(a.key_themes)} /></Td>
                <Td label="Additional Themes / Insights">{cleanText(a.clinical_insights)}</Td>
              </tr>
              <tr>
                <Td label="Current Therapeutic Priority"><TagList items={joinList(a.therapeutic_priority)} /></Td>
                <Td label="Recommended Session Frequency">{cleanText(a.recommended_session_frequency)}</Td>
              </tr>
              <tr>
                <Td label="Additional Notes / Recommendations" span={2}>{cleanText(a.additional_recommendations)}</Td>
              </tr>
            </tbody>
          </table>
        </TableSection>

        {/* Score Movement */}
        {scoreDelta !== null && (
          <TableSection title="Score Movement">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-semibold text-slate-950">{firstScore}/60 to {latestScore}/60</p>
                <p className={`text-sm font-medium ${scoreDelta >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {scoreDelta >= 0 ? 'Reduced' : 'Increased'} by {Math.abs(scoreDelta)} points
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {scoreDelta >= 0 ? <TrendingDown className="h-5 w-5 text-emerald-500" /> : <TrendingUp className="h-5 w-5 text-amber-500" />}
              </div>
            </div>
          </TableSection>
        )}
      </div>
    </section>
  );
}

/* ─── Table Section Wrapper ─── */
function TableSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}
