import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  RefreshCw,
  Cpu,
  Brain,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import {
  calculatePaymentImpactLocal,
  calculateRiskScoreLocal,
  simulateWhatIfPayment,
  analyzePaymentRisk,
  activateSafeMode
} from '../services/guardianService';

export default function AIFinancialGuardian({ currentBalance = 18450 }) {
  // Active simulation balance (defaults to 18450 to match exact Hackathon Demo specification)
  const [activeBalance, setActiveBalance] = useState(18450);

  // Shared / What-If inputs
  const [amount, setAmount] = useState('5000');
  const [recipient, setRecipient] = useState('Amazon');
  const [category, setCategory] = useState('Shopping');

  // Simulation outputs
  const [whatIfResult, setWhatIfResult] = useState(() =>
    calculatePaymentImpactLocal({
      currentBalance: 18450,
      amount: 5000,
      recipient: 'Amazon',
      category: 'Shopping'
    })
  );

  // Risk Guardian inputs & outputs
  const [riskAmount, setRiskAmount] = useState('8000');
  const [riskRecipient, setRiskRecipient] = useState('New Recipient');
  const [riskCategory, setRiskCategory] = useState('Shopping');

  const [riskResult, setRiskResult] = useState(() =>
    calculateRiskScoreLocal({
      amount: 8000,
      recipient: 'New Recipient',
      category: 'Shopping'
    })
  );

  // UI state
  const [isSimulatingWhatIf, setIsSimulatingWhatIf] = useState(false);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [showSafeModeModal, setShowSafeModeModal] = useState(false);
  const [safeModeSuccess, setSafeModeSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'WHAT_IF' | 'RISK_GUARDIAN'

  // Update What-If simulation when activeBalance or amount changes
  const runWhatIfSimulation = (customAmount = null, customCategory = null, customRecipient = null, customBal = null) => {
    setIsSimulatingWhatIf(true);
    const targetAmount = customAmount !== null ? customAmount : parseFloat(amount) || 0;
    const targetCat = customCategory !== null ? customCategory : category;
    const targetRec = customRecipient !== null ? customRecipient : recipient;
    const targetBal = customBal !== null ? customBal : activeBalance;

    const res = calculatePaymentImpactLocal({
      currentBalance: targetBal,
      amount: targetAmount,
      recipient: targetRec,
      category: targetCat
    });

    setWhatIfResult(res);
    setTimeout(() => setIsSimulatingWhatIf(false), 200);
  };

  // Run Risk Guardian analysis
  const runRiskAnalysis = (customAmt = null, customRec = null, customCat = null) => {
    setIsAnalyzingRisk(true);
    const targetAmt = customAmt !== null ? customAmt : parseFloat(riskAmount) || 0;
    const targetRec = customRec !== null ? customRec : riskRecipient;
    const targetCat = customCat !== null ? customCat : riskCategory;

    const res = calculateRiskScoreLocal({
      amount: targetAmt,
      recipient: targetRec,
      category: targetCat
    });

    setRiskResult(res);
    setTimeout(() => setIsAnalyzingRisk(false), 200);
  };

  // Quick Amount Buttons Handler
  const handleQuickAmountClick = (val) => {
    setAmount(val.toString());
    runWhatIfSimulation(val);
  };

  const handleProtectPaymentClick = async () => {
    setShowSafeModeModal(true);
    setSafeModeSuccess(false);
    await activateSafeMode({
      amount: riskAmount,
      recipient: riskRecipient,
      category: riskCategory
    });
  };

  // Color mapping helpers
  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'CRITICAL':
        return 'bg-red-600 text-white font-extrabold';
      case 'HIGH IMPACT':
        return 'bg-red-500 text-white font-extrabold';
      case 'CAUTION':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
      default:
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold';
    }
  };

  const getSignalBadge = (level) => {
    switch (level) {
      case 'HIGH':
        return 'text-red-700 bg-red-50 border border-red-200';
      case 'MEDIUM':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    }
  };

  const getSignalDot = (level) => {
    switch (level) {
      case 'HIGH':
        return '🔴';
      case 'MEDIUM':
        return '🟡';
      default:
        return '🟢';
    }
  };

  return (
    <section id="ai-guardian" className="space-y-6 scroll-mt-20">
      {/* Main AI Guardian Header Card */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0E2A47] to-[#0A192F] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-500/30 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>AI-POWERED PRE-TRANSACTION INTELLIGENCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>🛡️ FinSetu AI Financial Guardian</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              “Know the impact before you pay.”
            </p>
          </div>

          {/* Tab Navigation Pill */}
          <div className="flex items-center p-1 bg-slate-900/80 border border-slate-700 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setActiveTab('WHAT_IF')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'WHAT_IF'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔮 What-If
            </button>
            <button
              onClick={() => setActiveTab('RISK_GUARDIAN')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'RISK_GUARDIAN'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛡️ Risk Guardian
            </button>
          </div>
        </div>
      </div>

      {/* DUAL FEATURES GRID */}
      <div className={`grid gap-6 ${activeTab === 'ALL' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* ========================================================================= */}
        {/* 1. 🔮 WHAT-IF PAYMENT CARD */}
        {/* ========================================================================= */}
        {(activeTab === 'ALL' || activeTab === 'WHAT_IF') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200/90 shadow-md space-y-6 flex flex-col justify-between hover:border-blue-400/40 transition">
            <div className="space-y-5">
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">What-If Payment</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    “See the financial impact before you spend.”
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  PREDICTIVE_SIMULATOR
                </span>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-semibold">Payment Amount</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Balance: ₹{activeBalance.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextBal = activeBalance === 18450 ? (currentBalance || 25000) : 18450;
                          setActiveBalance(nextBal);
                          runWhatIfSimulation(null, null, null, nextBal);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
                        title="Toggle between Demo balance (₹18,450) and Live Vault balance"
                      >
                        {activeBalance === 18450 ? 'Use Live' : 'Use ₹18,450'}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        runWhatIfSimulation(parseFloat(e.target.value) || 0);
                      }}
                      placeholder="e.g. 2500"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Interactive Quick Amounts */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Interactive Quick Amounts:
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {[500, 1000, 2500, 5000, 10000].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => handleQuickAmountClick(val)}
                        className={`py-1.5 px-1 rounded-xl text-xs font-bold transition border ${
                          Number(amount) === val
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-102'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        ₹{val.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Merchant / Recipient</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value);
                        runWhatIfSimulation(null, null, e.target.value);
                      }}
                      placeholder="e.g. Amazon, Netflix"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        runWhatIfSimulation(null, e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Shopping">Shopping</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Bills & Utilities">Bills & Utilities</option>
                      <option value="Groceries & Food">Groceries & Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Investments">Investments</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => runWhatIfSimulation()}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSimulatingWhatIf ? 'animate-spin' : ''}`} />
                  <span>SIMULATE PAYMENT</span>
                </button>
              </div>

              {/* SIMULATION VISUAL IMPACT DISPLAY */}
              <div className="space-y-4 pt-2">
                {/* 3-Step Flow: BEFORE -> PAYMENT -> AFTER */}
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Immediate Liquidity Flow
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {/* Before */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block">BEFORE</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹{whatIfResult.currentBalance?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Payment */}
                    <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-blue-600 font-semibold block">PAYMENT</span>
                      <span className="text-sm font-extrabold text-red-600">
                        − ₹{whatIfResult.paymentAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* After */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block">AFTER</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹{whatIfResult.remainingBalance?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Predicted Month-End Box */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-blue-400" /> PREDICTED MONTH-END
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Target Buffer: ₹{whatIfResult.prediction?.safetyTarget?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-medium">Before:</span>
                      <span className="text-base font-extrabold text-slate-200">
                        ₹{whatIfResult.prediction?.predictedBefore?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-medium">After:</span>
                      <span className={`text-base font-extrabold ${
                        whatIfResult.prediction?.predictedAfter < 5000 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        ₹{whatIfResult.prediction?.predictedAfter?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Verdict Box */}
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  whatIfResult.verdict === 'CRITICAL' || whatIfResult.verdict === 'HIGH IMPACT'
                    ? 'bg-red-50/70 border-red-200'
                    : whatIfResult.verdict === 'CAUTION'
                    ? 'bg-amber-50/80 border-amber-200'
                    : 'bg-emerald-50/70 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-800" />
                      <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">AI VERDICT</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getVerdictBadge(whatIfResult.verdict)}`}>
                      {whatIfResult.verdict}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900">
                    “{whatIfResult.verdictHeadline}”
                  </p>

                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {whatIfResult.reasons?.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Dynamic simulation model</span>
              <span className="font-semibold text-blue-600">Real-time heuristics</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. 🛡️ PAYMENT RISK GUARDIAN CARD */}
        {/* ========================================================================= */}
        {(activeTab === 'ALL' || activeTab === 'RISK_GUARDIAN') && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200/90 shadow-md space-y-6 flex flex-col justify-between hover:border-blue-400/40 transition">
            <div className="space-y-5">
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-slate-900 text-blue-400">
                      <Shield className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">AI Payment Guardian</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    “Your security layer before money moves.”
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                  RISK_AGENT
                </span>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={riskAmount}
                        onChange={(e) => {
                          setRiskAmount(e.target.value);
                          runRiskAnalysis(parseFloat(e.target.value) || 0);
                        }}
                        placeholder="e.g. 8000"
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Recipient</label>
                    <input
                      type="text"
                      value={riskRecipient}
                      onChange={(e) => {
                        setRiskRecipient(e.target.value);
                        runRiskAnalysis(null, e.target.value);
                      }}
                      placeholder="e.g. New Recipient"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={riskCategory}
                    onChange={(e) => {
                      setRiskCategory(e.target.value);
                      runRiskAnalysis(null, null, e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Shopping">Shopping</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="Unverified P2P">Unverified P2P</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                  </select>
                </div>

                {/* Trust Score & Anomaly Summary */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      TRUST SCORE
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${
                        riskResult.trustScore < 35
                          ? 'text-red-500'
                          : riskResult.trustScore < 65
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {riskResult.trustScore} / 100
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wide ${
                        riskResult.overallRisk === 'HIGH' ? 'text-red-400' : 'text-slate-300'
                      }`}>
                        — {riskResult.overallRisk} RISK
                      </span>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className={`w-7 h-7 ${
                      riskResult.trustScore < 35
                        ? 'text-red-500'
                        : riskResult.trustScore < 65
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`} />
                  </div>
                </div>

                {/* Individual Security Signals (Visual Display) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Security Signal Telemetry:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {riskResult.signals?.map((sig, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{getSignalDot(sig.level)}</span>
                          <span>{sig.name}:</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getSignalBadge(sig.level)}`}>
                          {sig.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simple Language Explanation */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block">Guardian Analysis:</span>
                  <p className="text-slate-600 leading-relaxed">
                    “{riskResult.simpleExplanation}”
                  </p>
                </div>

                {/* Agentic Action Section */}
                {riskResult.needsAttention && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-red-800 font-extrabold text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>⚠️ PAYMENT NEEDS ATTENTION</span>
                    </div>

                    <div className="text-xs text-red-900 flex items-center justify-between">
                      <span>Recommended action:</span>
                      <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md text-[11px]">
                        Activate Safe Mode
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleProtectPaymentClick}
                        className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>🛡️ PROTECT PAYMENT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => alert('Proceeding with standard transfer (simulated bypass).')}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition"
                      >
                        CONTINUE ANYWAY
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Multi-signal security model</span>
              <span className="font-semibold text-slate-600">Simulated ML Architecture</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SAFE MODE PROTECTION MODAL (AGENTIC ACTION DEMO MOMENT) */}
      {/* ========================================================================= */}
      {showSafeModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">PAYMENT PROTECTED</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Safe Mode Activated</p>
                </div>
              </div>
              <button
                onClick={() => setShowSafeModeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                <p className="font-semibold text-xs leading-relaxed">
                  “Your payment of ₹{Number(riskAmount).toLocaleString('en-IN')} to {riskRecipient} is temporarily placed in Safe Mode while you verify the transaction.”
                </p>
              </div>

              {/* Verified Checklist */}
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Agentic Pre-Payment Verifications:
                </span>
                {[
                  'Amount reviewed',
                  'Recipient reviewed',
                  'Behaviour analysed',
                  'Device checked'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ {item}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Beneficiary verification challenge issued to ${riskRecipient}. Verification SMS/OTP sent.`);
                      setShowSafeModeModal(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    VERIFY RECIPIENT
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Navigating to review ledger context...');
                      setShowSafeModeModal(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    REVIEW PAYMENT
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSafeModeModal(false)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition"
                >
                  CANCEL
                </button>
              </div>

              <div className="text-[10px] text-center text-slate-400 pt-1">
                Simulated hackathon feature • No actual banking lock applied.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
