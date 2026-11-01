import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Activity,
  RefreshCw,
  Database,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/metrics');
      if (res.data && res.data.success) {
        setAdminData(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Access denied or failed to load SecOps metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleLock = async (userId, currentLockState) => {
    try {
      setActionMsg('');
      setErrorMsg('');
      const newLockState = !currentLockState;
      const res = await api.post(`/admin/users/${userId}/lock`, {
        lock: newLockState,
        reason: newLockState ? 'SecOps Administrative Security Quarantine' : undefined
      });

      if (res.data.success) {
        setActionMsg(res.data.message);
        fetchAdminData();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update lock status.');
    }
  };

  const summary = adminData?.summary;
  const users = adminData?.users || [];
  const auditLogs = adminData?.auditLogs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-red-600" />
            Administrative SecOps & Audit Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Role-Based Access Control • Sensitive payment credentials and passwords remain encrypted
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs self-start sm:self-auto"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
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

      {/* Admin Telemetry Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{summary?.totalUsers || 0}</div>
          <span className="text-[10px] text-slate-500">Registered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Transactions</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{summary?.totalTransactions || 0}</div>
          <span className="text-[10px] text-slate-500">Ledger Count</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Login Events</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{summary?.totalLoginAttempts || 0}</div>
          <span className="text-[10px] text-slate-500">Total Attempts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Live Sessions</span>
          <div className="text-xl font-bold text-blue-600 mt-1">{summary?.activeSessionsCount || 0}</div>
          <span className="text-[10px] text-slate-500">Active Tokens</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Incidents</span>
          <div className="text-xl font-bold text-red-600 mt-1">{summary?.securityIncidentsCount || 0}</div>
          <span className="text-[10px] text-slate-500">Detected</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Anomalies</span>
          <div className="text-xl font-bold text-amber-600 mt-1">{summary?.suspiciousActivityCount || 0}</div>
          <span className="text-[10px] text-slate-500">Flagged Attempts</span>
        </div>
      </div>

      {/* User Directory & Security Lock Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Account Directory & Security Controls</h3>
          <p className="text-xs text-slate-500">
            Enforce account quarantine, inspect balances, and review RBAC authorization levels
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="pb-3 px-3">User & Email</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Bank Account</th>
                <th className="pb-3 px-3">Balance</th>
                <th className="pb-3 px-3">Failed Attempts</th>
                <th className="pb-3 px-3">Account Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {u.account?.accountNumber || 'Pending'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    ₹{Number(u.account?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-mono ${u.failedAttempts > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                      {u.failedAttempts}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      u.isLocked
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {u.isLocked ? 'LOCKED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleLock(u.id, u.isLocked)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                        u.isLocked
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {u.isLocked ? 'Unlock Account' : 'Quarantine Lock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Administrative Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Administrative Audit Log</h3>
          <p className="text-xs text-slate-500">
            Immutable tracking of operator security overrides and administrative commands
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Actor Email</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 px-3">Target Entity</th>
                <th className="pb-3 px-3">Target ID</th>
                <th className="pb-3 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400 font-sans">
                    No administrative audit records logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {log.actorEmail}
                    </td>
                    <td className="py-2.5 px-3 text-blue-600 font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.targetEntity}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {log.targetId ? `${log.targetId.slice(0, 10)}...` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
