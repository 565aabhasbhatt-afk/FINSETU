import React, { useState, useCallback, useEffect } from 'react';
import {
  Send, X, AlertCircle, CheckCircle2, ArrowRight,
  ShieldCheck, Lock, Delete, ArrowLeft, KeyRound
} from 'lucide-react';
import api from '../services/api';

/* ─── Step indicator ──────────────────────────────────────────────── */
function StepDot({ active, done, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
          done
            ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
            : active
            ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
            : 'bg-slate-200 text-slate-400'
        }`}
      >
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : label}
      </div>
    </div>
  );
}

/* ─── Numpad button ───────────────────────────────────────────────── */
function NumpadBtn({ value, onClick, isDelete }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`
        h-14 w-full rounded-2xl font-semibold text-lg transition-all duration-150 active:scale-95 select-none
        ${isDelete
          ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center'
          : 'bg-white border border-slate-200 text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm'}
      `}
    >
      {isDelete ? <Delete className="w-5 h-5" /> : value}
    </button>
  );
}

/* ─── PIN Dots display ────────────────────────────────────────────── */
function PinDots({ pin, maxLen = 4 }) {
  return (
    <div className="flex items-center justify-center gap-4 my-6">
      {Array.from({ length: maxLen }).map((_, i) => (
        <div
          key={i}
          className={`
            w-5 h-5 rounded-full border-2 transition-all duration-200
            ${i < pin.length
              ? 'bg-blue-600 border-blue-600 scale-110 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
              : 'bg-transparent border-slate-300'}
          `}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function SendMoneyModal({ isOpen, onClose, onSuccess, currentBalance }) {
  /* Step 1 fields */
  const [recipient, setRecipient]         = useState('');
  const [amount, setAmount]               = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [description, setDescription]     = useState('');

  /* Step 2 PIN */
  const [pin, setPin]                     = useState('');

  /* Flow control */
  const [step, setStep]                   = useState(1);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');
  const [pinShake, setPinShake]           = useState(false);

  /* ── Reset state when modal closes ───────────────────────────── */
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setRecipient(''); setAmount(''); setDescription('');
        setPin(''); setStep(1); setError(''); setSuccessMsg('');
        setPinShake(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  /* ── Final submission with PIN ────────────────────────────────── */
  const handlePinSubmit = useCallback(async (currentPin) => {
    if (!currentPin || currentPin.length < 4) return;
    setError('');
    try {
      setIsLoading(true);
      const res = await api.post('/transactions/send', {
        recipientIdentifier: recipient.trim(),
        amount: parseFloat(amount),
        paymentMethod,
        description: description.trim() || undefined,
        transactionPin: currentPin
      });

      if (res.data.success) {
        setSuccessMsg(
          `₹${parseFloat(amount).toLocaleString('en-IN')} sent! Ref: ${res.data.transaction.referenceId}`
        );
        if (onSuccess) onSuccess();
        setTimeout(() => { onClose(); }, 2400);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Transaction could not be processed.';
      setError(msg);
      setPin('');
      setPinShake(true);
      setTimeout(() => setPinShake(false), 600);
    } finally {
      setIsLoading(false);
    }
  }, [recipient, amount, paymentMethod, description, onSuccess, onClose]);

  /* ── Auto-submit when all 4 digits entered ────────────────────── */
  useEffect(() => {
    if (isOpen && pin.length === 4 && step === 2 && !isLoading && !successMsg) {
      handlePinSubmit(pin);
    }
  }, [pin, isOpen, step, isLoading, successMsg, handlePinSubmit]);

  /* ── ALL HOOKS ABOVE THIS LINE — early return safe below ──────── */
  if (!isOpen) return null;

  /* ── Step 1 validation → proceed to PIN step ─────────────────── */
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setError('');
    const numAmount = parseFloat(amount);
    if (!recipient.trim()) {
      setError('Please provide a recipient account number, UPI ID, or email.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive transfer amount.');
      return;
    }
    if (numAmount > currentBalance) {
      setError(`Amount exceeds available balance (₹${currentBalance.toLocaleString('en-IN')}).`);
      return;
    }
    setStep(2);
  };

  /* ── Numpad handlers ──────────────────────────────────────────── */
  const handleNumpadPress = (val) => {
    if (pin.length < 4 && !isLoading) setPin(p => p + val);
  };
  const handleNumpadDelete = () => {
    if (!isLoading) setPin(p => p.slice(0, -1));
  };

  const quickRecipients = [
    { label: 'Priya Verma', value: 'priya@finsetu' },
    { label: 'SecOps Admin', value: 'admin@finsetu' }
  ];

  const numpadKeys = ['1','2','3','4','5','6','7','8','9','','0','DEL'];

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
        style={{ animation: 'modalIn 0.18s cubic-bezier(.2,.8,.4,1) both' }}
      >
        {/* ── Header ── */}
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow transition-colors duration-300 ${step === 2 ? 'bg-violet-600' : 'bg-blue-600'}`}>
              {step === 2 ? <Lock className="w-4 h-4 text-white" /> : <Send className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h3 className="font-bold text-sm">{step === 2 ? 'Authorize Transfer' : 'Send Money Securely'}</h3>
              <p className="text-[11px] text-slate-300">
                {step === 2 ? 'Enter your 4-digit transaction PIN' : 'Instant transfer via FINSETU Core Ledger'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step indicators ── */}
        <div className="flex items-center justify-center gap-4 py-3 border-b border-slate-100 bg-slate-50 text-[10px] text-slate-500 font-semibold">
          <StepDot active={step === 1} done={step > 1} label="1" />
          <span className={`text-[10px] font-semibold tracking-wide ${step === 1 ? 'text-blue-600' : 'text-slate-400'}`}>DETAILS</span>
          <div className={`flex-1 h-px max-w-[40px] transition-colors duration-500 ${step > 1 ? 'bg-blue-500' : 'bg-slate-200'}`} />
          <StepDot active={step === 2} done={!!successMsg} label="2" />
          <span className={`text-[10px] font-semibold tracking-wide ${step === 2 ? 'text-violet-600' : 'text-slate-400'}`}>PIN AUTH</span>
        </div>

        {/* ════════ STEP 1: DETAILS ════════ */}
        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick beneficiaries */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Quick Beneficiaries</label>
              <div className="flex gap-2 flex-wrap">
                {quickRecipients.map(r => (
                  <button
                    type="button" key={r.value}
                    onClick={() => setRecipient(r.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] border font-medium transition-all ${
                      recipient === r.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Recipient UPI ID / Email / Account</label>
              <input
                type="text" value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="e.g. priya@finsetu or 519283746192"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-semibold">Amount (INR)</label>
                <span className="text-[11px] text-slate-500">
                  Available: ₹{currentBalance?.toLocaleString('en-IN') || '0.00'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number" step="0.01" min="1" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {['UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'NET_BANKING'].map(method => (
                  <button
                    type="button" key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 text-center rounded-lg border font-semibold transition text-[11px] ${
                      paymentMethod === method
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {method === 'DEBIT_CARD' ? 'Debit' : method === 'CREDIT_CARD' ? 'Credit' : method === 'NET_BANKING' ? 'NetBank' : 'UPI'}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Note (Optional)</label>
              <input
                type="text" value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Consulting invoice, bill payment"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition text-sm"
              >
                <span>Continue to PIN Authorization</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Secured with 256-bit encryption · RBI compliant
              </p>
            </div>
          </form>
        )}

        {/* ════════ STEP 2: PIN ENTRY ════════ */}
        {step === 2 && (
          <div className="p-6">
            {/* Summary banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Sending to</p>
                  <p className="font-bold text-sm mt-0.5 truncate max-w-[180px]">{recipient}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Amount</p>
                  <p className="font-bold text-xl text-emerald-400 mt-0.5">₹{parseFloat(amount).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-1.5">
                <span className="text-[10px] bg-blue-600/30 text-blue-300 rounded px-1.5 py-0.5 font-medium">{paymentMethod}</span>
                {description && <span className="text-[10px] text-slate-400 truncate">· {description}</span>}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={`p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 mb-4 text-xs ${pinShake ? 'animate-shake' : ''}`}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">Transfer Successful!</p>
                  <p className="text-xs text-emerald-700">{successMsg}</p>
                </div>
              </div>
            )}

            {/* PIN entry area */}
            {!successMsg && (
              <>
                <div className="text-center mb-1">
                  <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-violet-200">
                    <KeyRound className="w-3.5 h-3.5" />
                    Enter Transaction PIN
                  </div>
                </div>

                <div className={pinShake ? 'animate-shake' : ''}>
                  <PinDots pin={pin} />
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8 gap-3 text-slate-600 font-semibold text-sm">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Verifying PIN &amp; Processing...
                  </div>
                ) : (
                  /* Numpad */
                  <div className="grid grid-cols-3 gap-2.5 mt-2">
                    {numpadKeys.map((key, i) =>
                      key === '' ? (
                        <div key={i} />
                      ) : key === 'DEL' ? (
                        <NumpadBtn key={i} value={key} onClick={handleNumpadDelete} isDelete />
                      ) : (
                        <NumpadBtn key={i} value={key} onClick={handleNumpadPress} />
                      )
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setPin(''); setError(''); }}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Edit Details
                  </button>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Demo PIN: <strong className="text-slate-600 ml-0.5">1234</strong>
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
}
