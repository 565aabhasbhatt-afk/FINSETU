import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">FINSETU</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Unified digital financial ecosystem pairing modern core banking with autonomous cybersecurity threat simulation and intelligence.
            </p>
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 | 256-bit AES Vault Encryption</span>
            </div>
          </div>

          {/* Core Banking Services */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Banking & Fintech
            </h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-blue-400 transition">High-Yield Savings & Current</Link></li>
              <li><Link to="/transactions" className="hover:text-blue-400 transition">Instant UPI & Net Banking</Link></li>
              <li><Link to="/transactions" className="hover:text-blue-400 transition">Razorpay Test Gateway</Link></li>
              <li><Link to="/loans" className="hover:text-blue-400 transition">Pre-Approved Personal & Home Loans</Link></li>
              <li><Link to="/loans" className="hover:text-blue-400 transition">Interactive EMI Calculator</Link></li>
            </ul>
          </div>

          {/* SecOps & Cyber Intelligence */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Cybersecurity Centre
            </h4>
            <ul className="space-y-2">
              <li><Link to="/security/simulator" className="hover:text-blue-400 transition">Portal A: Threat Simulator</Link></li>
              <li><Link to="/security/simulator" className="hover:text-blue-400 transition">Portal B: Real-Time Impact Analysis</Link></li>
              <li><Link to="/security/activity" className="hover:text-blue-400 transition">Login History & Device Tracker</Link></li>
              <li><Link to="/security/activity" className="hover:text-blue-400 transition">Active Session Management</Link></li>
              <li><Link to="/admin" className="hover:text-blue-400 transition">Administrative Audit Ledger</Link></li>
            </ul>
          </div>

          {/* Regulatory & Compliance Disclaimers */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Security Compliance
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
              All payment gateway integrations operate in strict Razorpay Test Mode. Sensitive credentials, CVVs, UPI PINs, or banking passwords are never stored in plain text.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Isolated Mock Security Sandbox</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 FINSETU Platform. Tagline: "Bridging Finance and Digital Security."
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span className="hover:text-slate-400">Terms of Service</span>
            <span className="hover:text-slate-400">SecOps Disclosure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
