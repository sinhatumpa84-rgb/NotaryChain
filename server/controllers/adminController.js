const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const FraudReport = require('../models/FraudReport');
const r = require('../utils/apiResponse');

exports.getAllUsers = async (req, res, next) => { try { r.success(res, await User.find().limit(10)); } catch (x) { next(x); } };
exports.getUserById = async (req, res, next) => { try { r.success(res, await User.findById(req.params.id)); } catch (x) { next(x); } };
exports.updateUserRole = async (req, res, next) => { try { r.success(res, await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true })); } catch (x) { next(x); } };
exports.toggleUserActive = async (req, res, next) => { try { const u = await User.findById(req.params.id); u.isActive = !u.isActive; await u.save(); r.success(res, u); } catch (x) { next(x); } };
exports.getSystemHealth = async (req, res) => r.success(res, { status: 'ok' });
exports.getLoginHistory = async (req, res, next) => { try { r.success(res, await LoginHistory.find().limit(10)); } catch (x) { next(x); } };
exports.getFraudReports = async (req, res, next) => { try { r.success(res, await FraudReport.find().limit(10)); } catch (x) { next(x); } };
exports.updateFraudReport = async (req, res, next) => { try { r.success(res, await FraudReport.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })); } catch (x) { next(x); } };
