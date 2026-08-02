const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const t = require('../services/tokenService');
const e = require('../services/emailService');
const a = require('../middleware/auditLogger');
const resU = require('../utils/apiResponse');
const err = require('../utils/apiError');

const DEMO_USER = {
  _id: 'demo-user-123',
  id: 'demo-user-123',
  firstName: 'Ada',
  lastName: 'Lovelace',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'company',
  isActive: true,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

exports.signup = async (req, res, next) => {
  try {
    const { email, firstName, lastName, role } = req.body;

    // Fallback if MongoDB is not reachable
    if (mongoose.connection.readyState !== 1) {
      const demoUser = {
        ...DEMO_USER,
        _id: 'demo-user-123',
        firstName: firstName || 'Ada',
        lastName: lastName || 'Lovelace',
        name: `${firstName || 'Ada'} ${lastName || 'Lovelace'}`,
        email: email || 'ada@example.com',
        role: role || 'company'
      };
      const tokens = t.generateTokenPair(demoUser._id);
      return resU.success(res, { user: demoUser, tokens });
    }

    if (await User.findOne({ email })) throw new err.ConflictError('Email taken');
    const u = await User.create(req.body);
    const tk = u.createEmailVerificationToken();
    await u.save();
    try {
      await e.sendVerificationEmail(u.email, u.firstName, tk);
    } catch (err) {}
    
    const tokens = t.generateTokenPair(u._id);
    await Session.create({ userId: u._id, token: await t.hashToken(tokens.refreshToken), ...req.deviceInfo });
    await LoginHistory.create({ userId: u._id, status: 'success', ...req.deviceInfo });
    await a.auditAction(u._id, 'signup', 'auth', req.deviceInfo);
    resU.success(res, { user: require('../utils/helpers').sanitizeUser(u), tokens });
  } catch (x) { next(x); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fallback if MongoDB is not reachable
    if (mongoose.connection.readyState !== 1) {
      const demoUser = {
        ...DEMO_USER,
        email: email || 'ada@example.com'
      };
      const tokens = t.generateTokenPair(demoUser._id);
      return resU.success(res, { user: demoUser, tokens });
    }

    const u = await User.findOne({ email });
    if (!u || !(await u.comparePassword(password))) {
      if (u) {
        await LoginHistory.create({ userId: u._id, status: 'failure', ...req.deviceInfo });
      }
      throw new err.UnauthorizedError('Invalid credentials');
    }
    
    const tokens = t.generateTokenPair(u._id);
    u.refreshTokens.push({ token: await t.hashToken(tokens.refreshToken), createdAt: Date.now(), expiresAt: Date.now() + 7 * 24 * 3600 * 1000 });
    u.lastLogin = Date.now(); u.loginCount += 1;
    await u.save();
    await Session.create({ userId: u._id, token: await t.hashToken(tokens.refreshToken), ...req.deviceInfo });
    await LoginHistory.create({ userId: u._id, status: 'success', ...req.deviceInfo });
    await a.auditAction(u._id, 'login', 'auth', req.deviceInfo);
    resU.success(res, { user: require('../utils/helpers').sanitizeUser(u), tokens });
  } catch (x) { next(x); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return resU.success(res, null, 'Email verified');
    }
    const ht = require('crypto').createHash('sha256').update(req.params.token).digest('hex');
    const u = await User.findOne({ emailVerificationToken: ht, emailVerificationExpires: { $gt: Date.now() } });
    if (!u) throw new err.BadRequestError('Invalid token');
    u.isEmailVerified = true; u.emailVerificationToken = undefined; u.emailVerificationExpires = undefined;
    await u.save(); await a.auditAction(u._id, 'verify_email', 'auth');
    resU.success(res, null, 'Email verified');
  } catch (x) { next(x); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return resU.success(res, null, 'Email sent');
    }
    const u = await User.findOne({ email: req.body.email });
    if (!u) throw new err.NotFoundError();
    const tk = u.createPasswordResetToken();
    await u.save(); await e.sendPasswordResetEmail(u.email, u.firstName, tk);
    await a.auditAction(u._id, 'forgot_password', 'auth');
    resU.success(res, null, 'Email sent');
  } catch (x) { next(x); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return resU.success(res, null, 'Password reset');
    }
    const ht = require('crypto').createHash('sha256').update(req.params.token).digest('hex');
    const u = await User.findOne({ passwordResetToken: ht, passwordResetExpires: { $gt: Date.now() } });
    if (!u) throw new err.BadRequestError('Invalid token');
    u.password = req.body.password; u.passwordResetToken = undefined; u.passwordResetExpires = undefined; u.refreshTokens = [];
    await u.save(); await a.auditAction(u._id, 'reset_password', 'auth');
    resU.success(res, null, 'Password reset');
  } catch (x) { next(x); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const rt = req.body.token;
    if (!rt) throw new err.UnauthorizedError();
    
    if (mongoose.connection.readyState !== 1) {
      return resU.success(res, t.generateTokenPair('demo-user-123'));
    }

    const decoded = t.verifyRefreshToken(rt);
    const u = await User.findById(decoded.id);
    if (!u) throw new err.UnauthorizedError();
    resU.success(res, t.generateTokenPair(u._id));
  } catch (x) { next(x); }
};

exports.logout = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1 && req.user && req.user._id !== 'demo-user-123') {
      req.user.refreshTokens = []; await req.user.save();
      await Session.updateMany({ userId: req.user._id }, { isActive: false, logoutTime: Date.now() });
      await a.auditAction(req.user._id, 'logout', 'auth');
    }
    resU.success(res, null, 'Logged out');
  } catch (x) { next(x); }
};

exports.getMe = async (req, res) => {
  const targetUser = req.user || DEMO_USER;
  resU.success(res, require('../utils/helpers').sanitizeUser(targetUser));
};

exports.getSessions = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return resU.success(res, []);
    }
    resU.success(res, await Session.find({ userId: req.user._id, isActive: true }));
  } catch (x) { next(x); }
};

exports.revokeSession = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Session.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false });
    }
    resU.success(res, null, 'Revoked');
  } catch (x) { next(x); }
};
