import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[FINSETU Seed] 🌱 Starting database seeding for PostgreSQL...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Create Users & Accounts
  const user1 = await prisma.user.upsert({
    where: { email: 'user@finsetu.com' },
    update: {},
    create: {
      fullName: 'Aarav Sharma',
      email: 'user@finsetu.com',
      phone: '+91 98765 43210',
      passwordHash,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isTwoFactorEnabled: true,
      account: {
        create: {
          accountNumber: '409182376120',
          accountType: 'SAVINGS',
          balance: 148500.75,
          currency: 'INR',
          status: 'ACTIVE',
          upiId: 'aarav@finsetu'
        }
      }
    },
    include: { account: true }
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@finsetu.com' },
    update: {},
    create: {
      fullName: 'Chief SecOps Admin',
      email: 'admin@finsetu.com',
      phone: '+91 98200 11223',
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isTwoFactorEnabled: true,
      account: {
        create: {
          accountNumber: '881920394812',
          accountType: 'CURRENT',
          balance: 850000.00,
          currency: 'INR',
          status: 'ACTIVE',
          upiId: 'admin@finsetu'
        }
      }
    },
    include: { account: true }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'priya@finsetu.com' },
    update: {},
    create: {
      fullName: 'Priya Verma',
      email: 'priya@finsetu.com',
      phone: '+91 99887 76655',
      passwordHash,
      role: 'USER',
      isTwoFactorEnabled: false,
      account: {
        create: {
          accountNumber: '519283746192',
          accountType: 'SAVINGS',
          balance: 42100.00,
          currency: 'INR',
          status: 'ACTIVE',
          upiId: 'priya@finsetu'
        }
      }
    },
    include: { account: true }
  });

  console.log(`[FINSETU Seed] ✅ Created seed users: ${user1.email}, ${adminUser.email}, ${user2.email}`);

  // 2. Create Loan Offers
  const loanOffersData = [
    {
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
      isDemo: true
    },
    {
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
      isDemo: true
    },
    {
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
      isDemo: true
    },
    {
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
      isDemo: true
    }
  ];

  for (const offer of loanOffersData) {
    const existing = await prisma.loanOffer.findFirst({ where: { title: offer.title } });
    if (!existing) {
      await prisma.loanOffer.create({ data: offer });
    }
  }

  // 3. Create Seed Transactions
  const existingTx = await prisma.transaction.findFirst({ where: { referenceId: 'TXN-981247012' } });
  if (!existingTx) {
    await prisma.transaction.create({
      data: {
        referenceId: 'TXN-981247012',
        sourceAccountId: user1.account.id,
        targetAccountId: user2.account.id,
        sourceUserId: user1.id,
        targetUserId: user2.id,
        amount: 4500.00,
        currency: 'INR',
        type: 'TRANSFER',
        paymentMethod: 'UPI',
        status: 'COMPLETED',
        description: 'Vendor consulting fee',
        isSimulated: false,
        riskScore: 8,
        riskLevel: 'LOW'
      }
    });

    await prisma.transaction.create({
      data: {
        referenceId: 'TXN-981247013',
        sourceAccountId: null,
        targetAccountId: user1.account.id,
        sourceUserId: null,
        targetUserId: user1.id,
        amount: 65000.00,
        currency: 'INR',
        type: 'DEPOSIT',
        paymentMethod: 'NET_BANKING',
        status: 'COMPLETED',
        description: 'Monthly Salary Credit - Tech Corp',
        isSimulated: false,
        riskScore: 3,
        riskLevel: 'LOW'
      }
    });
  }

  // 4. Create Login History
  await prisma.loginHistory.create({
    data: {
      userId: user1.id,
      emailAttempted: user1.email,
      status: 'SUCCESS',
      ipAddress: '172.20.10.2 (Primary Device)',
      approximateLocation: 'Punjab, India (Reliance Jio Broadband • LAPTOP-AN71BR3U)',
      browser: 'Chrome 130.0',
      os: 'Windows 11',
      deviceType: 'DESKTOP',
      isSuspicious: false
    }
  });

  // 5. Create Security Incident
  await prisma.securityIncident.create({
    data: {
      userId: user1.id,
      incidentType: 'BRUTE_FORCE',
      severity: 'HIGH',
      status: 'MITIGATED',
      description: 'Multiple consecutive failed authentication attempts from anomalous Tor exit node.',
      ipAddress: '185.220.101.5',
      targetResource: '/api/auth/login'
    }
  });

  console.log('[FINSETU Seed] ✅ Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('[FINSETU Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
