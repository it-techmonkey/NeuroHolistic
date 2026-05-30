'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle2, Copy, ExternalLink, FileText, Loader2, Pencil, QrCode, RefreshCw, Save, Trash2, Upload, X } from 'lucide-react';
import type { AdminData } from './types';

type Certificate = {
  id: string;
  user_id?: string | null;
  certificate_number: string;
  title: string;
  recipient_name?: string | null;
  recipient_email?: string | null;
  issued_at?: string | null;
  file_name: string;
  qr_token: string;
  status: 'active' | 'revoked';
  created_at: string;
  verification_url: string;
  user?: { id: string; full_name?: string; email?: string } | null;
};

type EditForm = {
  userId: string;
  title: string;
  certificateNumber: string;
  recipientName: string;
  recipientEmail: string;
};

export default function CertificatesTab({ data }: { data: AdminData }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('Certificate Of Professional Mastery');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const clients = useMemo(
    () => data.users.filter(user => user.role === 'client'),
    [data.users]
  );

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    const selected = clients.find(user => user.id === selectedUserId);
    if (selected) {
      setRecipientName(selected.fullName || '');
      setRecipientEmail(selected.email || '');
    }
  }, [clients, selectedUserId]);

  async function loadCertificates() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/certificates');
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to load certificates');
      setCertificates(payload.certificates || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError('Choose a certificate PDF or image first.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('certificateNumber', certificateNumber);
    formData.append('userId', selectedUserId);
    formData.append('recipientName', recipientName);
    formData.append('recipientEmail', recipientEmail);

    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        body: formData,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to upload certificate');

      setMessage('Certificate uploaded and verification QR link generated.');
      setCertificateNumber('');
      setFile(null);
      const fileInput = document.getElementById('certificate-file') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      await loadCertificates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(certificateId: string, status: 'active' | 'revoked') {
    setError('');
    try {
      const res = await fetch(`/api/admin/certificates/${certificateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update certificate');
      await loadCertificates();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteCertificate(certificateId: string, certificateNumber: string) {
    const confirmed = window.confirm(`Delete certificate ${certificateNumber}? This will remove the uploaded certificate file and its QR verification page.`);
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/admin/certificates/${certificateId}`, {
        method: 'DELETE',
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to delete certificate');
      setMessage('Certificate deleted.');
      await loadCertificates();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    setMessage('Verification link copied.');
  }

  function startEditing(certificate: Certificate) {
    setError('');
    setMessage('');
    setEditingCertificateId(certificate.id);
    setEditForm({
      userId: certificate.user_id || '',
      title: certificate.title,
      certificateNumber: certificate.certificate_number,
      recipientName: certificate.recipient_name || '',
      recipientEmail: certificate.recipient_email || '',
    });
  }

  function updateEditForm(field: keyof EditForm, value: string) {
    setEditForm((current) => current ? { ...current, [field]: value } : current);
  }

  async function saveCertificateUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCertificateId || !editForm) return;

    setSavingEdit(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/admin/certificates/${editingCertificateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update certificate');

      setMessage('Certificate information updated.');
      setEditingCertificateId(null);
      setEditForm(null);
      await loadCertificates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  const qrImage = (url: string) =>
    `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=180&margin=1`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50">
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Certificates</h2>
            <p className="text-sm text-slate-500">Upload certificates, stamp QR codes onto the file, and generate public verification links.</p>
          </div>
        </div>
        <button
          onClick={loadCertificates}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {(error || message) && (
        <div className={`rounded-lg border p-3 text-sm ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Assign to user</span>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
            >
              <option value="">Unassigned public certificate</option>
              {clients.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.email} ({user.email})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Certificate title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Certificate number</span>
            <input
              value={certificateNumber}
              onChange={(event) => setCertificateNumber(event.target.value)}
              placeholder="NHI-NAPM-2026-101"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Recipient name</span>
            <input
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Recipient email</span>
            <input
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
            />
          </label>

        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <label className="flex-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              id="certificate-file"
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="hidden"
            />
            <span className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="w-4 h-4" />
              {file ? file.name : 'Choose certificate PDF or image'}
            </span>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {submitting ? 'Uploading...' : 'Upload Certificate'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Issued Certificates</h3>
            <p className="text-xs text-slate-500 mt-0.5">{certificates.length} total</p>
          </div>
          <QrCode className="w-5 h-5 text-slate-400" />
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-16 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No certificates uploaded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {certificates.map(certificate => (
              <div key={certificate.id} className="p-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{certificate.title}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      certificate.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {certificate.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {certificate.certificate_number} · {certificate.recipient_name || certificate.user?.full_name || 'Unassigned'} · {certificate.file_name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={certificate.verification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </a>
                    <button
                      onClick={() => copyLink(certificate.verification_url)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy link
                    </button>
                    <button
                      onClick={() => updateStatus(certificate.id, certificate.status === 'active' ? 'revoked' : 'active')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                    >
                      {certificate.status === 'active' ? 'Revoke' : 'Reactivate'}
                    </button>
                    <button
                      onClick={() => startEditing(certificate)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCertificate(certificate.id, certificate.certificate_number)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>

                  {editingCertificateId === certificate.id && editForm && (
                    <form onSubmit={saveCertificateUpdate} className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <label className="space-y-1.5">
                          <span className="text-xs font-medium text-slate-500">Assign to user</span>
                          <select
                            value={editForm.userId}
                            onChange={(event) => updateEditForm('userId', event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
                          >
                            <option value="">Unassigned public certificate</option>
                            {clients.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.fullName || user.email} ({user.email})
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-1.5">
                          <span className="text-xs font-medium text-slate-500">Certificate title</span>
                          <input
                            value={editForm.title}
                            onChange={(event) => updateEditForm('title', event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
                            required
                          />
                        </label>

                        <label className="space-y-1.5">
                          <span className="text-xs font-medium text-slate-500">Certificate number</span>
                          <input
                            value={editForm.certificateNumber}
                            onChange={(event) => updateEditForm('certificateNumber', event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
                            required
                          />
                        </label>

                        <label className="space-y-1.5">
                          <span className="text-xs font-medium text-slate-500">Recipient name</span>
                          <input
                            value={editForm.recipientName}
                            onChange={(event) => updateEditForm('recipientName', event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
                          />
                        </label>

                        <label className="space-y-1.5">
                          <span className="text-xs font-medium text-slate-500">Recipient email</span>
                          <input
                            type="email"
                            value={editForm.recipientEmail}
                            onChange={(event) => updateEditForm('recipientEmail', event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-400"
                          />
                        </label>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={savingEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save changes
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingCertificateId(null); setEditForm(null); }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={qrImage(certificate.verification_url)}
                    alt={`QR code for ${certificate.certificate_number}`}
                    className="w-28 h-28 rounded-lg border border-slate-200 bg-white"
                  />
                  <a
                    href={qrImage(certificate.verification_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Open QR
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
