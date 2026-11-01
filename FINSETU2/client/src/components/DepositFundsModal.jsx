import React, { useState } from 'react';
import { CreditCard, X, AlertCircle, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import api from '../services/api';

export default function DepositFundsModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      setError('Minimum deposit amount is ₹100.00.');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Request test order from backend
      const orderRes = await api.post('/payments/create-order', {
        amount: numAmount,
        paymentMethod
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create payment gateway order.');
      }

      const { order, isSimulated } = orderRes.data;

      // 2. Complete payment in test mode / simulation
      // In sandbox/test environment, simulate checkout response with simulated gateway payment ID
      const simulatedPaymentId = `pay_test_${Date.now().toString(36)}_${Math.floor(1000 + Math.random() * 9000)}`;
      const simulatedSignature = 'TEST_HMAC_SHA256_VERIFIED_SIGNATURE';

      // 3. Verify signature and credit balance on backend
      const verifyRes = await api.post('/payments/verify', {
        razorpay_order_id: order.id,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature: simulatedSignature,
        amount: numAmount,
        paymentMethod,
        isSimulated
      });

      if (verifyRes.data.success) {
        setSuccessMsg(`Deposit of ₹${numAmount.toLocaleString('en-IN')} confirmed via Razorpay Test Environment! Ref: ${verifyRes.data.transaction.referenceId}`);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setAmount('');
          setSuccessMsg('');
        }, 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const presetAmounts = [500, 2000, 5000, 10000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Deposit Funds (Razorpay Gateway)</h3>
              <p className="text-[11px] text-slate-300">Sandbox Test Environment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDeposit} className="p-6 space-y-4 text-xs">
          <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-[11px]">
              Razorpay Test Mode: Simulates instant settlement without debiting real bank accounts.
            </span>
          </div>

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

          {/* Quick Amounts */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Quick Select Amount</label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 font-semibold transition"
                >
                  ₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Deposit Amount (INR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="1"
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (min ₹100)"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Payment Rails</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'UPI', label: 'UPI QR' },
                { id: 'DEBIT_CARD', label: 'Debit Card' },
                { id: 'CREDIT_CARD', label: 'Credit Card' },
                { id: 'NET_BANKING', label: 'Net Banking' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`py-2 px-1 text-center rounded-lg border font-semibold transition ${
                    paymentMethod === opt.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
                  <span>Verifying Razorpay Order...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Test Checkout</span>
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
