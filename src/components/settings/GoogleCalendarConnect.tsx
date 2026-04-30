'use client';

import { useState, useEffect, useCallback } from 'react';

interface GoogleCalendarStatus {
  connected: boolean;
  lastUpdated: string | null;
  scope: string | null;
}

interface GoogleCalendarConnectProps {
  className?: string;
}

export default function GoogleCalendarConnect({ className = '' }: GoogleCalendarConnectProps) {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check connection status on mount
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/google/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to check Google status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    // Check for success/error params from OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      setSuccessMessage('Google Calendar connected successfully!');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    const googleError = params.get('google_error');
    if (googleError) {
      setError(`Google connection failed: ${googleError}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkStatus]);

  // Handle connect button click
  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/google/connect');
      const data = await response.json();

      if (response.ok && data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || 'Failed to initiate connection');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Google');
      setConnecting(false);
    }
  };

  // Handle disconnect button click
  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? Future bookings will not create calendar events.')) {
      return;
    }

    setDisconnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/google/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setStatus({ connected: false, lastUpdated: null, scope: null });
        setSuccessMessage('Google Calendar disconnected successfully');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to disconnect');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Google Calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  // Format last updated date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-6 ${className}`}>
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Google Calendar Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 22.5h-15A2.25 2.25 0 012.25 20.25V6a2.25 2.25 0 012.25-2.25h3V3a.75.75 0 011.5 0v.75h6V3a.75.75 0 011.5 0v.75h3A2.25 2.25 0 0121.75 6v14.25a2.25 2.25 0 01-2.25 2.25zM4.5 9.75v10.5c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75V9.75H4.5z"/>
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium text-slate-900">Google Calendar</h3>
          <p className="text-sm text-slate-500">
            Connect your Google Calendar to automatically create Meet links for therapy sessions.
            Session confirmation emails are sent separately by the platform (not via Gmail).
          </p>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
          status?.connected
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {status?.connected ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Connected
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Not Connected
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Connection Info */}
      {status?.connected && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Last connected:</span>
            <span className="text-slate-700 font-medium">{formatDate(status.lastUpdated)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!status?.connected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connecting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Connect Google Calendar
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {disconnecting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Disconnecting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Disconnect
                </>
              )}
            </button>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reconnect
            </button>
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> When connected, new therapy sessions will automatically create Google Calendar events with Meet links. Clients will receive calendar invitations.
        </p>
      </div>
    </div>
  );
}
