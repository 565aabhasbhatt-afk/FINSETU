import React, { useState } from 'react';
import { Layers, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function ApplyLoanModal({ isOpen, onClose, selectedOffer, onSuccess }) {
  const [amount, setAmount] = useState(selectedOffer?.minAmount?.toString() || '100000');
  const [tenure, setTenure] = useState(selectedOffer?.tenureMonthsMin?.toString() || '24');
  const [purpose, setPurpose] = useState('');
  const [employmentType, setEmploymentType] = useState('Salaried Professional');
  const [monthlyIncome, setMonthlyIncome] = useState('85000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !selectedOffer) return null;

  // Calculate EMI: E = P * r * (1+r)^n / ((1+r)^n - 1)
  const P = parseFloat(amount) || 0;
  const annualRate = selectedOffer.interestRate || 10.5;
  const r = annualRate / 12 / 100;
  const n = parseInt(tenure, 10) || 12;
  const calculatedEmi = P > 0 && n > 0 && r > 0
    ? Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (P < selectedOffer.minAmount || P > selectedOffer.maxAmount) {
      setError(`Amount must be between ₹${selectedOffer.minAmount.toLocaleString('en-IN')} and ₹${selectedOffer.maxAmount.toLocaleString('en-IN')}.`);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/loans/apply', {
        loanOfferId: selectedOffer.id,
        amount: P,
        tenureMonths: n,
        monthlyEmi: calculatedEmi,
        purpose: purpose.trim() || 'General Credit Facility',
        employmentType,
        monthlyIncome: parseFloat(monthlyIncome) || 50000
      });

      if (res.data.success) {
        setSuccessMsg(`Application approved! Application Reference: ${res.data.application.id}`);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Loan application could not be submitted.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Apply for {selectedOffer.title}</h3>
              <p className="text-[11px] text-slate-300">Rate: {selectedOffer.interestRate}% p.a. • Instant Pre-Approval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Loan Amount (INR)</label>
              <input
                type="number"
                min={selectedOffer.minAmount}
                max={selectedOffer.maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Range: ₹{selectedOffer.minAmount.toLocaleString('en-IN')} - ₹{selectedOffer.maxAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tenure (Months)</label>
              <input
                type="number"
                min={selectedOffer.tenureMonthsMin}
                max={selectedOffer.tenureMonthsMax}
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {selectedOffer.tenureMonthsMin} to {selectedOffer.tenureMonthsMax} months
              </span>
            </div>
          </div>

          {/* Real-time EMI display */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estimated Monthly EMI</span>
              <span className="text-base font-extrabold text-blue-700">₹{calculatedEmi.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400"> / month</span>
            </div>
            <div className="text-right text-[11px] text-slate-600">
              <div>Interest: <span className="font-semibold">{selectedOffer.interestRate}%</span></div>
              <div>Processing: <span className="font-semibold">{selectedOffer.processingFeePct}%</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Salaried Professional">Salaried Professional</option>
                <option value="Self Employed / Business">Self Employed / Business</option>
                <option value="Contractor / Consultant">Contractor / Consultant</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Monthly Income (INR)</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Purpose of Loan</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Higher education, home enhancement, working capital"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !!successMsg}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Evaluating Credit Risk...</span>
                </>
              ) : (
                <>
                  <span>Submit Loan Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
