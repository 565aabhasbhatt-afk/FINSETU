import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  History,
  Send,
  PlusCircle,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import SendMoneyModal from '../components/SendMoneyModal';
import DepositFundsModal from '../components/DepositFundsModal';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const [txRes, accRes] = await Promise.all([
        api.get('/transactions', {
          params: {
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            type: typeFilter !== 'ALL' ? typeFilter : undefined
          }
        }),
        api.get('/accounts/overview')
      ]);

      if (txRes.data && txRes.data.success) {
        setTransactions(txRes.data.data);
      }
      if (accRes.data && accRes.data.success) {
        setCurrentBalance(accRes.data.data.accountOverview.balance);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, typeFilter]);

  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.referenceId.toLowerCase().includes(q) ||
      t.senderName.toLowerCase().includes(q) ||
      t.receiverName.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Transaction Ledger & Settlement
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete cryptographic audit trail of all incoming and outgoing funds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSendOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Send className="w-4 h-4" />
            <span>Send Money</span>
          </button>
          <button
            onClick={() => setIsDepositOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Deposit (Razorpay)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref ID, sender, receiver..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {['ALL', 'COMPLETED', 'PENDING', 'FLAGGED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={fetchTransactions}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 ml-1"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Transaction Reference</th>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Receiver</th>
                <th className="py-3 px-4">Method & Rail</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status & Integrity</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Querying PostgreSQL transaction ledger...</span>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No transactions match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = !tx.isSender;
                  return (
                    <tr key={tx.id || tx.referenceId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{tx.referenceId}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{tx.description || 'Finsetu Direct Clearing'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {tx.senderName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {tx.receiverName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium text-[11px] text-slate-700">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {tx.relativeTime && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-blue-700 font-bold text-[9px]">
                              {tx.relativeTime}
                            </span>
                          )}
                          <span>{tx.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{tx.time}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : tx.status === 'FLAGGED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {tx.status}
                          </span>
                          {tx.isSimulated ? (
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              GATEWAY_SIMULATED
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                              LEDGER_VERIFIED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
        onSuccess={fetchTransactions}
        currentBalance={currentBalance}
      />

      <DepositFundsModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
