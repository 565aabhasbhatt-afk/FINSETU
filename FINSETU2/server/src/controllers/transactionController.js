import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { prisma, isDbConnected, store } from '../services/db.js';
import { emitTransactionUpdate, emitSecurityAlert } from '../socket/socketHandler.js';


export const sendMoney = async (req, res) => {
  try {
    const senderUserId = req.user.id;
    const { recipientIdentifier, amount, paymentMethod, description, transactionPin } = req.body;

    // ── PIN Verification ──────────────────────────────────────────────────────
    if (!transactionPin) {
      return res.status(400).json({
        success: false,
        message: 'Transaction PIN is required to authorize this transfer.'
      });
    }

    // Fetch sender user record to compare PIN hash
    let senderUser = null;
    if (isDbConnected) {
      senderUser = await prisma.user.findUnique({ where: { id: senderUserId } });
    } else {
      senderUser = store.users.find(u => u.id === senderUserId);
    }

    if (!senderUser) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    if (!senderUser.transactionPinHash) {
      return res.status(403).json({
        success: false,
        message: 'No transaction PIN is set on this account. Please set a PIN first.'
      });
    }

    const pinValid = await bcrypt.compare(String(transactionPin), senderUser.transactionPinHash);
    if (!pinValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect transaction PIN. Please try again.'
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const numericAmount = parseFloat(amount);
    if (!recipientIdentifier || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid recipient identifier and positive amount are required.'
      });
    }

    if (numericAmount > 200000) {
      return res.status(400).json({
        success: false,
        message: 'Transaction exceeds single-transfer regulatory limit of ₹2,00,000.00.'
      });
    }

    // Identify sender account
    let senderAccount = null;
    if (isDbConnected) {
      senderAccount = await prisma.account.findUnique({ where: { userId: senderUserId } });
    } else {
      senderAccount = store.accounts.find(a => a.userId === senderUserId);
    }

    if (!senderAccount) {
      return res.status(404).json({ success: false, message: 'Sender bank account not found.' });
    }

    if (senderAccount.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${senderAccount.status}. Outbound fund transfers are blocked.`
      });
    }

    if (Number(senderAccount.balance) < numericAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Current balance: ₹${Number(senderAccount.balance).toLocaleString('en-IN')}`
      });
    }

    // Locate recipient by email, account number, or UPI ID
    const cleanIdentifier = recipientIdentifier.trim().toLowerCase();
    let recipientUser = null;
    let recipientAccount = null;

    if (isDbConnected) {
      recipientAccount = await prisma.account.findFirst({
        where: {
          OR: [
            { accountNumber: cleanIdentifier },
            { upiId: cleanIdentifier },
            { user: { email: cleanIdentifier } }
          ]
        },
        include: { user: true }
      });
      if (recipientAccount) {
        recipientUser = recipientAccount.user;
      }
    } else {
      recipientAccount = store.accounts.find(
        a => a.accountNumber === cleanIdentifier ||
             a.upiId.toLowerCase() === cleanIdentifier ||
             store.users.find(u => u.id === a.userId)?.email.toLowerCase() === cleanIdentifier
      );
      if (recipientAccount) {
        recipientUser = store.users.find(u => u.id === recipientAccount.userId);
      }
    }

    // Prevent self-transfer
    if (recipientAccount && recipientAccount.userId === senderUserId) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination accounts cannot be identical.'
      });
    }

    const referenceId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Fraud / Risk assessment simulation
    let riskScore = 12;
    let riskLevel = 'LOW';
    if (numericAmount >= 100000) {
      riskScore = 55;
      riskLevel = 'MEDIUM';
    }

    let createdTransaction = null;

    if (isDbConnected) {
      // Execute in PostgreSQL atomic database transaction
      createdTransaction = await prisma.$transaction(async (tx) => {
        // Debit sender
        await tx.account.update({
          where: { id: senderAccount.id },
          data: { balance: { decrement: numericAmount } }
        });

        // Credit recipient if internal Finsetu account
        if (recipientAccount) {
          await tx.account.update({
            where: { id: recipientAccount.id },
            data: { balance: { increment: numericAmount } }
          });
        }

        // Create transaction record
        const t = await tx.transaction.create({
          data: {
            referenceId,
            sourceAccountId: senderAccount.id,
            targetAccountId: recipientAccount ? recipientAccount.id : null,
            sourceUserId: senderUserId,
            targetUserId: recipientUser ? recipientUser.id : null,
            amount: numericAmount,
            currency: 'INR',
            type: 'TRANSFER',
            paymentMethod: paymentMethod || 'UPI',
            status: 'COMPLETED',
            description: description || `Transfer to ${recipientIdentifier}`,
            isSimulated: false,
            riskScore,
            riskLevel
          },
          include: {
            sourceUser: { select: { fullName: true, email: true } },
            targetUser: { select: { fullName: true, email: true } }
          }
        });

        // Create in-app notifications
        await tx.notification.create({
          data: {
            userId: senderUserId,
            title: `Debited ₹${numericAmount.toLocaleString('en-IN')}`,
            message: `Transferred to ${recipientIdentifier}. Ref: ${referenceId}`,
            type: 'TRANSACTION',
            priority: 'LOW',
            actionUrl: '/transactions'
          }
        });

        if (recipientUser) {
          await tx.notification.create({
            data: {
              userId: recipientUser.id,
              title: `Credited ₹${numericAmount.toLocaleString('en-IN')}`,
              message: `Received from ${req.user.fullName}. Ref: ${referenceId}`,
              type: 'TRANSACTION',
              priority: 'LOW',
              actionUrl: '/transactions'
            }
          });
        }

        return t;
      });
    } else {
      // Memory store fallback
      senderAccount.balance = Number(senderAccount.balance) - numericAmount;
      if (recipientAccount) {
        recipientAccount.balance = Number(recipientAccount.balance) + numericAmount;
      }

      createdTransaction = {
        id: uuidv4(),
        referenceId,
        sourceAccountId: senderAccount.id,
        targetAccountId: recipientAccount ? recipientAccount.id : null,
        sourceUserId: senderUserId,
        targetUserId: recipientUser ? recipientUser.id : null,
        amount: numericAmount,
        currency: 'INR',
        type: 'TRANSFER',
        paymentMethod: paymentMethod || 'UPI',
        status: 'COMPLETED',
        description: description || `Transfer to ${recipientIdentifier}`,
        isSimulated: false,
        riskScore,
        riskLevel,
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceUser: { fullName: req.user.fullName, email: req.user.email },
        targetUser: recipientUser ? { fullName: recipientUser.fullName, email: recipientUser.email } : null
      };

      store.transactions.unshift(createdTransaction);
    }

    emitTransactionUpdate(createdTransaction);

    if (riskLevel === 'MEDIUM' || riskLevel === 'HIGH') {
      emitSecurityAlert({
        title: `High Value Transfer: ₹${numericAmount.toLocaleString('en-IN')}`,
        severity: riskLevel,
        time: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Funds transferred successfully.',
      transaction: createdTransaction
    });
  } catch (error) {
    console.error('Send money error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process fund transfer',
      error: error.message
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type, search } = req.query;

    let transactions = [];

    if (isDbConnected) {
      const whereClause = {
        OR: [
          { sourceUserId: userId },
          { targetUserId: userId }
        ]
      };

      if (status && status !== 'ALL') {
        whereClause.status = status;
      }
      if (type && type !== 'ALL') {
        whereClause.type = type;
      }

      transactions = await prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          sourceUser: { select: { fullName: true, email: true } },
          targetUser: { select: { fullName: true, email: true } }
        }
      });
    } else {
      transactions = store.transactions.filter(t => {
        const matchesUser = t.sourceUserId === userId || t.targetUserId === userId;
        const matchesStatus = !status || status === 'ALL' || t.status === status;
        const matchesType = !type || type === 'ALL' || t.type === type;
        return matchesUser && matchesStatus && matchesType;
      });
    }

    // Format fields with clean human date, time, and sender/receiver labels
    const formatted = transactions.map(tx => {
      const isSender = tx.sourceUserId === userId;
      const createdDate = new Date(tx.createdAt);
      const diffMs = Math.max(0, Date.now() - createdDate.getTime());
      const mins = Math.floor(diffMs / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);
      let relativeTime = 'Just now';
      if (mins >= 1 && mins < 60) relativeTime = `${mins}m ago`;
      else if (hours >= 1 && hours < 24) relativeTime = `${hours}h ago`;
      else if (days === 1) relativeTime = 'Yesterday';
      else if (days > 1) relativeTime = `${days}d ago`;

      return {
        id: tx.id,
        referenceId: tx.referenceId,
        amount: Number(tx.amount),
        currency: tx.currency,
        type: tx.type,
        paymentMethod: tx.paymentMethod,
        status: tx.status,
        description: tx.description,
        isSimulated: tx.isSimulated || false,
        riskLevel: tx.riskLevel,
        date: createdDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        relativeTime,
        rawTimestamp: tx.createdAt,
        isSender,
        senderName: tx.sourceUser?.fullName || (isSender ? req.user.fullName : 'External Bank / Gateway'),
        receiverName: tx.targetUser?.fullName || (!isSender ? req.user.fullName : 'Merchant / Recipient')
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      error: error.message
    });
  }
};

export const setTransactionPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pin } = req.body;

    if (!pin || !/^\d{4}$/.test(String(pin))) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 4 digits.'
      });
    }

    const pinHash = await bcrypt.hash(String(pin), 10);

    if (isDbConnected) {
      await prisma.user.update({
        where: { id: userId },
        data: { transactionPinHash: pinHash }
      });
    } else {
      const user = store.users.find(u => u.id === userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      user.transactionPinHash = pinHash;
    }

    return res.status(200).json({ success: true, message: 'Transaction PIN updated successfully.' });
  } catch (error) {
    console.error('Set PIN error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update transaction PIN.', error: error.message });
  }
};
