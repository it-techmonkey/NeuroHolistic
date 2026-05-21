'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Account({ user }: { user: any }) {
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name || `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || '',
    phone: user?.user_metadata?.phone || '',
    country: user?.user_metadata?.country || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileUpdate = async () => {
    setProfileSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: form.full_name,
          phone: form.phone,
          country: form.country,
        },
      });

      if (error) throw error;

      // Also update users table
      await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone,
          country: form.country,
        }),
      });

      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const email = user?.email as string | undefined;
    if (!email) {
      setMessage({ type: 'error', text: 'Cannot update password: missing email on session.' });
      return;
    }

    if (!passwordForm.currentPassword) {
      setMessage({ type: 'error', text: 'Enter current password.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setMessage({ type: 'error', text: 'New password must differ from current password.' });
      return;
    }

    setPasswordSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        const wrong =
          signInError.message?.toLowerCase().includes('invalid') ||
          signInError.message?.includes('Invalid login credentials');
        throw new Error(
          wrong
            ? 'Current password is incorrect.'
            : signInError.message,
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {form.full_name || 'Your Profile'}
            </h2>
            <p className="text-white/80">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-indigo-600" />
            Profile Information
          </h3>
          <p className="text-sm text-slate-500 mt-1">Update your personal information</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <UserCircle className="w-4 h-4 text-slate-400" />
              Full Name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-4 py-2.5 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Phone className="w-4 h-4 text-slate-400" />
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+971 50 000 0000"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Country
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your country"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleProfileUpdate}
              disabled={profileSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {profileSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Change Password
          </h3>
          <p className="text-sm text-slate-500 mt-1">Update your account password</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Lock className="w-4 h-4 text-slate-400" />
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                autoComplete="current-password"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Current password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((s) => ({ ...s, current: !s.current }))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Lock className="w-4 h-4 text-slate-400" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                autoComplete="new-password"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((s) => ({ ...s, new: !s.new }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Lock className="w-4 h-4 text-slate-400" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                autoComplete="new-password"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            OAuth-only sign-in: use{' '}
            <a
              href="/auth/forgot-password"
              className="text-indigo-600 hover:underline font-medium"
            >
              Forgot password
            </a>{' '}
            to set email/password first.
          </p>

          <div className="pt-4">
            <button
              onClick={handlePasswordChange}
              disabled={
                passwordSaving ||
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors"
            >
              {passwordSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
