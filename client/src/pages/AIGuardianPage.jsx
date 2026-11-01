import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Brain, ArrowLeft, ArrowRight, Zap, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AIFinancialGuardian from '../components/AIFinancialGuardian';

export default function AIGuardianPage() {
  const { user, isAuthenticated } = useAuth();
  const [accountBalance, setAccountBalance] = useState(18450);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [usingDemoBalance, setUsingDemoBalance] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBalance = async () => {
      if (!isAuthenticated) {
        setAccountBalance(18450);
        setUsingDemoBalance(true);
        return;
      }

      try {
        setIsLoadingBalance(true);
        const res = await api.get('/accounts/me');
        if (res.data?.success && res.data?.data?.balance !== undefined) {
          setAccountBalance(Number(res.data.data.balance));
          setUsingDemoBalance(false);
        } else {
          setAccountBalance(18450);
          setUsingDemoBalance(true);
        }
      } catch (err) {
        console.warn('Could not load account balance, falling back to Hackathon Demo standard (₹18,450):', err);
        setAccountBalance(18450);
        setUsingDemoBalance(true);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Banking Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs">
              <span className="text-slate-400">Baseline Balance:</span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {usingDemoBalance && (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                  Demo Default
                </span>
              )}
            </div>

            <button
              onClick={() => {
                if (usingDemoBalance && user?.account?.balance) {
                  setAccountBalance(Number(user.account.balance));
                  setUsingDemoBalance(false);
                } else {
                  setAccountBalance(18450);
                  setUsingDemoBalance(true);
                }
              }}
              className="text-xs text-slate-400 hover:text-white underline transition"
            >
              {usingDemoBalance ? 'Use Account Balance' : 'Reset to ₹18,450 Demo'}
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>FINSETU AUTONOMOUS INTEL ENGINE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
            <span>🛡️ FinSetu AI Financial Guardian</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium italic">
            “Know the impact before you pay.”
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Real-time dual-engine protection combining pre-transaction balance forecasting (<strong className="text-blue-400">What-If Payment</strong>) with continuous counterparty trust scoring (<strong className="text-emerald-400">Payment Risk Guardian</strong>).
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-white">1. What-If Payment</div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Simulates month-end balance, safe limit & budget drain before funds move.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-white">2. Payment Risk Guardian</div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Scans recipient history, velocity anomalies, and flags malicious routing.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-white">3. Autonomous Safe Mode</div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Instantly activates 2FA challenge & payment cooldown on suspicious requests.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-white">4. Dual Execution Engine</div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Real-time REST endpoints + instant client-side offline fallback logic.
              </div>
            </div>
          </div>
        </div>

        {/* Main AI Financial Guardian Component */}
        <div className="pt-2">
          <AIFinancialGuardian currentBalance={accountBalance} />
        </div>
      </div>
    </div>
  );
}
