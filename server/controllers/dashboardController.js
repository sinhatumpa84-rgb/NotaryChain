const r = require('../utils/apiResponse');
exports.getAdminDashboard = async (req, res) => r.success(res, { dash: 'admin' });
exports.getCompanyDashboard = async (req, res) => r.success(res, { dash: 'company' });
exports.getBankDashboard = async (req, res) => r.success(res, { dash: 'bank' });
exports.getNotaryDashboard = async (req, res) => r.success(res, { dash: 'notary' });
