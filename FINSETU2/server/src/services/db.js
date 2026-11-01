import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

export let isDbConnected = false;
export let dbStatus = {
  connected: false,
  provider: 'PostgreSQL (Supabase)',
  message: 'Database connection has not yet been initialized.',
  lastChecked: null,
  error: null
};

// Initial in-memory demonstration store for fallback when PostgreSQL is not yet configured
const initialDemoPasswordHash = bcrypt.hashSync('Password@123', 10);
const initialDemoPinHash = bcrypt.hashSync('1234', 10);


const store = {
  users: [
    {
      id: 'u-user-001',
      fullName: 'Aarav Sharma',
      email: 'user@finsetu.com',
      phone: '+91 98765 43210',
      passwordHash: initialDemoPasswordHash,
      transactionPinHash: initialDemoPinHash,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isTwoFactorEnabled: true,
      isLocked: false,
      lockReason: null,
      failedAttempts: 0,
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    },
    {
      id: 'u-admin-001',
      fullName: 'Chief SecOps Admin',
      email: 'admin@finsetu.com',
      phone: '+91 98200 11223',
      passwordHash: initialDemoPasswordHash,
      transactionPinHash: initialDemoPinHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isTwoFactorEnabled: true,
      isLocked: false,
      lockReason: null,
      failedAttempts: 0,
      createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    },
    {
      id: 'u-receiver-002',
      fullName: 'Priya Verma',
      email: 'priya@finsetu.com',
      phone: '+91 99887 76655',
      passwordHash: initialDemoPasswordHash,
      transactionPinHash: initialDemoPinHash,
      role: 'USER',
      avatarUrl: null,
      isTwoFactorEnabled: false,
      isLocked: false,
      lockReason: null,
      failedAttempts: 0,
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    }
  ],
  accounts: [
    {
      id: 'acc-001',
      userId: 'u-user-001',
      accountNumber: '409182376120',
      accountType: 'SAVINGS',
      balance: 148500.75,
      currency: 'INR',
      status: 'ACTIVE',
      upiId: 'aarav@finsetu',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'acc-002',
      userId: 'u-admin-001',
      accountNumber: '881920394812',
      accountType: 'CURRENT',
      balance: 850000.00,
      currency: 'INR',
      status: 'ACTIVE',
      upiId: 'admin@finsetu',
      createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'acc-003',
      userId: 'u-receiver-002',
      accountNumber: '519283746192',
      accountType: 'SAVINGS',
      balance: 42100.00,
      currency: 'INR',
      status: 'ACTIVE',
      upiId: 'priya@finsetu',
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      updatedAt: new Date()
    }
  ],
  transactions: [
    {
      id: 'tx-001',
      referenceId: 'TXN-981247012',
      sourceAccountId: 'acc-001',
      targetAccountId: 'acc-003',
      sourceUserId: 'u-user-001',
      targetUserId: 'u-receiver-002',
      amount: 4500.00,
      currency: 'INR',
      type: 'TRANSFER',
      paymentMethod: 'UPI',
      status: 'COMPLETED',
      description: 'Vendor consulting fee',
      isSimulated: false,
      riskScore: 8,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'tx-002',
      referenceId: 'TXN-981247013',
      sourceAccountId: null,
      targetAccountId: 'acc-001',
      sourceUserId: null,
      targetUserId: 'u-user-001',
      amount: 65000.00,
      currency: 'INR',
      type: 'DEPOSIT',
      paymentMethod: 'NET_BANKING',
      status: 'COMPLETED',
      description: 'Monthly Salary Credit - Tech Corp',
      isSimulated: false,
      riskScore: 3,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'tx-003',
      referenceId: 'TXN-981247014',
      sourceAccountId: 'acc-001',
      targetAccountId: null,
      sourceUserId: 'u-user-001',
      targetUserId: null,
      amount: 1850.00,
      currency: 'INR',
      type: 'BILL_PAYMENT',
      paymentMethod: 'DEBIT_CARD',
      status: 'COMPLETED',
      description: 'Broadband Fiber Utility',
      isSimulated: false,
      riskScore: 12,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'tx-004',
      referenceId: 'TXN-981247015',
      sourceAccountId: 'acc-001',
      targetAccountId: null,
      sourceUserId: 'u-user-001',
      targetUserId: null,
      amount: 3200.00,
      currency: 'INR',
      type: 'BILL_PAYMENT',
      paymentMethod: 'UPI',
      status: 'COMPLETED',
      description: 'Electricity Board Bill',
      isSimulated: false,
      riskScore: 6,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 72 * 3600 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'tx-005',
      referenceId: 'TXN-981247016',
      sourceAccountId: 'acc-001',
      targetAccountId: 'acc-003',
      sourceUserId: 'u-user-001',
      targetUserId: 'u-receiver-002',
      amount: 12000.00,
      currency: 'INR',
      type: 'TRANSFER',
      paymentMethod: 'NET_BANKING',
      status: 'COMPLETED',
      description: 'Quarterly office supplies',
      isSimulated: false,
      riskScore: 14,
      riskLevel: 'LOW',
      createdAt: new Date(Date.now() - 96 * 3600 * 1000),
      updatedAt: new Date()
    }
  ],
  loginHistories: [
    {
      id: 'lh-001',
      userId: 'u-user-001',
      emailAttempted: 'user@finsetu.com',
      status: 'SUCCESS',
      failureReason: null,
      ipAddress: '172.20.10.2 (Primary Device)',
      approximateLocation: 'Punjab, India (Reliance Jio Broadband • LAPTOP-AN71BR3U)',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
      browser: 'Chrome 130.0',
      os: 'Windows 11',
      deviceType: 'DESKTOP',
      isSuspicious: false,
      riskFlags: null,
      sessionTokenId: 'sess-active-001',
      createdAt: new Date(Date.now() - 4 * 60 * 1000)
    },
    {
      id: 'lh-002',
      userId: 'u-user-001',
      emailAttempted: 'user@finsetu.com',
      status: 'SUCCESS',
      failureReason: null,
      ipAddress: '49.36.120.44',
      approximateLocation: 'Chandigarh / Mohali, PB, India (Jio 5G)',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
      browser: 'Mobile Safari 17.4',
      os: 'iOS 17.4',
      deviceType: 'MOBILE',
      isSuspicious: false,
      riskFlags: null,
      sessionTokenId: 'sess-mobile-002',
      createdAt: new Date(Date.now() - 14 * 3600 * 1000)
    },
    {
      id: 'lh-003',
      userId: 'u-user-001',
      emailAttempted: 'user@finsetu.com',
      status: 'FAILED',
      failureReason: 'Invalid password credentials',
      ipAddress: '185.220.101.5',
      approximateLocation: 'Frankfurt, Hesse, Germany (Tor Exit Relay - Blocked)',
      userAgent: 'Python-requests/2.31.0',
      browser: 'Automated Bot',
      os: 'Linux',
      deviceType: 'OTHER',
      isSuspicious: true,
      riskFlags: 'TOR_EXIT_NODE, ANOMALOUS_GEO, UNCOMMON_USER_AGENT',
      sessionTokenId: null,
      createdAt: new Date(Date.now() - 28 * 3600 * 1000)
    }
  ],
  userSessions: [
    {
      id: 'sess-active-001',
      userId: 'u-user-001',
      sessionToken: 'token-active-001',
      deviceId: 'dev-001',
      ipAddress: '172.20.10.2 (Primary Device)',
      approximateLocation: 'Punjab, India (Reliance Jio Broadband • LAPTOP-AN71BR3U)',
      browser: 'Chrome 130.0',
      os: 'Windows 11',
      deviceType: 'DESKTOP',
      isActive: true,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      revokedAt: null,
      revokeReason: null,
      createdAt: new Date(Date.now() - 4 * 60 * 1000)
    },
    {
      id: 'sess-mobile-002',
      userId: 'u-user-001',
      sessionToken: 'token-mobile-002',
      deviceId: 'dev-002',
      ipAddress: '49.36.120.44',
      approximateLocation: 'Chandigarh / Mohali, PB, India (Jio 5G)',
      browser: 'Mobile Safari 17.4',
      os: 'iOS 17.4',
      deviceType: 'MOBILE',
      isActive: true,
      lastActiveAt: new Date(Date.now() - 45 * 60 * 1000),
      expiresAt: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      revokedAt: null,
      revokeReason: null,
      createdAt: new Date(Date.now() - 14 * 3600 * 1000)
    }
  ],
  devices: [
    {
      id: 'dev-001',
      userId: 'u-user-001',
      deviceFingerprint: 'chrome-win11-desktop',
      deviceName: 'HP Laptop (Chrome / Windows 11 • LAPTOP-AN71BR3U)',
      deviceType: 'DESKTOP',
      os: 'Windows 11',
      browser: 'Chrome 130.0',
      isTrusted: true,
      firstSeenAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
      lastSeenAt: new Date(),
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000)
    },
    {
      id: 'dev-002',
      userId: 'u-user-001',
      deviceFingerprint: 'safari-ios-mobile',
      deviceName: 'iPhone 15 Pro (Safari / iOS)',
      deviceType: 'MOBILE',
      os: 'iOS 17.4',
      browser: 'Mobile Safari',
      isTrusted: true,
      firstSeenAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      lastSeenAt: new Date(Date.now() - 2 * 3600 * 1000),
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000)
    }
  ],
  loanOffers: [
    {
      id: 'loan-001',
      title: 'FINSETU Prime Personal Loan',
      type: 'PERSONAL',
      minAmount: 50000.00,
      maxAmount: 1500000.00,
      interestRate: 10.49,
      tenureMonthsMin: 12,
      tenureMonthsMax: 60,
      processingFeePct: 1.00,
      features: JSON.stringify(['Zero prepayment charges after 6 months', 'Instant paperless approval in 2 minutes', 'Flexible EMI tenure options']),
      isActive: true,
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'loan-002',
      title: 'Global Scholar Education Loan',
      type: 'EDUCATION',
      minAmount: 100000.00,
      maxAmount: 5000000.00,
      interestRate: 8.75,
      tenureMonthsMin: 24,
      tenureMonthsMax: 120,
      processingFeePct: 0.50,
      features: JSON.stringify(['Moratorium period during studies + 1 year', '100% tuition and living allowance funding', 'Income tax benefit under Sec 80E']),
      isActive: true,
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'loan-003',
      title: 'Sanctuary Home Loan',
      type: 'HOME',
      minAmount: 500000.00,
      maxAmount: 20000000.00,
      interestRate: 8.40,
      tenureMonthsMin: 60,
      tenureMonthsMax: 360,
      processingFeePct: 0.25,
      features: JSON.stringify(['Concession on stamp duty & women borrowers', 'Quick doorstep property valuation', 'Balance transfer with top-up options']),
      isActive: true,
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'loan-004',
      title: 'Enterprise Growth Business Loan',
      type: 'BUSINESS',
      minAmount: 200000.00,
      maxAmount: 10000000.00,
      interestRate: 11.25,
      tenureMonthsMin: 12,
      tenureMonthsMax: 84,
      processingFeePct: 1.25,
      features: JSON.stringify(['No collateral required up to ₹50 Lakhs', 'Overdraft and working capital line of credit', 'Custom repayment aligned with cash flow']),
      isActive: true,
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  loanApplications: [
    {
      id: 'app-001',
      userId: 'u-user-001',
      loanOfferId: 'loan-001',
      amount: 250000.00,
      tenureMonths: 24,
      monthlyEmi: 11598.00,
      purpose: 'Home office technology setup',
      employmentType: 'Salaried Professional',
      monthlyIncome: 95000.00,
      status: 'APPROVED',
      appliedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      reviewedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      reviewerNotes: 'Credit score 790, pre-approved verified.',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      updatedAt: new Date()
    }
  ],
  securityIncidents: [
    {
      id: 'inc-001',
      userId: 'u-user-001',
      incidentType: 'BRUTE_FORCE',
      severity: 'HIGH',
      status: 'MITIGATED',
      description: 'Multiple consecutive failed authentication attempts from anomalous Tor exit node.',
      ipAddress: '185.220.101.5',
      targetResource: '/api/auth/login',
      metadata: JSON.stringify({ attemptsCount: 14, rateLimitTriggered: true }),
      resolvedAt: new Date(Date.now() - 38 * 3600 * 1000),
      createdAt: new Date(Date.now() - 38 * 3600 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'inc-002',
      userId: 'u-user-001',
      incidentType: 'SUSPICIOUS_DEVICE',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      description: 'Sign-in attempt observed from unrecognized browser fingerprint in a novel subnet.',
      ipAddress: '49.36.120.44',
      targetResource: 'OAuth Mobile Session',
      metadata: JSON.stringify({ challengeType: 'SMS_OTP', verificationResult: 'SUCCESS' }),
      resolvedAt: new Date(Date.now() - 25 * 3600 * 1000),
      createdAt: new Date(Date.now() - 26 * 3600 * 1000),
      updatedAt: new Date()
    }
  ],
  attackSimulations: [],
  attackImpacts: [],
  notifications: [
    {
      id: 'notif-001',
      userId: 'u-user-001',
      title: 'Security Alert: New Sign-in Detected',
      message: 'New sign-in recorded from Chrome on Windows 11 at 172.20.10.2 (Punjab, India).',
      type: 'SECURITY',
      priority: 'HIGH',
      isRead: false,
      readAt: null,
      actionUrl: '/security/activity',
      createdAt: new Date(Date.now() - 4 * 60 * 1000)
    },
    {
      id: 'notif-002',
      userId: 'u-user-001',
      title: 'Funds Received: ₹65,000.00',
      message: 'Monthly salary from Tech Corp credited to account 409182376120.',
      type: 'TRANSACTION',
      priority: 'MEDIUM',
      isRead: true,
      readAt: new Date(),
      actionUrl: '/transactions',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000)
    }
  ],
  auditLogs: [
    {
      id: 'audit-001',
      adminId: 'u-admin-001',
      actorEmail: 'admin@finsetu.com',
      action: 'SYSTEM_INITIALIZATION',
      targetEntity: 'FINSETU_CORE',
      targetId: 'NODE-01',
      ipAddress: '172.20.10.2',
      details: JSON.stringify({ engine: 'FINSETU Banking & SecOps Hub', version: '2026.1.0' }),
      createdAt: new Date(Date.now() - 24 * 3600 * 1000)
    }
  ]
};

// Test active PostgreSQL connection on startup
export const testDbConnection = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('placeholder') || dbUrl.includes('[YOUR_DB_PASSWORD]')) {
    isDbConnected = false;
    dbStatus = {
      connected: false,
      provider: 'PostgreSQL (Supabase)',
      message: 'Supabase/PostgreSQL connection string contains placeholder values. Running in resilient mock-store mode. Update server/.env with real DATABASE_URL to connect to live PostgreSQL.',
      lastChecked: new Date(),
      error: 'UNCONFIGURED_DATABASE_URL'
    };
    console.log('[FINSETU DB] ⚠️  PostgreSQL URL is unconfigured or has placeholders.');
    console.log('[FINSETU DB] ℹ️  Using resilient demonstration store with pre-seeded test data.');
    console.log('[FINSETU DB] ℹ️  To connect Supabase: update DATABASE_URL and DIRECT_URL in server/.env and run: npm run prisma:push');
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    dbStatus = {
      connected: true,
      provider: 'PostgreSQL (Supabase)',
      message: 'Successfully connected and verified PostgreSQL database via Prisma ORM.',
      lastChecked: new Date(),
      error: null
    };
    console.log('[FINSETU DB] ✅ PostgreSQL database connection verified via Prisma.');
    return true;
  } catch (error) {
    isDbConnected = false;
    dbStatus = {
      connected: false,
      provider: 'PostgreSQL (Supabase)',
      message: `Failed to connect to PostgreSQL: ${error.message}. Running in resilient mock-store mode.`,
      lastChecked: new Date(),
      error: error.message
    };
    console.warn(`[FINSETU DB] ⚠️ PostgreSQL connection failed: ${error.message}`);
    console.log('[FINSETU DB] ℹ️  Running in resilient fallback mode so all UI workflows remain operational.');
    return false;
  }
};

export { store };
