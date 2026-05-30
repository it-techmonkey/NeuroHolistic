import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Award, FileText, ShieldCheck, ShieldX } from 'lucide-react';
import type { ReactNode } from 'react';
import getR2Client, { R2_BUCKET_NAME } from '@/lib/r2/client';
import { getServiceSupabase } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function CertificateVerificationPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = getServiceSupabase();

  const { data: certificate } = await supabase
    .from('certificates')
    .select('*')
    .eq('qr_token', token)
    .maybeSingle();

  if (!certificate) {
    return (
      <CertificateShell>
        <StatusPanel
          icon={<ShieldX className="w-7 h-7 text-red-600" />}
          title="Certificate not found"
          message="This QR code does not match an issued NeuroHolistic certificate."
          tone="red"
        />
      </CertificateShell>
    );
  }

  if (certificate.status !== 'active') {
    return (
      <CertificateShell>
        <StatusPanel
          icon={<ShieldX className="w-7 h-7 text-amber-600" />}
          title="Certificate revoked"
          message="This certificate is no longer active. Please contact NeuroHolistic for confirmation."
          tone="amber"
        />
      </CertificateShell>
    );
  }

  const signedUrl = await getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: certificate.file_key,
    }),
    { expiresIn: 3600 }
  );

  return (
    <CertificateShell>
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Verified Certificate</p>
                <h1 className="text-2xl font-semibold text-slate-950 mt-1">{certificate.title}</h1>
                <p className="text-sm text-slate-500 mt-2">
                  Certificate number {certificate.certificate_number}
                </p>
              </div>
            </div>
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Open Certificate
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <Detail label="Recipient" value={certificate.recipient_name || 'Certificate holder'} />
            <Detail label="Email" value={certificate.recipient_email || 'Not listed'} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-900">Certificate Preview</span>
          </div>
          <iframe
            src={signedUrl}
            title={certificate.title}
            className="w-full h-[72vh] bg-slate-100"
          />
        </div>
      </div>
    </CertificateShell>
  );
}

function CertificateShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">NeuroHolistic Institute</p>
            <p className="text-xs text-slate-500">Certificate Verification</p>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}

function StatusPanel({
  icon,
  title,
  message,
  tone,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  tone: 'red' | 'amber';
}) {
  const classes = tone === 'red'
    ? 'bg-red-50 border-red-200'
    : 'bg-amber-50 border-amber-200';

  return (
    <div className={`border rounded-xl p-8 text-center ${classes}`}>
      <div className="w-14 h-14 rounded-full bg-white mx-auto mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
      <p className="text-sm text-slate-600 mt-2">{message}</p>
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-1.5">
        {icon}
        {value}
      </p>
    </div>
  );
}
