import { Router } from 'express';
import {
  simulateWhatIfPayment,
  analyzePaymentRisk,
  activateSafeMode
} from '../controllers/guardianController.js';
import { verifyToken } from '../utils/jwt.js';
import { prisma, isDbConnected, store } from '../services/db.js';

const router = Router();

const optionalAuth = async (req, res, next) => {
  let token = null;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      if (isDbConnected) {
        req.user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { account: true }
        });
      } else {
        const u = store.users.find(usr => usr.id === decoded.userId);
        if (u) {
          const acc = store.accounts.find(a => a.userId === u.id);
          req.user = { ...u, account: acc };
        }
      }
    }
  } catch (e) {
    // Soft fallback if token invalid
  }
  next();
};

router.post('/simulate-what-if', optionalAuth, simulateWhatIfPayment);
router.post('/analyze-risk', optionalAuth, analyzePaymentRisk);
router.post('/activate-safe-mode', optionalAuth, activateSafeMode);

export default router;
