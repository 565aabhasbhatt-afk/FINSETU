import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Play,
  Pause,
  Square,
  RotateCcw,
  AlertTriangle,
  Server,
  Zap,
  Terminal,
  Cpu,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import api from '../services/api';

export default function SecuritySimulatorPage() {
  const { latestAttackEvent, latestImpactEvent, isConnected } = useSocket();

  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('BRUTE_FORCE');
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [eventsFeed, setEventsFeed] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Latest Impact state for Portal B
  const [impactState, setImpactState] = useState(null);

  // Load scenarios and analytics on mount
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [scenRes, currRes, analRes] = await Promise.all([
        api.get('/simulations/scenarios'),
        api.get('/simulations/current'),
        api.get('/simulations/analytics')
      ]);

      if (scenRes.data && scenRes.data.success) {
        setScenarios(scenRes.data.scenarios);
      }
      if (currRes.data && currRes.data.simulation) {
        setCurrentSimulation(currRes.data.simulation);
        setEventsFeed(currRes.data.simulation.events || []);
      }
      if (analRes.data && analRes.data.success) {
        setAnalytics(analRes.data.data);
      }
    } catch (err) {
      console.error('Error loading simulator data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // React to real-time Socket.IO attack events for Portal A
  useEffect(() => {
    if (!latestAttackEvent) return;

    if (latestAttackEvent.type === 'SIMULATION_STARTED') {
      setCurrentSimulation(latestAttackEvent.simulation);
      setEventsFeed([]);
    } else if (latestAttackEvent.type === 'SIMULATION_STEP') {
      setEventsFeed((prev) => [...prev, latestAttackEvent.event]);
    } else if (latestAttackEvent.type === 'SIMULATION_PAUSED') {
      setCurrentSimulation((prev) => (prev ? { ...prev, status: 'PAUSED' } : null));
    } else if (latestAttackEvent.type === 'SIMULATION_RESUMED') {
      setCurrentSimulation((prev) => (prev ? { ...prev, status: 'RUNNING' } : null));
    } else if (latestAttackEvent.type === 'SIMULATION_STOPPED') {
      setCurrentSimulation((prev) => (prev ? { ...prev, status: 'STOPPED' } : null));
    } else if (latestAttackEvent.type === 'SIMULATION_COMPLETED') {
      setCurrentSimulation(latestAttackEvent.simulation);
    } else if (latestAttackEvent.type === 'SIMULATION_RESET') {
      setCurrentSimulation(null);
      setEventsFeed([]);
      setImpactState(null);
    }
  }, [latestAttackEvent]);

  // React to real-time Socket.IO impact events for Portal B
  useEffect(() => {
    if (!latestImpactEvent) return;

    if (latestImpactEvent.type === 'IMPACT_DETECTED') {
      setImpactState({
        simulation: latestImpactEvent.simulation,
        ...latestImpactEvent.impact,
        detectionTime: new Date()
      });
    } else if (latestImpactEvent.type === 'IMPACT_STEP_UPDATE') {
      setImpactState((prev) =>
        prev
          ? {
              ...prev,
              mitigationStatus: latestImpactEvent.status,
              detectionLatencyMs: latestImpactEvent.detectionLatencyMs || prev.detectionLatencyMs,
              lastStep: latestImpactEvent.step
            }
          : null
      );
    } else if (latestImpactEvent.type === 'IMPACT_RESOLVED') {
      setImpactState((prev) =>
        prev
          ? {
              ...prev,
              mitigationStatus: latestImpactEvent.mitigationStatus,
              automatedResponse: latestImpactEvent.automatedResponse
            }
          : null
      );
    }
  }, [latestImpactEvent]);

  // Simulation controls
  const handleStart = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/simulations/start', {
        scenarioKey: selectedScenarioKey
      });
      if (res.data.success) {
        setCurrentSimulation(res.data.simulation);
        setEventsFeed([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start simulation');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      await api.post('/simulations/pause');
    } catch (e) {
      console.error(e);
    }
  };

  const handleResume = async () => {
    try {
      await api.post('/simulations/resume');
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = async () => {
    try {
      await api.post('/simulations/stop');
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      await api.post('/simulations/reset');
      setCurrentSimulation(null);
      setEventsFeed([]);
      setImpactState(null);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioKey);

  // Data for Category Bar Chart
  const categoryChartData = analytics
    ? Object.entries(analytics.categoriesCount).map(([category, count]) => ({
        name: category.split(' ')[0],
        fullName: category,
        count
      }))
    : [];

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500 text-white font-extrabold';
      case 'HIGH':
        return 'bg-red-100 text-red-800 font-bold border border-red-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Platform Title & Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              FINSETU SECURITY INTELLIGENCE CENTRE
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dual-portal adversarial simulation and synchronized real-time impact defense engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span>SOCKET CHANNEL: SIMULATION_COUPLED</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            SANDBOX: ISOLATED_MOCK
          </span>
        </div>
      </div>

      {/* DUAL PORTALS GRID: PORTAL A (LEFT) & PORTAL B (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ======================================================== */}
        {/* PORTAL A: ATTACK SIMULATOR */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-md p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900">PORTAL A: ATTACK SIMULATOR</h2>
                  <span className="text-[10px] text-slate-400">Adversarial Threat Injection Vector</span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                currentSimulation?.status === 'RUNNING'
                  ? 'bg-red-100 text-red-700 animate-pulse'
                  : currentSimulation?.status === 'PAUSED'
                  ? 'bg-amber-100 text-amber-700'
                  : currentSimulation?.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                STATUS: {currentSimulation?.status || 'IDLE'}
              </span>
            </div>

            {/* Scenario Selector */}
            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                Select Adversarial Attack Scenario
              </label>
              <select
                value={selectedScenarioKey}
                onChange={(e) => setSelectedScenarioKey(e.target.value)}
                disabled={currentSimulation?.status === 'RUNNING'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
              >
                {scenarios.map((scen) => (
                  <option key={scen.id} value={scen.id}>
                    {scen.name} [{scen.severity}]
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Details Box */}
            {selectedScenario && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{selectedScenario.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${getSeverityBadge(selectedScenario.severity)}`}>
                    SEVERITY: {selectedScenario.severity}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {selectedScenario.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px] text-slate-500 border-t border-slate-200/80">
                  <div>Target System: <span className="text-slate-800 font-semibold">{selectedScenario.defaultTargetSystem}</span></div>
                  <div>Target Account: <span className="text-slate-800 font-semibold">{selectedScenario.defaultTargetAccount}</span></div>
                </div>
              </div>
            )}

            {/* Simulation Metadata Cards */}
            {currentSimulation && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">SIMULATION ID:</span>
                  <span className="text-blue-400 font-bold">{currentSimulation.simulationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ATTACKER VECTOR:</span>
                  <span className="text-red-400 font-bold">{currentSimulation.attackerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TIMESTAMP:</span>
                  <span>{new Date(currentSimulation.startedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {/* Live Terminal Event Feed */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-600" /> Live Event Feed
                </span>
                <span className="text-[10px] text-slate-400">{eventsFeed.length} telemetry frames</span>
              </div>
              <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-[11px] h-52 overflow-y-auto space-y-1.5 border border-slate-800 shadow-inner">
                {eventsFeed.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Press "Start Simulation" to initiate adversarial attack vectors.
                  </div>
                ) : (
                  eventsFeed.map((ev, i) => (
                    <div key={ev.id || i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-500 text-[10px] shrink-0">
                        [{new Date(ev.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                        ev.level === 'WARN'
                          ? 'bg-amber-900/60 text-amber-300'
                          : ev.level === 'ALERT'
                          ? 'bg-red-900/60 text-red-300'
                          : ev.level === 'ACTION'
                          ? 'bg-blue-900/60 text-blue-300'
                          : 'bg-emerald-900/60 text-emerald-300'
                      }`}>
                        {ev.level}
                      </span>
                      <span className="text-slate-300">{ev.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <button
              onClick={handleStart}
              disabled={currentSimulation?.status === 'RUNNING' || actionLoading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Simulation</span>
            </button>

            {currentSimulation?.status === 'RUNNING' ? (
              <button
                onClick={handlePause}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : currentSimulation?.status === 'PAUSED' ? (
              <button
                onClick={handleResume}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            ) : null}

            <button
              onClick={handleStop}
              disabled={!currentSimulation || currentSimulation?.status === 'STOPPED' || currentSimulation?.status === 'COMPLETED'}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>

            <button
              onClick={handleReset}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PORTAL B: IMPACT ANALYSIS */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border-2 border-blue-600 shadow-md p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900">PORTAL B: IMPACT ANALYSIS</h2>
                  <span className="text-[10px] text-slate-400">Autonomous SecOps Defense & Telemetry</span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                impactState?.mitigationStatus === 'DEFENDED' || impactState?.mitigationStatus === 'BLOCKED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : impactState?.mitigationStatus === 'ACTIVE_MITIGATION'
                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                MITIGATION: {impactState?.mitigationStatus || 'LISTENING'}
              </span>
            </div>

            {/* Real-time Incident Sync Card */}
            {impactState ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Threat Detection Sync: {impactState.simulation?.scenarioName || selectedScenario?.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${getSeverityBadge(impactState.riskLevel)}`}>
                    {impactState.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">POTENTIAL FINANCIAL IMPACT</span>
                    <span className="text-base font-extrabold text-red-600">
                      ₹{impactState.financialImpactEst?.toLocaleString('en-IN') || '0.00'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">DETECTION RESPONSE LATENCY</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      {impactState.detectionLatencyMs || 38} ms
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px]">AUTOMATED MITIGATION PLAYBOOK</span>
                  <p className="text-slate-800 font-medium">{impactState.automatedResponse}</p>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Target: {impactState.simulation?.targetAccount}</span>
                  <span>System: {impactState.affectedSystem}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Waiting for adversarial trigger in Portal A...</p>
                <p className="text-[10px] text-slate-400">Events from Portal A will populate defensive telemetry automatically via Socket.IO.</p>
              </div>
            )}

            {/* Recharts Analytics Charts for Portal B */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>Threat Detections by Category</span>
                <span className="text-[10px] text-slate-500">Historical SecOps Metrics</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      formatter={(val, name, item) => [val, item.payload.fullName]}
                      contentStyle={{ backgroundColor: '#0A192F', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Portal B Summary Footer */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block">TOTAL ATTACKS</span>
              <span className="font-extrabold text-slate-900">{analytics?.totalSimulatedAttacks || 72}</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <span className="text-[10px] text-emerald-700 block">BLOCKED</span>
              <span className="font-extrabold text-emerald-700">{analytics?.blockedAttacks || 70}</span>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl">
              <span className="text-[10px] text-blue-700 block">AVG SPEED</span>
              <span className="font-extrabold text-blue-700">{analytics?.avgResponseTimeMs || 38}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
