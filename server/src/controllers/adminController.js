import { prisma, isDbConnected, store, dbStatus } from '../services/db.js';

export const getAdminMetrics = async (req, res) => {
  try {
    let totalUsers = 0;
    let totalTransactions = 0;
    let totalLoginAttempts = 0;
    let activeSessionsCount = 0;
    let securityIncidentsCount = 0;
    let attackSimulationsCount = 0;
    let suspiciousActivityCount = 0;
    let usersList = [];
    let recentAuditLogs = [];

    if (isDbConnected) {
      totalUsers = await prisma.user.count();
      totalTransactions = await prisma.transaction.count();
      totalLoginAttempts = await prisma.loginHistory.count();
      activeSessionsCount = await prisma.userSession.count({ where: { isActive: true } });
      securityIncidentsCount = await prisma.securityIncident.count();
      attackSimulationsCount = await prisma.attackSimulation.count();
      suspiciousActivityCount = await prisma.loginHistory.count({ where: { isSuspicious: true } });

      usersList = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isLocked: true,
          failedAttempts: true,
          createdAt: true,
          lastLoginAt: true,
          account: {
            select: {
              accountNumber: true,
              balance: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      recentAuditLogs = await prisma.auditLog.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' }
      });
    } else {
      totalUsers = store.users.length;
      totalTransactions = store.transactions.length;
      totalLoginAttempts = store.loginHistories.length;
      activeSessionsCount = store.userSessions.filter(s => s.isActive).length;
      securityIncidentsCount = store.securityIncidents.length;
      attackSimulationsCount = store.attackSimulations.length;
      suspiciousActivityCount = store.loginHistories.filter(h => h.isSuspicious).length;

      usersList = store.users.map(u => {
        const acc = store.accounts.find(a => a.userId === u.id);
        return {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isLocked: u.isLocked,
          failedAttempts: u.failedAttempts,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
          account: acc ? {
            accountNumber: acc.accountNumber,
            balance: acc.balance,
            status: acc.status
          } : null
        };
      });

      recentAuditLogs = store.auditLogs.slice(0, 15);
    }

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalTransactions,
          totalLoginAttempts,
          activeSessionsCount,
          securityIncidentsCount,
          attackSimulationsCount,
          suspiciousActivityCount,
          databaseStatus: dbStatus
        },
        users: usersList,
        auditLogs: recentAuditLogs
      }
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin telemetry',
      error: error.message
    });
  }
};

export const toggleUserLock = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lock, reason } = req.body;
    const adminEmail = req.user.email;

    if (isDbConnected) {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isLocked: lock,
          lockReason: lock ? (reason || 'SecOps Administrative Security Lock') : null,
          failedAttempts: lock ? undefined : 0
        }
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.user.id,
          actorEmail: adminEmail,
          action: lock ? 'USER_ACCOUNT_LOCKED' : 'USER_ACCOUNT_UNLOCKED',
          targetEntity: 'User',
          targetId: userId,
          ipAddress: (req.ip && req.ip !== '::1' && req.ip !== '127.0.0.1') ? req.ip : '172.20.10.2',
          details: JSON.stringify({ reason })
        }
      });

      return res.status(200).json({
        success: true,
        message: `User account has been ${lock ? 'locked' : 'unlocked'} successfully.`,
        user: { id: user.id, isLocked: user.isLocked }
      });
    } else {
      const user = store.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.isLocked = lock;
      user.lockReason = lock ? (reason || 'SecOps Administrative Security Lock') : null;
      if (!lock) user.failedAttempts = 0;

      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        adminId: req.user.id,
        actorEmail: adminEmail,
        action: lock ? 'USER_ACCOUNT_LOCKED' : 'USER_ACCOUNT_UNLOCKED',
        targetEntity: 'User',
        targetId: userId,
        ipAddress: (req.ip && req.ip !== '::1' && req.ip !== '127.0.0.1') ? req.ip : '172.20.10.2',
        details: JSON.stringify({ reason }),
        createdAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: `User account has been ${lock ? 'locked' : 'unlocked'} successfully.`,
        user: { id: user.id, isLocked: user.isLocked }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user security lock',
      error: error.message
    });
  }
};
