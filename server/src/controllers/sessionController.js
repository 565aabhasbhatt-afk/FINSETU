import { prisma, isDbConnected, store } from '../services/db.js';

export const revokeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isDbConnected) {
      const session = await prisma.userSession.findFirst({
        where: { id, userId }
      });

      if (!session) {
        return res.status(404).json({ success: false, message: 'Session record not found.' });
      }

      await prisma.userSession.update({
        where: { id },
        data: {
          isActive: false,
          revokedAt: new Date(),
          revokeReason: 'Revoked by user from Security Dashboard'
        }
      });
    } else {
      const s = store.userSessions.find(sess => sess.id === id && sess.userId === userId);
      if (!s) {
        return res.status(404).json({ success: false, message: 'Session not found.' });
      }
      s.isActive = false;
      s.revokedAt = new Date();
      s.revokeReason = 'Revoked by user from Security Dashboard';
    }

    return res.status(200).json({
      success: true,
      message: 'Active session revoked successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke session',
      error: error.message
    });
  }
};

export const revokeAllSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentToken = req.sessionToken;

    if (isDbConnected) {
      await prisma.userSession.updateMany({
        where: {
          userId,
          sessionToken: { not: currentToken },
          isActive: true
        },
        data: {
          isActive: false,
          revokedAt: new Date(),
          revokeReason: 'Mass termination: Logged out from all other devices'
        }
      });
    } else {
      store.userSessions.forEach(s => {
        if (s.userId === userId && s.sessionToken !== currentToken && s.isActive) {
          s.isActive = false;
          s.revokedAt = new Date();
          s.revokeReason = 'Mass termination: Logged out from all other devices';
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'All other active sessions have been terminated securely.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke all sessions',
      error: error.message
    });
  }
};
