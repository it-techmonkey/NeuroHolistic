'use client';

import { useState } from 'react';
import Link from 'next/link';
import FadeIn from '@/components/ui/FadeIn';
import { ResultSummary } from './ResultSummary';
import { ResultsRadarChart } from './ResultsRadarChart';
import { ResultDetailsTabs } from './ResultDetailsTabs';
import { PersonalizedInsights } from './PersonalizedInsights';
import { RecommendedPrograms } from './RecommendedPrograms';
import { NextStepsSection } from './NextStepsSection';
import { Download, Share2, RefreshCw } from 'lucide-react';

interface AssessmentResult {
  id: string;
  nervousSystemType: 'hyper' | 'hypo' | 'mixed' | 'regulated';
  primaryWound: string;
  secondaryWound: string;
  originPeriod: string;
  overallScore: number;
  autonomicInflammation: number;
  somaticLowertone: number;
  traumaticMemory: number;
  emotionalDepth: number;
  presenceHere: number;
  timestamp: Date;
}

interface AssessmentResultsProps {
  result: AssessmentResult;
  onRetake?: () => void;
}

export function AssessmentResults({
  result,
  onRetake,
}: AssessmentResultsProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'details'>('insights');

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleShareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'NeuroHolistic Clinical Report',
        text: 'Nervous system assessment results.',
      });
    }
  };

  return (
    <FadeIn className="min-h-screen bg-white">
      {/* ── HEADER ACTIONS ── */}
      <div className="fixed top-0 right-0 p-6 z-50 flex gap-2 print:hidden">
         <button onClick={handleDownloadPDF} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4 text-slate-900" />
         </button>
         <button onClick={handleShareResults} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
            <Share2 className="w-4 h-4 text-slate-900" />
         </button>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-20 lg:py-32">
        
        {/* ── REPORT HEADER ── */}
        <div className="mb-20">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-px bg-slate-900" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-900">Clinical Report</span>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end">
              <div>
                 <h1 className="text-4xl lg:text-5xl font-light text-slate-900 leading-[1.1] mb-6">
                    Pattern Analysis &<br />
                    Systemic Review
                 </h1>
                 <p className="text-sm text-slate-500 font-light leading-relaxed max-w-md">
                    Analysis generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. This document contains a comprehensive breakdown of nervous system dysregulation markers and somatic holding patterns.
                 </p>
              </div>

              <div className="flex flex-col gap-6 w-full">
                 <div className="flex items-end justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Dysregulation Index</span>
                    <span className="text-6xl font-light text-slate-900 leading-none">{result.overallScore}</span>
                 </div>
                 <div className="flex justify-between text-xs font-light text-slate-500">
                    <span>Regulated (0-30)</span>
                    <span>Moderate (31-60)</span>
                    <span className="font-medium text-slate-900">High (61-100)</span>
                 </div>
              </div>
           </div>
        </div>

        {/* ── METRICS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-slate-200 divide-y md:divide-y-0 md:divide-x divide-slate-200 mb-20">
           <div className="p-8">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Dominant Pattern</p>
              <p className="text-2xl font-light text-slate-900 capitalize">{result.nervousSystemType} Activation</p>
           </div>
           <div className="p-8">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Core Imprint</p>
              <p className="text-2xl font-light text-slate-900 capitalize">{result.primaryWound.replace(/_/g, ' ')}</p>
           </div>
           <div className="p-8">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Origin Timeline</p>
              <p className="text-2xl font-light text-slate-900 capitalize">{result.originPeriod === 'early_childhood' ? 'Early Development' : result.originPeriod.replace(/_/g, ' ')}</p>
           </div>
        </div>

        {/* ── CONTENT BODY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
           
           {/* Sidebar Navigation (Sticky) */}
           <div className="lg:col-span-3">
              <div className="sticky top-32 space-y-8">
                 <div className="space-y-1">
                    <button 
                       onClick={() => setActiveTab('insights')}
                       className={`block w-full text-left text-[10px] uppercase tracking-[0.2em] py-2 transition-colors ${activeTab === 'insights' ? 'text-slate-900 font-bold border-l-2 border-slate-900 pl-4' : 'text-slate-400 hover:text-slate-600 pl-4 border-l-2 border-transparent'}`}
                    >
                       Analysis
                    </button>
                    <button 
                       onClick={() => setActiveTab('details')}
                       className={`block w-full text-left text-[10px] uppercase tracking-[0.2em] py-2 transition-colors ${activeTab === 'details' ? 'text-slate-900 font-bold border-l-2 border-slate-900 pl-4' : 'text-slate-400 hover:text-slate-600 pl-4 border-l-2 border-transparent'}`}
                    >
                       Date Breakdown
                    </button>
                    <a href="#programs" className="block w-full text-left text-[10px] uppercase tracking-[0.2em] py-2 text-slate-400 hover:text-slate-600 pl-4 border-l-2 border-transparent transition-colors">
                       Recommentations
                    </a>
                 </div>

                 {onRetake && (
                    <button onClick={onRetake} className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors pl-4 pt-8 border-t border-slate-100">
                       <RefreshCw className="w-3 h-3" />
                       Retake Assessment
                    </button>
                 )}
              </div>
           </div>

           {/* Main Report Content */}
           <div className="lg:col-span-9 space-y-20">
              
              <section>
                 <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-4">
                    <span className="w-8 h-px bg-slate-900"></span>
                    Clinical Summary
                 </h2>
                 <div className="bg-slate-50 p-8 lg:p-12 border border-slate-100">
                    <ResultSummary
                       nervousSystemType={result.nervousSystemType}
                       primaryWound={result.primaryWound}
                       secondaryWound={result.secondaryWound}
                       originPeriod={result.originPeriod}
                       overallScore={result.overallScore}
                    />
                 </div>
              </section>

              <section>
                 <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-4">
                    <span className="w-8 h-px bg-slate-900"></span>
                    Biometric Profile
                 </h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white border border-slate-100 p-8 flex items-center justify-center">
                       <ResultsRadarChart
                          autonomicInflammation={result.autonomicInflammation}
                          somaticLowertone={result.somaticLowertone}
                          traumaticMemory={result.traumaticMemory}
                          emotionalDepth={result.emotionalDepth}
                          presenceHere={result.presenceHere}
                       />
                    </div>
                    <div className="flex flex-col justify-center">
                       <p className="text-lg font-light text-slate-900 leading-relaxed italic">
                          "The somatic profile indicates a tendency towards {result.nervousSystemType} states, suggesting that the body has adapted to stress by {result.nervousSystemType === 'hyper' ? 'mobilizing excessive energy' : 'conserving energy through shutdown'}."
                       </p>
                    </div>
                 </div>
              </section>

              <section>
                 {activeTab === 'insights' ? (
                    <PersonalizedInsights
                       autonomicInflammation={result.autonomicInflammation}
                       somaticLowertone={result.somaticLowertone}
                       traumaticMemory={result.traumaticMemory}
                       emotionalDepth={result.emotionalDepth}
                       presenceHere={result.presenceHere}
                       primaryWound={result.primaryWound}
                       nervousSystemType={result.nervousSystemType}
                    />
                 ) : (
                    <ResultDetailsTabs result={result} />
                 )}
              </section>

              <section id="programs" className="border-t border-slate-200 pt-20">
                 <h2 className="text-2xl font-light text-slate-900 mb-2">Recommended Protocol</h2>
                 <p className="text-slate-500 font-light mb-12">Based on your dysregulation index and somatic markers.</p>
                 <RecommendedPrograms
                    nervousSystemType={result.nervousSystemType}
                    overallScore={result.overallScore}
                 />
              </section>

              <section className="bg-[#2B2F55] text-white p-12 lg:p-20 text-center">
                 <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-8">Next Steps</p>
                 <h3 className="text-3xl lg:text-4xl font-light mb-6">Begin the Integration</h3>
                 <p className="text-white/70 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
                    Your assessment provides the map. The NeuroHolistic method provides the vehicle. Schedule your intake session to review these results with a clinical specialist.
                 </p>
                 <Link href="/booking" className="inline-block bg-white text-[#2B2F55] px-10 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-slate-100 transition-colors">
                    Review with Specialist
                 </Link>
              </section>

           </div>
        </div>

      </div>
    </FadeIn>
  );
}
