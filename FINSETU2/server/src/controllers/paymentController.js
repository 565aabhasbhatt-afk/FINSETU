import Razorpay from 'razorpay';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { prisma, isDbConnected, store } from '../services/db.js';
import { emitTransactionUpdate } from '../socket/socketHandler.js';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_finsetu_sample';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_demo_token';

let razorpayClient = null;
try {
  razorpayClient = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
  });
} catch (e) {
  console.warn('[FINSETU Payments] Razorpay client initialized in test mockup mode:', e.message);
}

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', paymentMethod = 'UPI' } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid deposit amount is required.'
      });
    }

    const receipt = `RCPT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    let order = null;
    const isMockCredentials = razorpayKeyId.includes('sample') || razorpayKeyId.includes('placeholder');

    if (razorpayClient && !isMockCredentials) {
      try {
        order = await razorpayClient.orders.create({
          amount: Math.round(numericAmount * 100), // Razorpay takes amounts in paise
          currency,
          receipt,
          notes: {
            userId: req.user.id,
            userEmail: req.user.email,
            paymentMethod
          }
        });
      } catch (err) {
        console.warn('[Razorpay API] Live order creation fallback:', err.message);
      }
    }

    // If Razorpay test credentials are mock/sandbox or returned an error, generate simulated test order
    if (!order) {
      order = {
        id: `order_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        entity: 'order',
        amount: Math.round(numericAmount * 100),
        amount_paid: 0,
        amount_due: Math.round(numericAmount * 100),
        currency,
        receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
        notes: {
          simulated: true,
          mode: 'RAZORPAY_TEST_SIMULATION'
        }
      };
    }

    return res.status(200).json({
      success: true,
      keyId: razorpayKeyId,
      order,
      isSimulated: isMockCredentials
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

export const verifyPaymentSignature = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      paymentMethod = 'UPI',
      isSimulated = false
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and Payment ID are required for signature verification.'
      });
    }

    // Check duplicate transaction processing
    if (isDbConnected) {
      const existing = await prisma.transaction.findFirst({
        where: { razorpayPaymentId: razorpay_payment_id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Payment has already been processed and credited.'
        });
      }
    } else {
      const existing = store.transactions.find(t => t.razorpayPaymentId === razorpay_payment_id);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Payment has already been processed.'
        });
      }
    }

    let isValid = false;

    // Cryptographic signature check
    if (razorpay_signature && !isSimulated && !razorpayKeySecret.includes('demo')) {
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(text)
        .digest('hex');
      isValid = generatedSignature === razorpay_signature;
    } else {
      // In test mode or simulation, verify format
      isValid = razorpay_payment_id.startsWith('pay_');
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed. Untrusted payload rejected.'
      });
    }

    const numericAmount = parseFloat(amount);
    const referenceId = `DEP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let transactionRecord = null;

    if (isDbConnected) {
      transactionRecord = await prisma.$transaction(async (tx) => {
        const account = await tx.account.findUnique({ where: { userId } });
        if (!account) throw new Error('User bank account not found.');

        await tx.account.update({
          where: { id: account.id },
          data: { balance: { increment: numericAmount } }
        });

        const createdTx = await tx.transaction.create({
          data: {
            referenceId,
            sourceAccountId: null,
            targetAccountId: account.id,
            sourceUserId: null,
            targetUserId: userId,
            amount: numericAmount,
            currency: 'INR',
            type: 'DEPOSIT',
            paymentMethod,
            status: 'COMPLETED',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature || 'TEST_SIGNATURE_VERIFIED',
            description: `Deposit via Razorpay Test Gateway (${paymentMethod})`,
            isSimulated,
            riskScore: 5,
            riskLevel: 'LOW'
          }
        });

        await tx.notification.create({
          data: {
            userId,
            title: `Deposit Confirmed: ₹${numericAmount.toLocaleString('en-IN')}`,
            message: `Credited via ${paymentMethod} Gateway. Ref: ${referenceId}`,
            type: 'TRANSACTION',
            priority: 'LOW',
            actionUrl: '/transactions'
          }
        });

        return createdTx;
      });
    } else {
      const account = store.accounts.find(a => a.userId === userId);
      if (account) {
        account.balance = Number(account.balance) + numericAmount;
      }

      transactionRecord = {
        id: uuidv4(),
        referenceId,
        sourceAccountId: null,
        targetAccountId: account ? account.id : null,
        sourceUserId: null,
        targetUserId: userId,
        amount: numericAmount,
        currency: 'INR',
        type: 'DEPOSIT',
        paymentMethod,
        status: 'COMPLETED',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature || 'TEST_SIGNATURE_VERIFIED',
        description: `Deposit via Razorpay Test Gateway (${paymentMethod})`,
        isSimulated,
        riskScore: 5,
        riskLevel: 'LOW',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      store.transactions.unshift(transactionRecord);
    }

    emitTransactionUpdate(transactionRecord);

    return res.status(200).json({
      success: true,
      message: 'Deposit verified and account balance credited successfully.',
      transaction: transactionRecord
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};
