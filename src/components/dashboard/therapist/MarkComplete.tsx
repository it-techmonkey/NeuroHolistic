'use client';
import { useState } from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

export default function MarkComplete({ 
  sessionId, 
  isReady, 
  isCompleted, 
  onComplete 
}: { 
  sessionId: string;
  isReady: boolean;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!isReady || isCompleted) return;
    if (!confirm('Mark session as complete?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/sessions/complete', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ sessionId })
      });
      
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);

      // Trigger notification separately or handle in API? API handles it?
      // Step 3 said "Trigger notification? Maybe."
      // I'll assume API handles session status update.
      onComplete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 cursor-default">
         <CheckCircle className="w-3 h-3 mr-1" />
         Completed
      </span>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={!isReady || loading}
      title={!isReady ? "Complete development form first" : "Mark session complete"}
      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded transition ${
        !isReady 
          ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed' 
          : 'border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50'
      }`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Circle className="w-3 h-3 mr-1" />}
      {loading ? 'Saving...' : 'Mark Complete'}
    </button>
  );
}
