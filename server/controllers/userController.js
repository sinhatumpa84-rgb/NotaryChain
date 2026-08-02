const User = require('../models/User');
const resU = require('../utils/apiResponse');
const err = require('../utils/apiError');
const a = require('../middleware/auditLogger');

exports.getProfile = async (req, res) => resU.success(res, require('../utils/helpers').sanitizeUser(req.user));

exports.updateProfile = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    await a.auditAction(u._id, 'update_profile', 'user', { newValues: req.body });
    resU.success(res, require('../utils/helpers').sanitizeUser(u));
  } catch (x) { next(x); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id);
    if (!(await u.comparePassword(req.body.currentPassword))) throw new err.BadRequestError('Wrong password');
    u.password = req.body.newPassword; u.refreshTokens = []; await u.save();
    await a.auditAction(u._id, 'change_password', 'user');
    resU.success(res, null, 'Password changed');
  } catch (x) { next(x); }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    await a.auditAction(req.user._id, 'delete_account', 'user');
    resU.success(res, null, 'Deactivated');
  } catch (x) { next(x); }
};

exports.getActivityTimeline = async (req, res, next) => {
  try {
    const l = await require('../models/AuditLog').find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    resU.success(res, l);
  } catch (x) { next(x); }
};
