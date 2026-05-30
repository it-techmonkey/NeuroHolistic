'use client';

import { useEffect, useState } from 'react';
import { Award, CalendarDays, ExternalLink, FileText, Loader2, QrCode } from 'lucide-react';

type Certificate = {
  id: string;
  certificate_number: string;
  title: string;
  recipient_name?: string | null;
  recipient_email?: string | null;
  issued_at?: string | null;
  file_name: string;
  qr_token: string;
  status: 'active' | 'revoked';
  created_at: string;
};

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCertificates() {
      try {
        const res = await fetch('/api/certificates');
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || 'Failed to load certificates');
        setCertificates(payload.certificates || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">No certificates yet</h3>
        <p className="text-slate-500 mt-2">Issued certificates will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Certificates</h2>
        <p className="text-sm text-slate-500">{certificates.length} certificate{certificates.length > 1 ? 's' : ''} available</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {certificates.map(certificate => {
          const verificationPath = `/certificates/${certificate.qr_token}`;
          const issuedAt = certificate.issued_at
            ? new Date(`${certificate.issued_at}T00:00:00`).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Issue date not listed';

          return (
            <article key={certificate.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{certificate.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{certificate.certificate_number}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarDays className="w-4 h-4" />
                  <span>{issuedAt}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">{certificate.file_name}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <QrCode className="w-4 h-4" />
                  <span>Public QR verification enabled</span>
                </div>
              </div>

              <a
                href={verificationPath}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Certificate
              </a>
            </article>
          );
        })}
      </div>
    </div>
  );
}
