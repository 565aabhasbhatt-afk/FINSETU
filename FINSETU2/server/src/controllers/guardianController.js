import {
  calculatePaymentImpact,
  calculateRiskScore,
  predictMonthEndBalance
} from '../services/aiGuardianService.js';
import { prisma, isDbConnected, store } from '../services/db.js';

export const simulateWhatIfPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, merchant, recipient, category } = req.body;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid positive payment amount is required for simulation.'
      });
    }

    // Retrieve user balance from existing FinSetu data
    let currentBalance = 18450;
    let monthlySpending = 17500;
    let recentTransactions = [];

    if (userId) {
      if (isDbConnected) {
        const account = await prisma.account.findUnique({ where: { userId } });
        if (account) {
          currentBalance = Number(account.balance);
        }
        const txs = await prisma.transaction.findMany({
          where: { sourceUserId: userId },
          orderBy: { createdAt: 'desc' },
          take: 10
        });
        recentTransactions = txs;
        if (txs.length > 0) {
          monthlySpending = txs.reduce((sum, t) => sum + Number(t.amount), 0);
        }
      } else {
        const account = store.accounts.find(a => a.userId === userId);
        if (account) {
          currentBalance = Number(account.balance);
        }
        const txs = store.transactions.filter(t => t.sourceUserId === userId);
        recentTransactions = txs;
        if (txs.length > 0) {
          monthlySpending = txs.reduce((sum, t) => sum + Number(t.amount), 0);
        }
      }
    }

    const impact = calculatePaymentImpact({
      currentBalance,
      amount: numericAmount,
      category: category || 'Shopping',
      recipient: recipient || merchant || 'Amazon',
      monthlySpending,
      recentTransactions
    });

    return res.status(200).json({
      success: true,
      data: impact
    });
  } catch (error) {
    console.error('What-If simulation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to simulate What-If payment',
      error: error.message
    });
  }
};

export const analyzePaymentRisk = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, recipient, category } = req.body;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount required for risk analysis.'
      });
    }

    let userHistory = [];
    if (userId) {
      if (isDbConnected) {
        userHistory = await prisma.transaction.findMany({
          where: { sourceUserId: userId },
          take: 20
        });
      } else {
        userHistory = store.transactions.filter(t => t.sourceUserId === userId);
      }
    }

    const riskAnalysis = calculateRiskScore({
      amount: numericAmount,
      recipient: recipient || 'Unknown Recipient',
      category: category || 'General',
      userHistory,
      deviceTrusted: true,
      isUnusualTime: false
    });

    return res.status(200).json({
      success: true,
      data: riskAnalysis
    });
  } catch (error) {
    console.error('Analyze risk error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze payment risk',
      error: error.message
    });
  }
};

export const activateSafeMode = async (req, res) => {
  try {
    const { amount, recipient, category, protectionReason } = req.body;

    // Simulated hackathon feature: creates an in-app security verification record
    const safeModeRecord = {
      id: `SAFE-MODE-${Date.now().toString(36).toUpperCase()}`,
      status: 'PLACED_IN_SAFE_MODE',
      amount: Number(amount) || 0,
      recipient: recipient || 'New Recipient',
      category: category || 'General',
      activatedAt: new Date(),
      coolingOffMinutes: 30,
      checks: [
        { label: 'Amount reviewed', verified: true },
        { label: 'Recipient reviewed', verified: true },
        { label: 'Behaviour analysed', verified: true },
        { label: 'Device checked', verified: true }
      ],
      notice: 'Simulated Hackathon Demo: Transaction placed in Safe Mode without real bank lock.'
    };

    return res.status(200).json({
      success: true,
      message: 'Payment temporarily placed in Safe Mode for verification.',
      data: safeModeRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to activate safe mode',
      error: error.message
    });
  }
};
