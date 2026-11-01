import React, { useState } from 'react';
import { QrCode, Copy, Check, X, ShieldCheck } from 'lucide-react';

export default function ReceiveMoneyModal({ isOpen, onClose, userAccount, userName }) {
  const [copied, setCopied] = useState('');

  if (!isOpen) return null;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const upiId = userAccount?.upiId || 'user@finsetu';
  const accNumber = userAccount?.accountNumber || '409182376120';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Receive Funds & QR</h3>
              <p className="text-[11px] text-slate-300">Scan using any UPI enabled app</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center text-xs space-y-5">
          {/* QR Code Presentation */}
          <div className="inline-block p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-xs">
            {/* SVG Procedural QR Code Visual */}
            <svg viewBox="0 0 160 160" className="w-40 h-40 mx-auto">
              <rect width="160" height="160" fill="white" />
              {/* Corner markers */}
              <rect x="10" y="10" width="40" height="40" fill="#0A192F" rx="4" />
              <rect x="18" y="18" width="24" height="24" fill="white" rx="2" />
              <rect x="24" y="24" width="12" height="12" fill="#2563EB" rx="1" />

              <rect x="110" y="10" width="40" height="40" fill="#0A192F" rx="4" />
              <rect x="118" y="18" width="24" height="24" fill="white" rx="2" />
              <rect x="124" y="24" width="12" height="12" fill="#2563EB" rx="1" />

              <rect x="10" y="110" width="40" height="40" fill="#0A192F" rx="4" />
              <rect x="18" y="118" width="24" height="24" fill="white" rx="2" />
              <rect x="24" y="124" width="12" height="12" fill="#2563EB" rx="1" />

              {/* Data matrix pattern */}
              <rect x="60" y="15" width="10" height="10" fill="#0A192F" />
              <rect x="80" y="15" width="15" height="10" fill="#2563EB" />
              <rect x="65" y="35" width="20" height="10" fill="#0A192F" />
              <rect x="15" y="60" width="10" height="15" fill="#2563EB" />
              <rect x="35" y="65" width="15" height="10" fill="#0A192F" />
              <rect x="60" y="60" width="40" height="40" fill="#0A192F" rx="2" />
              <circle cx="80" cy="80" r="10" fill="#2563EB" />
              <rect x="115" y="60" width="15" height="15" fill="#0A192F" />
              <rect x="135" y="80" width="10" height="20" fill="#2563EB" />
              <rect x="60" y="115" width="15" height="15" fill="#2563EB" />
              <rect x="85" y="110" width="20" height="10" fill="#0A192F" />
              <rect x="115" y="115" width="30" height="15" fill="#0A192F" />
              <rect x="75" y="135" width="25" height="12" fill="#2563EB" />
            </svg>
            <div className="mt-2 font-semibold text-slate-800 text-[11px]">{userName || 'Finsetu Account'}</div>
          </div>

          {/* Account Identifiers */}
          <div className="space-y-2 text-left">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">VIRTUAL UPI ID</span>
                <span className="font-mono font-bold text-slate-900">{upiId}</span>
              </div>
              <button
                onClick={() => copyToClipboard(upiId, 'upi')}
                className="p-1.5 text-slate-600 hover:text-blue-600 bg-white rounded-lg border border-slate-200 shadow-2xs"
                title="Copy UPI ID"
              >
                {copied === 'upi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">BANK ACCOUNT NUMBER</span>
                <span className="font-mono font-bold text-slate-900">{accNumber}</span>
              </div>
              <button
                onClick={() => copyToClipboard(accNumber, 'acc')}
                className="p-1.5 text-slate-600 hover:text-blue-600 bg-white rounded-lg border border-slate-200 shadow-2xs"
                title="Copy Account Number"
              >
                {copied === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FINSETU Real-Time Settlement Clearing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
