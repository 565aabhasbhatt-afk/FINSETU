import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogOut,
  RefreshCw,
  Clock,
  MapPin,
  Lock,
  Activity
} from 'lucide-react';
import api from '../services/api';

export default function LoginActivityPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLoginData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/login-history');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load login activity telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginData();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      const res = await api.delete(`/sessions/${sessionId}/revoke`);
      if (res.data.success) {
        setActionMsg('Active session revoked successfully.');
        fetchLoginData();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not revoke session.');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!window.confirm('Are you sure you want to log out from all other devices? This will invalidate all external tokens.')) {
      return;
    }

    try {
      setActionMsg('');
      setErrorMsg('');
      const res = await api.post('/sessions/revoke-all');
      if (res.data.success) {
        setActionMsg('All other devices logged out successfully.');
        fetchLoginData();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to logout from all devices.');
    }
  };

  const stats = data?.stats;
  const sessions = data?.sessions || [];
  const history = data?.history || [];

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'MOBILE':
        return <Smartphone className="w-4 h-4 text-slate-600" />;
      case 'TABLET':
        return <Tablet className="w-4 h-4 text-slate-600" />;
      default:
        return <Monitor className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Login & Device Activity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time identity verification, session authorization, and device fingerprint telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLoginData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleRevokeAllOther}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout From All Devices</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Sign-Ins</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalAttempts || 0}</div>
          <span className="text-[10px] text-slate-400">Total historical requests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Successful</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats?.successfulSignIns || 0}</div>
          <span className="text-[10px] text-slate-400">Authenticated sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Failed / Blocked</span>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats?.failedSignIns || 0}</div>
          <span className="text-[10px] text-slate-400">Credentials rejected</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Active Sessions</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats?.activeSessionsCount || 0}</div>
          <span className="text-[10px] text-slate-400">Live tokens active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Suspicious Flags</span>
          <div className={`text-2xl font-bold mt-1 ${stats?.suspiciousCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {stats?.suspiciousCount || 0}
          </div>
          <span className="text-[10px] text-slate-400">Anomalous triggers</span>
        </div>
      </div>

      {/* Currently Active Sessions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Currently Active Device Sessions
            </h3>
            <p className="text-xs text-slate-500">Live devices holding valid authenticated JWT access tokens</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {sessions.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                sess.isCurrent
                  ? 'bg-blue-50/40 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {getDeviceIcon(sess.deviceType)}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{sess.browser} on {sess.os}</span>
                    {sess.isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                        THIS DEVICE • LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sess.activeRelative || 'Active recently'}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5 text-[11px] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{sess.approximateLocation}</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-800 font-semibold">{sess.ipAddress}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Logged in: {sess.date} at {sess.time}</span>
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition"
                >
                  Terminate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Complete Historical Login Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Real-Time Security Sign-In Audit Trail</h3>
          <p className="text-xs text-slate-500">
            Immutable log of all authorization attempts, parsed client headers, and geographical geolocation tags
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Date & Real Time</th>
                <th className="pb-3 px-3">Device & Browser</th>
                <th className="pb-3 px-3">IP Address</th>
                <th className="pb-3 px-3">Location & Network Telemetry</th>
                <th className="pb-3 px-3">Risk Assessment</th>
                <th className="pb-3 px-3">Session Token Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No login history records found.
                  </td>
                </tr>
              ) : (
                history.map((h) => {
                  const isSuccess = h.status === 'SUCCESS';
                  return (
                    <tr key={h.id} className={`hover:bg-slate-50/70 transition ${h.isSuspicious ? 'bg-red-50/20' : ''}`}>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{h.status}</span>
                        </span>
                        {h.failureReason && (
                          <div className="text-[10px] text-red-600 mt-0.5 font-medium">{h.failureReason}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {h.relativeTime && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {h.relativeTime}
                            </span>
                          )}
                          <span>{h.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{h.time}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(h.deviceType)}
                          <div>
                            <div className="font-semibold text-slate-900">{h.browser}</div>
                            <div className="text-[10px] text-slate-500">{h.os} • {h.deviceType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-700">
                        {h.ipAddress}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div className="text-[11px] font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{h.approximateLocation}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {h.isSuspicious ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[9px] uppercase tracking-wide">
                              SUSPICIOUS
                            </span>
                            <div className="text-[9px] font-mono text-red-600">{h.riskFlags}</div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">CLEAN_AUDIT</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {h.sessionId}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
