import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Activity,
  Zap,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  FileCheck,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0A192F] via-[#0E223D] to-[#0A192F] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Next-Generation FinTech & Cybersecurity Co-Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Bridging Finance and <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-300">
              Digital Security
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            FINSETU is a unified digital financial ecosystem that combines modern banking services, seamless digital payments and intelligent cybersecurity monitoring. Our objective is to demonstrate how financial convenience and digital security can work together in one integrated platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
              >
                <span>Launch Banking Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
                >
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition"
                >
                  Open Digital Account
                </Link>
              </>
            )}

            <Link
              to="/ai-guardian"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm border border-blue-400/40 flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>🛡️ AI Financial Guardian</span>
            </Link>

            <Link
              to="/security/simulator"
              className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 font-semibold text-xs sm:text-sm border border-emerald-500/30 flex items-center gap-2 transition"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Cyber Threat Simulator</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="text-xl font-bold text-white">₹0.00</div>
              <div className="text-[11px] text-slate-400">Zero Vulnerability Exposure</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="text-xl font-bold text-emerald-400">&lt; 40 ms</div>
              <div className="text-[11px] text-slate-400">Threat Detection Latency</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="text-xl font-bold text-white">6 Vectors</div>
              <div className="text-[11px] text-slate-400">Isolated Attack Scenarios</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <div className="text-xl font-bold text-blue-400">100%</div>
              <div className="text-[11px] text-slate-400">Razorpay Test Integrity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Banking Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">High-Integrity Financial Services</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Modern Digital Banking Features</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Streamlined account management engineered with institutional-grade risk models and zero trust architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:border-blue-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Instant UPI & Direct Ledger</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transfer funds seamlessly using custom virtual UPI handles and bank account coordinates with instant double-entry ledger balancing.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold pt-1">
              <span>Single-click Transfers</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:border-blue-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Razorpay Test Gateway</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deposit funds via verified sandbox payment orders supporting credit cards, debit cards, UPI, and net banking with cryptographic signature audits.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-1">
              <span>HMAC SHA256 Verification</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:border-blue-400/50 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Credit Lines & Loans</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Personal, education, home, and enterprise business loans with an interactive EMI calculator and instant automated pre-approval underwriting.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold pt-1">
              <span>Instant EMI Estimation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cybersecurity Intelligence Center Spotlight */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>FINSETU SECURITY INTELLIGENCE CENTRE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Dual-Portal Cyber Simulation</h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                Experience simulated adversarial attacks running across an isolated banking mock environment, synchronized in real time with the SecOps Impact Analysis console via WebSocket.
              </p>
            </div>

            <Link
              to="/security/simulator"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition shrink-0"
            >
              <span>Launch Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portal A Preview */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-red-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> PORTAL A: ATTACK SIMULATOR
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/60 text-red-300 border border-red-800/40 font-mono">
                  ACTIVE_INJECTOR
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trigger 6 real-world threat vectors including Brute-Force sprays, Phishing domain harvesters, Headless Puppeteer logins, Account Takeovers (ATO), Smurfing AML structuring, and JWT Token Replay.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-red-400">&gt; ATK-9810 injects 500 credential pairs into /api/auth/login</div>
                <div className="text-amber-300">&gt; Geo-velocity anomaly detected (Mumbai -&gt; Frankfurt)</div>
                <div className="text-emerald-400">&gt; Rate-limiter enforced. IP quarantined.</div>
              </div>
            </div>

            {/* Portal B Preview */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> PORTAL B: IMPACT ANALYSIS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/60 text-blue-300 border border-blue-800/40 font-mono">
                  SECOPS_TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Observe the automated defense response in real time. Inspect potential financial impact estimates, detection latency counters, automated mitigation playbooks, and Recharts incident graphs.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-blue-300">&gt; Automated Response: Token revocation broadcasted</div>
                <div className="text-purple-300">&gt; Potential Impact Contained: ₹1,50,000.00</div>
                <div className="text-emerald-400">&gt; Status: DEFENDED (Latency: 38ms)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Helper */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-blue-950 text-sm">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Pre-Configured Demonstration Accounts</span>
          </div>
          <p className="text-blue-900">
            For rapid evaluation, you can sign in directly using the pre-seeded accounts or register a brand-new user with immediate ₹25,000 testing credit:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs">
              <div className="font-semibold text-slate-900">Standard Banking User</div>
              <div className="text-slate-600 font-mono mt-0.5">Email: user@finsetu.com</div>
              <div className="text-slate-600 font-mono">Password: Password@123</div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs">
              <div className="font-semibold text-slate-900">Chief SecOps Administrator</div>
              <div className="text-slate-600 font-mono mt-0.5">Email: admin@finsetu.com</div>
              <div className="text-slate-600 font-mono">Password: Password@123</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
