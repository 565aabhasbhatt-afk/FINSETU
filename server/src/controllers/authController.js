import { v4 as uuidv4 } from 'uuid';
import { prisma, isDbConnected, store } from '../services/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { parseDeviceFromReq } from '../utils/deviceParser.js';
import { emitLoginUpdate, emitSecurityAlert } from '../socket/socketHandler.js';

export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let existingUser = null;
    if (isDbConnected) {
      existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    } else {
      existingUser = store.users.find(u => u.email === normalizedEmail);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = await hashPassword(password);
    const userId = uuidv4();
    const accountNumber = '409' + Math.floor(100000000 + Math.random() * 900000000);
    const upiId = `${normalizedEmail.split('@')[0]}@finsetu`;
    const deviceInfo = parseDeviceFromReq(req);
    const sessionToken = uuidv4();

    let newUser = null;
    let newAccount = null;

    if (isDbConnected) {
      // Execute in PostgreSQL transaction
      const result = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            id: userId,
            fullName,
            email: normalizedEmail,
            phone: phone || null,
            passwordHash,
            role: 'USER',
            lastLoginAt: new Date()
          }
        });

        const a = await tx.account.create({
          data: {
            userId: u.id,
            accountNumber,
            accountType: 'SAVINGS',
            balance: 25000.00,
            currency: 'INR',
            status: 'ACTIVE',
            upiId
          }
        });

        await tx.loginHistory.create({
          data: {
            userId: u.id,
            emailAttempted: normalizedEmail,
            status: 'SUCCESS',
            ipAddress: deviceInfo.ipAddress,
            approximateLocation: deviceInfo.approximateLocation,
            userAgent: deviceInfo.userAgent,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            deviceType: deviceInfo.deviceType,
            isSuspicious: false,
            sessionTokenId: sessionToken
          }
        });

        await tx.userSession.create({
          data: {
            userId: u.id,
            sessionToken,
            ipAddress: deviceInfo.ipAddress,
            approximateLocation: deviceInfo.approximateLocation,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            deviceType: deviceInfo.deviceType,
            isActive: true,
            expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
          }
        });

        return { user: u, account: a };
      });

      newUser = result.user;
      newAccount = result.account;
    } else {
      newUser = {
        id: userId,
        fullName,
        email: normalizedEmail,
        phone: phone || null,
        passwordHash,
        role: 'USER',
        avatarUrl: null,
        isTwoFactorEnabled: false,
        isLocked: false,
        lockReason: null,
        failedAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };
      newAccount = {
        id: `acc-${Date.now()}`,
        userId,
        accountNumber,
        accountType: 'SAVINGS',
        balance: 25000.00,
        currency: 'INR',
        status: 'ACTIVE',
        upiId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      store.users.push(newUser);
      store.accounts.push(newAccount);

      store.loginHistories.unshift({
        id: uuidv4(),
        userId,
        emailAttempted: normalizedEmail,
        status: 'SUCCESS',
        failureReason: null,
        ipAddress: deviceInfo.ipAddress,
        approximateLocation: deviceInfo.approximateLocation,
        userAgent: deviceInfo.userAgent,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceType: deviceInfo.deviceType,
        isSuspicious: false,
        riskFlags: null,
        sessionTokenId: sessionToken,
        createdAt: new Date()
      });

      store.userSessions.unshift({
        id: uuidv4(),
        userId,
        sessionToken,
        deviceId: null,
        ipAddress: deviceInfo.ipAddress,
        approximateLocation: deviceInfo.approximateLocation,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceType: deviceInfo.deviceType,
        isActive: true,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        revokedAt: null,
        revokeReason: null,
        createdAt: new Date()
      });
    }

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      sessionToken
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to FINSETU.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        account: newAccount
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal error during registration',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const deviceInfo = parseDeviceFromReq(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = null;
    if (isDbConnected) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { account: true }
      });
    } else {
      user = store.users.find(u => u.email === normalizedEmail);
      if (user) {
        const acc = store.accounts.find(a => a.userId === user.id);
        user = { ...user, account: acc };
      }
    }

    // Handle non-existent user attempt
    if (!user) {
      const failedEntry = {
        id: uuidv4(),
        userId: null,
        emailAttempted: normalizedEmail,
        status: 'FAILED',
        failureReason: 'Account does not exist',
        ipAddress: deviceInfo.ipAddress,
        approximateLocation: deviceInfo.approximateLocation,
        userAgent: deviceInfo.userAgent,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceType: deviceInfo.deviceType,
        isSuspicious: true,
        riskFlags: 'UNKNOWN_IDENTITY_ENUMERATION',
        sessionTokenId: null,
        createdAt: new Date()
      };

      if (isDbConnected) {
        await prisma.loginHistory.create({ data: failedEntry });
      } else {
        store.loginHistories.unshift(failedEntry);
      }

      emitLoginUpdate(failedEntry);

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: `Account is locked: ${user.lockReason || 'Excessive failed authentication attempts. Please contact SecOps.'}`
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      const newFailedAttempts = (user.failedAttempts || 0) + 1;
      const willLock = newFailedAttempts >= 5;

      const failedEntry = {
        id: uuidv4(),
        userId: user.id,
        emailAttempted: normalizedEmail,
        status: willLock ? 'BLOCKED' : 'FAILED',
        failureReason: 'Invalid password credentials',
        ipAddress: deviceInfo.ipAddress,
        approximateLocation: deviceInfo.approximateLocation,
        userAgent: deviceInfo.userAgent,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceType: deviceInfo.deviceType,
        isSuspicious: newFailedAttempts >= 3,
        riskFlags: newFailedAttempts >= 3 ? 'CONSECUTIVE_AUTH_FAILURES' : null,
        sessionTokenId: null,
        createdAt: new Date()
      };

      if (isDbConnected) {
        await prisma.loginHistory.create({ data: failedEntry });
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: newFailedAttempts,
            isLocked: willLock,
            lockReason: willLock ? 'Locked due to 5 consecutive failed login attempts.' : null
          }
        });
      } else {
        store.loginHistories.unshift(failedEntry);
        user.failedAttempts = newFailedAttempts;
        if (willLock) {
          user.isLocked = true;
          user.lockReason = 'Locked due to 5 consecutive failed login attempts.';
        }
      }

      emitLoginUpdate(failedEntry);
      if (willLock) {
        emitSecurityAlert({
          title: `Account Locked: ${user.email}`,
          severity: 'HIGH',
          time: new Date()
        });
      }

      return res.status(401).json({
        success: false,
        message: willLock
          ? 'Account locked due to 5 consecutive failed login attempts. Contact administrator.'
          : `Invalid credentials. (${5 - newFailedAttempts} attempts remaining)`
      });
    }

    // Successful login: reset failed attempts & record session
    const sessionToken = uuidv4();
    const successEntry = {
      id: uuidv4(),
      userId: user.id,
      emailAttempted: normalizedEmail,
      status: 'SUCCESS',
      failureReason: null,
      ipAddress: deviceInfo.ipAddress,
      approximateLocation: deviceInfo.approximateLocation,
      userAgent: deviceInfo.userAgent,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
      isSuspicious: false,
      riskFlags: null,
      sessionTokenId: sessionToken,
      createdAt: new Date()
    };

    const sessionRecord = {
      id: uuidv4(),
      userId: user.id,
      sessionToken,
      deviceId: null,
      ipAddress: deviceInfo.ipAddress,
      approximateLocation: deviceInfo.approximateLocation,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceType: deviceInfo.deviceType,
      isActive: true,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      revokedAt: null,
      revokeReason: null,
      createdAt: new Date()
    };

    if (isDbConnected) {
      await prisma.loginHistory.create({ data: successEntry });
      await prisma.userSession.create({ data: sessionRecord });
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: 0,
          lastLoginAt: new Date()
        }
      });
    } else {
      store.loginHistories.unshift(successEntry);
      store.userSessions.unshift(sessionRecord);
      user.failedAttempts = 0;
      user.lastLoginAt = new Date();
    }

    emitLoginUpdate(successEntry);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionToken
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        account: user.account
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionToken = req.sessionToken;
    if (sessionToken) {
      if (isDbConnected) {
        await prisma.userSession.updateMany({
          where: { sessionToken },
          data: { isActive: false, revokedAt: new Date(), revokeReason: 'User initiated logout' }
        });
      } else {
        const s = store.userSessions.find(sess => sess.sessionToken === sessionToken);
        if (s) {
          s.isActive = false;
          s.revokedAt = new Date();
          s.revokeReason = 'User initiated logout';
        }
      }
    }

    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        account: user.account
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  // Secure response: always respond with success to avoid email enumeration
  return res.status(200).json({
    success: true,
    message: 'If an account exists with this email, security reset instructions have been dispatched.'
  });
};
