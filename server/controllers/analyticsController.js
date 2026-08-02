const r = require('../utils/apiResponse');
exports.getDocumentStats = async (req, res) => r.success(res, { stats: 'docs' });
exports.getUserStats = async (req, res) => r.success(res, { stats: 'users' });
exports.getVerificationStats = async (req, res) => r.success(res, { stats: 'verify' });
exports.getAIUsageStats = async (req, res) => r.success(res, { stats: 'ai' });
exports.getSystemOverview = async (req, res) => r.success(res, { overview: 'all' });
