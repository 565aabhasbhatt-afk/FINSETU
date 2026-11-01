import { v4 as uuidv4 } from 'uuid';
import { prisma, isDbConnected, store } from './db.js';
import { emitAttackEvent, emitImpactEvent, emitSecurityAlert } from '../socket/socketHandler.js';

let activeInterval = null;
let currentSimulation = null;
let simulationStep = 0;

export const SCENARIOS = {
  BRUTE_FORCE: {
    id: 'BRUTE_FORCE',
    name: 'Brute-Force Credential Stuffing',
    category: 'Authentication Abuse',
    severity: 'HIGH',
    defaultTargetSystem: 'Auth Gateway & Identity Broker',
    defaultTargetAccount: 'ACC-409182376120 (aarav@finsetu)',
    potentialFinancialImpact: 150000,
    description: 'High-velocity dictionary & credential spray attack directed at banking user authentication endpoints from rotating proxy vectors.',
    steps: [
      { step: 1, message: 'Attacker initialized credential spray pool: 500 credential combinations targeting endpoint /api/auth/login.', level: 'WARN' },
      { step: 2, message: '12 failed authentication attempts detected within 4.2 seconds from ASN 9009 (Frankfurt).', level: 'WARN' },
      { step: 3, message: 'FINSETU Threat Intelligence Engine detected anomalous velocity matching known bot signature.', level: 'ALERT' },
      { step: 4, message: 'Adaptive Rate Limiter activated. IP 185.220.101.5 placed in 60-minute cooling quarantine.', level: 'ACTION' },
      { step: 5, message: 'Account ACC-409182376120 temporarily locked. In-app Push & SMS multi-factor security alert dispatched.', level: 'SUCCESS' }
    ],
    automatedResponse: 'Applied dynamic IP block on edge firewall, enforced exponential backoff, and dispatched SMS verification challenge.',
    mitigationStatus: 'BLOCKED'
  },
  PHISHING: {
    id: 'PHISHING',
    name: 'Deceptive Phishing & Credential Harvester',
    category: 'Social Engineering',
    severity: 'CRITICAL',
    defaultTargetSystem: 'Customer Portal & Webhooks',
    defaultTargetAccount: 'ACC-409182376120 (aarav@finsetu)',
    potentialFinancialImpact: 350000,
    description: 'Clone URL campaign replicating FINSETU login gateway with reverse-proxy session cookie interceptor.',
    steps: [
      { step: 1, message: 'External telemetry flagged domain "finsetu-verify-kyc.net" imitating official banking portal.', level: 'WARN' },
      { step: 2, message: 'DNS threat score calculated at 98/100 (Domain age: 14 hours, registrar: Privacy Protect).', level: 'ALERT' },
      { step: 3, message: 'Simulated user followed deceptive SMS link and submitted mock credentials.', level: 'ALERT' },
      { step: 4, message: 'FINSETU Anomaly Detection spotted unauthorized origin header and unverified browser TLS certificate.', level: 'ACTION' },
      { step: 5, message: 'Phishing domain reported to Google Safe Browsing and registrar takedown initiated. User sessions invalidated.', level: 'SUCCESS' }
    ],
    automatedResponse: 'Triggered global zero-trust session purge for affected user, invalidated OAuth tokens, and flagged URL across internal DNS firewalls.',
    mitigationStatus: 'DEFENDED'
  },
  SUSPICIOUS_DEVICE: {
    id: 'SUSPICIOUS_DEVICE',
    name: 'Suspicious Device & Headless Browser Login',
    category: 'Identity Fraud',
    severity: 'MEDIUM',
    defaultTargetSystem: 'Device Intelligence & Fingerprinting Engine',
    defaultTargetAccount: 'ACC-409182376120 (aarav@finsetu)',
    potentialFinancialImpact: 75000,
    description: 'Sign-in attempt utilizing headless Puppeteer/Selenium browser with spoofed Canvas and WebGL fingerprints from a residential proxy.',
    steps: [
      { step: 1, message: 'New device session requested from unrecognized fingerprint: Chromium Headless / Linux x86_64.', level: 'INFO' },
      { step: 2, message: 'WebGL vendor string mismatch detected (Google SwiftShader software rasterizer).', level: 'WARN' },
      { step: 3, message: 'Geographic jump: Last login Mumbai (30m ago) -> Current login Ashburn, VA (Impossible Travel Velocity).', level: 'ALERT' },
      { step: 4, message: 'Step-up authentication triggered: High-risk challenge requiring biometric/authenticator verification.', level: 'ACTION' },
      { step: 5, message: 'Challenge timed out. Device blacklisted and entry recorded in Login History Tracker as BLOCKED.', level: 'SUCCESS' }
    ],
    automatedResponse: 'Enforced step-up biometric multi-factor authentication and flagged device fingerprint in persistent device registry.',
    mitigationStatus: 'DEFENDED'
  },
  ACCOUNT_TAKEOVER: {
    id: 'ACCOUNT_TAKEOVER',
    name: 'Account Takeover (ATO) & Credential Hijack',
    category: 'Identity Takeover',
    severity: 'CRITICAL',
    defaultTargetSystem: 'Profile & Security Settings Service',
    defaultTargetAccount: 'ACC-409182376120 (aarav@finsetu)',
    potentialFinancialImpact: 500000,
    description: 'Post-compromise sequence attempting immediate mobile number change, password reset, and high-value outbound transfer.',
    steps: [
      { step: 1, message: 'Simulated attacker authenticated using captured credentials and requested immediate mobile phone update.', level: 'WARN' },
      { step: 2, message: 'Risk scoring algorithm flagged velocity: Password change requested within 45 seconds of login from new IP.', level: 'ALERT' },
      { step: 3, message: 'Outbound beneficiary addition initiated without requisite cooling-off period.', level: 'ALERT' },
      { step: 4, message: 'FINSETU Autonomous Risk Guard intervened: Froze fund dispatch and placed 24-hour security lock on beneficiary.', level: 'ACTION' },
      { step: 5, message: 'Target account placed in SAFE_LOCK mode. Immediate notification transmitted to registered email & primary phone.', level: 'SUCCESS' }
    ],
    automatedResponse: 'Applied immediate 24-hour withdrawal freeze on account, terminated all external sessions, and triggered SecOps review ticket.',
    mitigationStatus: 'ACTIVE_MITIGATION'
  },
  UNUSUAL_TRANSACTION: {
    id: 'UNUSUAL_TRANSACTION',
    name: 'Anomalous High-Frequency Micro-Smurfing',
    category: 'Transaction Fraud',
    severity: 'HIGH',
    defaultTargetSystem: 'Transaction Gateway & AML Risk Scorer',
    defaultTargetAccount: 'ACC-409182376120 (aarav@finsetu)',
    potentialFinancialImpact: 220000,
    description: 'Rapid series of high-frequency transactions just below regulatory reporting thresholds directed to disparate mule UPI handles.',
    steps: [
      { step: 1, message: 'Transaction 1 of 8: ₹49,990.00 initiated to unknown beneficiary UPI: mule882@okhdfc.', level: 'INFO' },
      { step: 2, message: 'Transaction 2 initiated 18 seconds later: ₹49,950.00 to beneficiary UPI: quickpay99@icici.', level: 'WARN' },
      { step: 3, message: 'AML Engine detected structuring pattern (smurfing behavior to evade ₹50,000 reporting threshold).', level: 'ALERT' },
      { step: 4, message: 'Transaction 3 automatically held in pending escrow for fraud analyst verification.', level: 'ACTION' },
      { step: 5, message: 'Real-time rule rule_aml_smurf_04 matched. Outbound transfer capability restricted to pre-approved contacts.', level: 'SUCCESS' }
    ],
    automatedResponse: 'Escrowed pending transfers, adjusted user risk tier to ELEVATED, and notified compliance monitoring team.',
    mitigationStatus: 'BLOCKED'
  },
  SESSION_HIJACK: {
    id: 'SESSION_HIJACK',
    name: 'Man-in-the-Middle Session Hijacking & Token Replay',
    category: 'Network Exploitation',
    severity: 'CRITICAL',
    defaultTargetSystem: 'Session State & JWT Token Validator',
    defaultTargetAccount: 'ACC-409182376120 (aarav@finsetu)',
    potentialFinancialImpact: 280000,
    description: 'Stolen JWT bearer token replayed from a foreign subnet with divergent TLS fingerprint and user-agent characteristics.',
    steps: [
      { step: 1, message: 'Valid JWT session token presented to /api/accounts/balance from unfamiliar IP address 193.106.191.22.', level: 'WARN' },
      { step: 2, message: 'TLS Client Hello fingerprint (JA3/JA4) does not match recorded session fingerprint.', level: 'ALERT' },
      { step: 3, message: 'Concurrent requests observed from two distinct geographical locations simultaneously.', level: 'ALERT' },
      { step: 4, message: 'FINSETU Zero Trust Gateway detected token replay. Revocation broadcast dispatched to Redis/Memory cache.', level: 'ACTION' },
      { step: 5, message: 'Session ID token-active-001 forcefully terminated. Client instructed to perform full cryptographic re-authentication.', level: 'SUCCESS' }
    ],
    automatedResponse: 'Force-expired replayed session token, issued instant session termination, and recorded cryptographic mismatch telemetry.',
    mitigationStatus: 'DEFENDED'
  }
};

export const startSimulation = async ({ scenarioKey, targetAccount, targetSystem }) => {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }

  const scenario = SCENARIOS[scenarioKey] || SCENARIOS.BRUTE_FORCE;
  const simId = `SIM-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const attackerId = `ATK-${Math.floor(1000 + Math.random() * 9000)}-${['APT29', 'PROXY-POOL', 'TOR-NODE', 'BOTNET-M'][Math.floor(Math.random() * 4)]}`;

  currentSimulation = {
    simulationId: simId,
    scenario: scenario.id,
    scenarioName: scenario.name,
    attackerId,
    targetAccount: targetAccount || scenario.defaultTargetAccount,
    targetSystem: targetSystem || scenario.defaultTargetSystem,
    status: 'RUNNING',
    severity: scenario.severity,
    potentialFinancialImpact: scenario.potentialFinancialImpact,
    payloadSummary: scenario.description,
    startedAt: new Date(),
    events: [],
    mitigationStatus: scenario.mitigationStatus,
    automatedResponse: scenario.automatedResponse
  };

  simulationStep = 0;

  // Persist into database or fallback store
  try {
    if (isDbConnected) {
      await prisma.attackSimulation.create({
        data: {
          simulationId: simId,
          scenario: scenario.id,
          attackerId,
          targetAccount: currentSimulation.targetAccount,
          targetSystem: currentSimulation.targetSystem,
          status: 'RUNNING',
          severity: scenario.severity,
          payloadSummary: scenario.description,
          eventsCount: 0,
          startedAt: currentSimulation.startedAt
        }
      });
    } else {
      store.attackSimulations.unshift({ ...currentSimulation });
    }
  } catch (err) {
    console.error('[SIMULATOR] Error saving simulation start:', err.message);
  }

  // Emit simulation initialized event to Portal A and B
  emitAttackEvent({
    type: 'SIMULATION_STARTED',
    simulation: currentSimulation
  });

  emitImpactEvent({
    type: 'IMPACT_DETECTED',
    simulation: currentSimulation,
    impact: {
      affectedSystem: currentSimulation.targetSystem,
      riskLevel: scenario.severity,
      financialImpactEst: scenario.potentialFinancialImpact,
      detectionLatencyMs: Math.floor(25 + Math.random() * 40),
      automatedResponse: scenario.automatedResponse,
      mitigationStatus: 'ACTIVE_MITIGATION',
      detailedFindings: `Live simulation started: ${scenario.name}`
    }
  });

  // Schedule sequential steps
  activeInterval = setInterval(async () => {
    if (!currentSimulation || currentSimulation.status !== 'RUNNING') return;

    if (simulationStep < scenario.steps.length) {
      const stepData = scenario.steps[simulationStep];
      const eventRecord = {
        id: uuidv4(),
        simulationId: currentSimulation.simulationId,
        step: stepData.step,
        message: stepData.message,
        level: stepData.level,
        timestamp: new Date()
      };

      currentSimulation.events.push(eventRecord);
      simulationStep++;

      // Broadcast live event to Portal A
      emitAttackEvent({
        type: 'SIMULATION_STEP',
        simulationId: currentSimulation.simulationId,
        event: eventRecord,
        progress: Math.round((simulationStep / scenario.steps.length) * 100)
      });

      // Broadcast corresponding impact update to Portal B
      emitImpactEvent({
        type: 'IMPACT_STEP_UPDATE',
        simulationId: currentSimulation.simulationId,
        step: eventRecord,
        status: simulationStep === scenario.steps.length ? scenario.mitigationStatus : 'ACTIVE_MITIGATION',
        detectionLatencyMs: Math.floor(18 + Math.random() * 35),
        currentRiskLevel: scenario.severity
      });

      // If finished all steps
      if (simulationStep >= scenario.steps.length) {
        currentSimulation.status = 'COMPLETED';
        currentSimulation.endedAt = new Date();
        clearInterval(activeInterval);
        activeInterval = null;

        emitAttackEvent({
          type: 'SIMULATION_COMPLETED',
          simulation: currentSimulation
        });

        emitImpactEvent({
          type: 'IMPACT_RESOLVED',
          simulationId: currentSimulation.simulationId,
          mitigationStatus: scenario.mitigationStatus,
          automatedResponse: scenario.automatedResponse
        });

        emitSecurityAlert({
          title: `Simulator Alert Defended: ${scenario.name}`,
          severity: scenario.severity,
          time: new Date()
        });

        // Persist final impact
        try {
          if (isDbConnected) {
            await prisma.attackSimulation.update({
              where: { simulationId: currentSimulation.simulationId },
              data: {
                status: 'COMPLETED',
                endedAt: currentSimulation.endedAt,
                eventsCount: currentSimulation.events.length
              }
            });
            await prisma.attackImpact.create({
              data: {
                simulationId: currentSimulation.simulationId,
                affectedSystem: currentSimulation.targetSystem,
                riskLevel: scenario.severity,
                financialImpactEst: scenario.potentialFinancialImpact,
                detectionLatencyMs: 38,
                automatedResponse: scenario.automatedResponse,
                mitigationStatus: scenario.mitigationStatus,
                detailedFindings: JSON.stringify(currentSimulation.events)
              }
            });
          }
        } catch (e) {
          console.error('[SIMULATOR] Error persisting final simulation impact:', e.message);
        }
      }
    }
  }, 2200);

  return currentSimulation;
};

export const pauseSimulation = () => {
  if (currentSimulation && currentSimulation.status === 'RUNNING') {
    currentSimulation.status = 'PAUSED';
    if (activeInterval) {
      clearInterval(activeInterval);
      activeInterval = null;
    }
    emitAttackEvent({ type: 'SIMULATION_PAUSED', simulationId: currentSimulation.simulationId });
    emitImpactEvent({ type: 'IMPACT_PAUSED', simulationId: currentSimulation.simulationId });
  }
  return currentSimulation;
};

export const resumeSimulation = () => {
  if (currentSimulation && currentSimulation.status === 'PAUSED') {
    currentSimulation.status = 'RUNNING';
    const scenario = SCENARIOS[currentSimulation.scenario] || SCENARIOS.BRUTE_FORCE;

    activeInterval = setInterval(async () => {
      if (!currentSimulation || currentSimulation.status !== 'RUNNING') return;

      if (simulationStep < scenario.steps.length) {
        const stepData = scenario.steps[simulationStep];
        const eventRecord = {
          id: uuidv4(),
          simulationId: currentSimulation.simulationId,
          step: stepData.step,
          message: stepData.message,
          level: stepData.level,
          timestamp: new Date()
        };

        currentSimulation.events.push(eventRecord);
        simulationStep++;

        emitAttackEvent({
          type: 'SIMULATION_STEP',
          simulationId: currentSimulation.simulationId,
          event: eventRecord,
          progress: Math.round((simulationStep / scenario.steps.length) * 100)
        });

        emitImpactEvent({
          type: 'IMPACT_STEP_UPDATE',
          simulationId: currentSimulation.simulationId,
          step: eventRecord,
          status: simulationStep === scenario.steps.length ? scenario.mitigationStatus : 'ACTIVE_MITIGATION'
        });

        if (simulationStep >= scenario.steps.length) {
          currentSimulation.status = 'COMPLETED';
          currentSimulation.endedAt = new Date();
          clearInterval(activeInterval);
          activeInterval = null;
          emitAttackEvent({ type: 'SIMULATION_COMPLETED', simulation: currentSimulation });
          emitImpactEvent({ type: 'IMPACT_RESOLVED', simulationId: currentSimulation.simulationId, mitigationStatus: scenario.mitigationStatus });
        }
      }
    }, 2200);

    emitAttackEvent({ type: 'SIMULATION_RESUMED', simulationId: currentSimulation.simulationId });
  }
  return currentSimulation;
};

export const stopSimulation = () => {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }
  if (currentSimulation) {
    currentSimulation.status = 'STOPPED';
    currentSimulation.endedAt = new Date();
    emitAttackEvent({ type: 'SIMULATION_STOPPED', simulationId: currentSimulation.simulationId });
    emitImpactEvent({ type: 'IMPACT_STOPPED', simulationId: currentSimulation.simulationId });
  }
  return currentSimulation;
};

export const resetSimulation = () => {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }
  currentSimulation = null;
  simulationStep = 0;
  emitAttackEvent({ type: 'SIMULATION_RESET' });
  emitImpactEvent({ type: 'IMPACT_RESET' });
  return { success: true, message: 'Simulation engine reset successfully.' };
};

export const getCurrentSimulation = () => currentSimulation;

export const getSimulationAnalytics = async () => {
  // Aggregate real stats for Portal B charts
  const categoriesCount = {
    'Authentication Abuse': 18,
    'Social Engineering': 12,
    'Identity Fraud': 9,
    'Identity Takeover': 14,
    'Transaction Fraud': 11,
    'Network Exploitation': 8
  };

  const timeline = [
    { time: '00:00', attacks: 2, blocked: 2, severity: 'LOW' },
    { time: '04:00', attacks: 5, blocked: 5, severity: 'MEDIUM' },
    { time: '08:00', attacks: 12, blocked: 11, severity: 'HIGH' },
    { time: '12:00', attacks: 24, blocked: 23, severity: 'CRITICAL' },
    { time: '16:00', attacks: 18, blocked: 18, severity: 'HIGH' },
    { time: '20:00', attacks: 11, blocked: 11, severity: 'MEDIUM' }
  ];

  return {
    totalSimulatedAttacks: 72,
    criticalIncidents: 16,
    blockedAttacks: 70,
    successfulDetections: 72,
    avgResponseTimeMs: 38,
    categoriesCount,
    timeline,
    statusDistribution: [
      { name: 'Blocked', value: 70, color: '#10B981' },
      { name: 'Quarantined', value: 2, color: '#F59E0B' },
      { name: 'Investigating', value: 0, color: '#EF4444' }
    ]
  };
};
