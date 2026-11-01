import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  ShieldCheck,
  CreditCard,
  History,
  Activity,
  Layers,
  FileText,
  User,
  LogOut,
  Bell,
  Radio,
  Menu,
  X,
  Lock,
  Shield
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected, alerts } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Banking Dashboard', path: '/dashboard', icon: CreditCard, authOnly: true },
    { label: 'AI Guardian', path: '/ai-guardian', icon: Shield, badge: 'AI' },
    { label: 'Transactions', path: '/transactions', icon: History, authOnly: true },
    { label: 'Login & Device Activity', path: '/security/activity', icon: ShieldCheck, authOnly: true },
    { label: 'Cyber Threat Simulator', path: '/security/simulator', icon: Activity },
    { label: 'Loan Offers & EMI', path: '/loans', icon: Layers, authOnly: true },
    { label: 'Admin Ops', path: '/admin', icon: Lock, authOnly: true, adminOnly: true },
  ];

  const visibleLinks = navLinks.filter(link => {
    if (!isAuthenticated && link.authOnly) return false;
    if (link.adminOnly && user?.role !== 'ADMIN') return false;
    return true;
  });

  return (
    <nav className="bg-[#0A192F] text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/30 border border-blue-400/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  FINSETU
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                </span>
                <span className="text-[10px] text-slate-300 font-medium tracking-wide">
                  Bridging Finance & Digital Security
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {visibleLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Live Socket Status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={isConnected ? 'Real-Time SecOps Telemetry Active' : 'Connecting to Telemetry...'}
            >
              <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isConnected ? 'LIVE TELEMETRY' : 'CONNECTING'}</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition relative"
                    title="Security & Transaction Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {alerts.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    )}
                  </button>

                  {/* Dropdown Alerts */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-slate-900">
                        <span>Real-Time Security Feed</span>
                        <span className="text-[10px] text-slate-500">{alerts.length} alerts</span>
                      </div>
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {alerts.length === 0 ? (
                          <div className="py-4 text-center text-slate-400">
                            No active high-risk alerts at this moment.
                          </div>
                        ) : (
                          alerts.map((alt, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-2"
                            >
                              <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0"></div>
                              <div>
                                <div className="font-semibold text-slate-900">{alt.title}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {new Date(alt.time).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Pill */}
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white border border-blue-400/40">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold leading-tight text-slate-200">
                      {user?.fullName?.split(' ')[0] || 'User'}
                    </div>
                    <div className="text-[10px] text-blue-400 font-medium">
                      {user?.role || 'USER'}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                  title="Secure Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  Open Account
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {visibleLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
