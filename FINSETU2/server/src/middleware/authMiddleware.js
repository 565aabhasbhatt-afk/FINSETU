import { verifyToken } from '../utils/jwt.js';
import { prisma, isDbConnected, store } from '../services/db.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No session token provided.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token.'
      });
    }

    let user = null;
    if (isDbConnected) {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { account: true }
      });
    } else {
      user = store.users.find(u => u.id === decoded.userId);
      if (user) {
        const acc = store.accounts.find(a => a.userId === user.id);
        user = { ...user, account: acc };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with this token no longer exists.'
      });
    }

    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: `Account is locked for security reasons: ${user.lockReason || 'Administrative lock'}`
      });
    }

    req.user = user;
    req.sessionToken = token;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};
