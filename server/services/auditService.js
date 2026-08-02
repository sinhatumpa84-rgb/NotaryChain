const AuditLog = require('../models/AuditLog');

exports.createLog = async (d) => await AuditLog.create(d);

exports.getLogs = async ({ page, limit, sort, order, ...filters }) => {
  const skip = (page - 1) * limit;
  const total = await AuditLog.countDocuments(filters);
  const data = await AuditLog.find(filters).sort({ [sort]: order }).skip(skip).limit(limit).populate('userId', 'firstName lastName email').populate('documentId', 'title uniqueDocId');
  return { data, total };
};

exports.getLogsByUser = async (userId, opt) => this.getLogs({ ...opt, userId });
exports.getLogsByDocument = async (documentId, opt) => this.getLogs({ ...opt, documentId });
exports.getLogStats = async () => await AuditLog.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
