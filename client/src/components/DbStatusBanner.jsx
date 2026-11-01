import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function DbStatusBanner() {
  const { dbStatus } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!dbStatus) return null;

  const isConnected = dbStatus.connected === true;

  const copyConfigSnippet = () => {
    const snippet = `DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"\nDIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`border-b text-xs transition-colors ${isConnected ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/90 border-amber-200 text-amber-950'}`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span className="font-semibold">
            {isConnected
              ? 'PostgreSQL (Supabase) Database: Connected & Operational'
              : 'Database Notice: Running with Demonstration Data Layer'}
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-600 hidden md:inline">
            {isConnected
              ? 'Real-time Prisma ORM queries executing directly on hosted PostgreSQL.'
              : 'Live demo store active. Enter your Supabase connection string in server/.env to sync.'}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 font-medium hover:underline text-slate-700 bg-white/70 px-2 py-0.5 rounded border border-slate-200 shadow-2xs"
        >
          <span>{isConnected ? 'View Connection Details' : 'Supabase Setup Instructions'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white border-t border-slate-200 p-4 text-slate-700 shadow-inner">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Database Configuration Architecture
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {isConnected ? 'CONNECTED' : 'SUPABASE_UNCONFIGURED'}
              </span>
            </div>

            <p className="text-slate-600 text-xs">
              {dbStatus.message}
            </p>

            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1 relative">
              <button
                onClick={copyConfigSnippet}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Template'}
              </button>
              <div className="text-slate-400"># In server/.env:</div>
              <div className="text-blue-300">DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"</div>
              <div className="text-blue-300">DIRECT_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"</div>
              <div className="text-slate-400 pt-1"># Run sync:</div>
              <div className="text-emerald-400">npm run prisma:push</div>
              <div className="text-emerald-400">npm run prisma:seed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
