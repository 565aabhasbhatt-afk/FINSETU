import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Send,
  QrCode,
  History,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import api from '../services/api';
import SendMoneyModal from '../components/SendMoneyModal';
import ReceiveMoneyModal from '../components/ReceiveMoneyModal';
import DepositFundsModal from '../components/DepositFundsModal';
import AIFinancialGuardian from '../components/AIFinancialGuardian';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  // Modals state
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/accounts/overview');
      if (res.data && res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch banking overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    if (window.location.hash === '#ai-guardian') {
      setTimeout(() => {
        const el = document.getElementById('ai-guardian');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  const overview = dashboardData?.accountOverview;
  const financial = dashboardData?.financialOverview;
  const recentTransactions = dashboardData?.recentTransactions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.fullName || overview?.accountHolderName || 'Finsetu User'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {overview?.status || 'ACTIVE'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Account UPI: <span className="font-mono text-slate-700 font-semibold">{overview?.upiId || `${user?.email?.split('@')[0]}@finsetu`}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition"
            title="Refresh Account Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsDepositOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Deposit via Razorpay</span>
          </button>
        </div>
      </div>

      {/* A. Account Overview Card & B. Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Digital Banking Card */}
        <div className="lg:col-span-2 bg-[#0A192F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          {/* Subtle card glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">
                Primary Savings Balance
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {showBalance
                    ? `₹${overview?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`
                    : '••••••••'}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title={showBalance ? 'Hide balance' : 'Show balance'}
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-blue-400 font-bold tracking-wider">FINSETU VAULT</div>
              <div className="text-[11px] text-slate-400">Encrypted Ledger</div>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-800/80 relative z-10">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">ACCOUNT HOLDER</span>
              <span className="font-semibold text-xs tracking-wide">{overview?.accountHolderName || user?.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">ACCOUNT NUMBER</span>
              <span className="font-mono font-semibold text-xs tracking-wider">{overview?.maskedAccountNumber || '•••• •••• 6120'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">TOTAL TRANSACTIONS</span>
              <span className="font-semibold text-xs">{overview?.totalTransactions || 0} Records</span>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions Panel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-4">Quick Financial Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsSendOpen(true)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 flex flex-col items-center justify-center gap-1.5 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Send Money</span>
              </button>

              <button
                onClick={() => setIsReceiveOpen(true)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 flex flex-col items-center justify-center gap-1.5 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Receive QR</span>
              </button>

              <Link
                to="/transactions"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 flex flex-col items-center justify-center gap-1.5 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <History className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">History</span>
              </Link>

              <Link
                to="/loans"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 flex flex-col items-center justify-center gap-1.5 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Loan Offers</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <Link
              to="/ai-guardian"
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 text-xs font-bold shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>🛡️ AI Financial Guardian Page</span>
            </Link>
            <Link
              to="/security/simulator"
              className="w-full py-2 px-3 rounded-xl bg-slate-900 text-emerald-400 hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-semibold transition"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cyber Threat Simulator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 🛡️ FinSetu AI Financial Guardian Feature Section */}
      <AIFinancialGuardian currentBalance={overview?.balance || 18450} />

      {/* D. Financial Overview & Spending Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Recharts Area Graph */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Cash Flow Telemetry</h3>
              <p className="text-xs text-slate-500">Spending vs Income trajectories recorded in ledger</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Spending
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financial?.spendingGraph || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0A192F', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="spending" stroke="#64748B" strokeWidth={2} fillOpacity={1} fill="url(#spendingGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Overview Metrics Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">Monthly Spending</span>
              <div className="text-xl font-bold text-slate-900">
                ₹{financial?.monthlySpending?.toLocaleString('en-IN') || '0.00'}
              </div>
              <span className="text-[11px] text-slate-400">Debit transfers & bills</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <TrendingDown className="w-5 h-5 text-slate-600" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">Monthly Income</span>
              <div className="text-xl font-bold text-slate-900">
                ₹{financial?.monthlyIncome?.toLocaleString('en-IN') || '0.00'}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Credits & Salary</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">Net Ledger Cashflow</span>
              <div className="text-xl font-bold text-blue-600">
                ₹{financial?.netCashflow?.toLocaleString('en-IN') || '0.00'}
              </div>
              <span className="text-[11px] text-slate-400">Surplus capital</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* C. Recent Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest 5 account settlements verified by core backend</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View All Transactions →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Reference / Counterparty</th>
                <th className="pb-3">Rail</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No transactions recorded yet. Make your first transfer or deposit funds.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const isCredit = tx.targetUserId === user?.id || tx.type === 'DEPOSIT';
                  const dateObj = new Date(tx.createdAt);
                  return (
                    <tr key={tx.id || tx.referenceId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-slate-500" />
                          )}
                          <span>{tx.description || tx.referenceId}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{tx.referenceId}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px] text-slate-700">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">
                        <div className="font-semibold text-slate-800">
                          {dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}{' '}
                          {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {tx.relativeTime && (
                          <div className="text-[10px] text-blue-600 font-medium">
                            {tx.relativeTime}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          tx.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.status === 'FLAGGED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onSuccess={fetchOverview}
        currentBalance={overview?.balance || 0}
      />

      <ReceiveMoneyModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        userAccount={overview}
        userName={user?.fullName}
      />

      <DepositFundsModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={fetchOverview}
      />
    </div>
  );
}
