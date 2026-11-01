import React, { useState, useEffect } from 'react';
import {
  Layers,
  Calculator,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import ApplyLoanModal from '../components/ApplyLoanModal';

export default function LoansPage() {
  const [loanOffers, setLoanOffers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOfferForModal, setSelectedOfferForModal] = useState(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  // EMI Calculator State
  const [calcAmount, setCalcAmount] = useState(500000);
  const [calcRate, setCalcRate] = useState(9.5);
  const [calcTenure, setCalcTenure] = useState(36);

  const fetchLoanData = async () => {
    try {
      setIsLoading(true);
      const [offersRes, appsRes] = await Promise.all([
        api.get('/loans/offers'),
        api.get('/loans/my-applications')
      ]);

      if (offersRes.data && offersRes.data.success) {
        setLoanOffers(offersRes.data.data);
      }
      if (appsRes.data && appsRes.data.success) {
        setMyApplications(appsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading loan data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, []);

  // Compute EMI for standalone calculator
  const r = calcRate / 12 / 100;
  const n = calcTenure;
  const P = calcAmount;
  const emi = P > 0 && n > 0 && r > 0
    ? Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
    : 0;
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  const handleOpenApply = (offer) => {
    setSelectedOfferForModal(offer);
    setIsApplyOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Lending & Financial Services
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-approved personal, education, home, and enterprise business facilities
          </p>
        </div>

        <button
          onClick={fetchLoanData}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs self-start sm:self-auto"
          title="Refresh Offers"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Demonstration Notice */}
      <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>Demonstration Products Notice:</strong> All loan offers presented are demonstration financial products. Applications trigger automated sandbox credit verification and store records in PostgreSQL.
        </span>
      </div>

      {/* 4 Loan Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Curated Credit Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loanOffers.map((offer) => {
            const previewR = offer.interestRate / 12 / 100;
            const previewP = offer.minAmount;
            const previewN = offer.tenureMonthsMin;
            const previewEmi = Math.round((previewP * previewR * Math.pow(1 + previewR, previewN)) / (Math.pow(1 + previewR, previewN) - 1));

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-500/50 transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                      {offer.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">DEMO_OFFER</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{offer.title}</h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-blue-600">{offer.interestRate}%</span>
                      <span className="text-xs text-slate-500 font-medium">p.a.</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount:</span>
                      <span className="font-semibold text-slate-800">
                        ₹{(offer.minAmount / 100000).toFixed(1)}L - ₹{(offer.maxAmount / 100000).toFixed(0)}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tenure:</span>
                      <span className="font-semibold text-slate-800">
                        {offer.tenureMonthsMin} - {offer.tenureMonthsMax} mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Starting EMI:</span>
                      <span className="font-bold text-emerald-600">
                        ₹{previewEmi.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-1 text-[11px] text-slate-500 pt-2">
                    {offer.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenApply(offer)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive EMI Calculator Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Interactive EMI & Amortization Calculator</h2>
            <p className="text-xs text-slate-500">Fine-tune capital amounts, interest rates, and loan tenure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sliders (2 Cols) */}
          <div className="lg:col-span-2 space-y-5 text-xs">
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between font-semibold mb-2">
                <span className="text-slate-700">Loan Amount (INR)</span>
                <span className="text-sm font-bold text-blue-600">₹{calcAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="10000000"
                step="25000"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹50,000</span>
                <span>₹1,00,00,000</span>
              </div>
            </div>

            {/* Interest Slider */}
            <div>
              <div className="flex justify-between font-semibold mb-2">
                <span className="text-slate-700">Annual Interest Rate (%)</span>
                <span className="text-sm font-bold text-blue-600">{calcRate}%</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="24.0"
                step="0.25"
                value={calcRate}
                onChange={(e) => setCalcRate(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5.0%</span>
                <span>24.0%</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex justify-between font-semibold mb-2">
                <span className="text-slate-700">Loan Tenure</span>
                <span className="text-sm font-bold text-blue-600">{calcTenure} Months ({(calcTenure / 12).toFixed(1)} yrs)</span>
              </div>
              <input
                type="range"
                min="6"
                max="240"
                step="6"
                value={calcTenure}
                onChange={(e) => setCalcTenure(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>6 Months</span>
                <span>240 Months</span>
              </div>
            </div>
          </div>

          {/* Calculator Output Card (1 Col) */}
          <div className="bg-[#0A192F] text-white rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Monthly EMI</span>
                <div className="text-3xl font-extrabold text-blue-400 mt-1">
                  ₹{emi.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal Capital:</span>
                  <span className="font-semibold">₹{P.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Interest Payable:</span>
                  <span className="font-semibold text-emerald-400">₹{Math.max(0, totalInterest).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Settlement:</span>
                  <span className="font-semibold">₹{totalPayment.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenApply(loanOffers[0] || { id: 'custom', title: 'Calculated Facility', interestRate: calcRate, minAmount: calcAmount, maxAmount: calcAmount, tenureMonthsMin: calcTenure, tenureMonthsMax: calcTenure })}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <span>Apply with these Parameters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* My Submitted Loan Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Your Submitted Loan Applications</h3>
            <p className="text-xs text-slate-500">Applications stored and underwritten in PostgreSQL</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {myApplications.length} Submissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="pb-3 px-3">Application ID</th>
                <th className="pb-3 px-3">Facility Title</th>
                <th className="pb-3 px-3">Sanctioned Amount</th>
                <th className="pb-3 px-3">Tenure</th>
                <th className="pb-3 px-3">Calculated EMI</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Underwriting Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myApplications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No loan applications submitted yet. Pick any loan offer above to apply.
                  </td>
                </tr>
              ) : (
                myApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {app.id.slice(0, 14)}...
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {app.loanOffer?.title || 'FINSETU Facility'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      ₹{Number(app.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {app.tenureMonths} Months
                    </td>
                    <td className="py-3 px-3 font-semibold text-blue-600">
                      ₹{Number(app.monthlyEmi).toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {app.reviewerNotes || 'Automated verification completed.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Loan Modal */}
      <ApplyLoanModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        selectedOffer={selectedOfferForModal}
        onSuccess={fetchLoanData}
      />
    </div>
  );
}
