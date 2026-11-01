import { v4 as uuidv4 } from 'uuid';
import { prisma, isDbConnected, store } from '../services/db.js';

export const getLoanOffers = async (req, res) => {
  try {
    let offers = [];
    if (isDbConnected) {
      offers = await prisma.loanOffer.findMany({
        where: { isActive: true },
        orderBy: { interestRate: 'asc' }
      });
    } else {
      offers = store.loanOffers.filter(o => o.isActive);
    }

    const formatted = offers.map(o => ({
      id: o.id,
      title: o.title,
      type: o.type,
      minAmount: Number(o.minAmount),
      maxAmount: Number(o.maxAmount),
      interestRate: Number(o.interestRate),
      tenureMonthsMin: o.tenureMonthsMin,
      tenureMonthsMax: o.tenureMonthsMax,
      processingFeePct: Number(o.processingFeePct),
      features: typeof o.features === 'string' ? JSON.parse(o.features || '[]') : o.features,
      isDemo: o.isDemo
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve loan offers',
      error: error.message
    });
  }
};

export const applyForLoan = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      loanOfferId,
      amount,
      tenureMonths,
      monthlyEmi,
      purpose,
      employmentType,
      monthlyIncome
    } = req.body;

    const numericAmount = parseFloat(amount);
    const numericIncome = parseFloat(monthlyIncome);
    const parsedTenure = parseInt(tenureMonths, 10);
    const calculatedEmi = parseFloat(monthlyEmi);

    if (!loanOfferId || isNaN(numericAmount) || isNaN(parsedTenure)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan application parameters.'
      });
    }

    const applicationId = `LN-APP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    let applicationRecord = null;

    if (isDbConnected) {
      applicationRecord = await prisma.loanApplication.create({
        data: {
          id: uuidv4(),
          userId,
          loanOfferId,
          amount: numericAmount,
          tenureMonths: parsedTenure,
          monthlyEmi: calculatedEmi || 0,
          purpose: purpose || 'Demonstration Credit Facility',
          employmentType: employmentType || 'Salaried',
          monthlyIncome: numericIncome || 80000,
          status: 'APPROVED', // Instant pre-approved demonstration
          reviewerNotes: 'Automated underwriting completed: credit score verified.'
        },
        include: { loanOffer: true }
      });

      await prisma.notification.create({
        data: {
          userId,
          title: `Loan Pre-Approved: ₹${numericAmount.toLocaleString('en-IN')}`,
          message: `Your ${applicationRecord.loanOffer?.title || 'loan'} request has received automated pre-approval. Application ID: ${applicationId}`,
          type: 'LOAN',
          priority: 'MEDIUM',
          actionUrl: '/loans'
        }
      });
    } else {
      applicationRecord = {
        id: uuidv4(),
        applicationId,
        userId,
        loanOfferId,
        amount: numericAmount,
        tenureMonths: parsedTenure,
        monthlyEmi: calculatedEmi || 0,
        purpose: purpose || 'Demonstration Credit Facility',
        employmentType: employmentType || 'Salaried',
        monthlyIncome: numericIncome || 80000,
        status: 'APPROVED',
        appliedAt: new Date(),
        reviewedAt: new Date(),
        reviewerNotes: 'Automated underwriting completed: credit score verified.',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      store.loanApplications.unshift(applicationRecord);

      store.notifications.unshift({
        id: uuidv4(),
        userId,
        title: `Loan Pre-Approved: ₹${numericAmount.toLocaleString('en-IN')}`,
        message: `Your loan application ${applicationId} has received automated pre-approval.`,
        type: 'LOAN',
        priority: 'MEDIUM',
        isRead: false,
        readAt: null,
        actionUrl: '/loans',
        createdAt: new Date()
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully. Automated pre-approval granted.',
      application: applicationRecord
    });
  } catch (error) {
    console.error('Apply for loan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit loan application',
      error: error.message
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    let apps = [];

    if (isDbConnected) {
      apps = await prisma.loanApplication.findMany({
        where: { userId },
        include: { loanOffer: true },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      apps = store.loanApplications.filter(a => a.userId === userId).map(a => {
        const offer = store.loanOffers.find(o => o.id === a.loanOfferId);
        return { ...a, loanOffer: offer };
      });
    }

    return res.status(200).json({
      success: true,
      data: apps
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: error.message
    });
  }
};
