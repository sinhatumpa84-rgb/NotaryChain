const AuditLog = require('../models/AuditLog');

exports.createAuditLog = (action, category) => (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode < 400) {
      try {
        await AuditLog.create({
          userId: req.user ? req.user._id : null,
          userRole: req.user ? req.user.role : null,
          documentId: req.params.id || req.params.documentId,
          action,
          category,
          ipAddress: req.deviceInfo?.ipAddress,
          browser: req.deviceInfo?.browser,
          device: req.deviceInfo?.device,
          os: req.deviceInfo?.os,
          userAgent: req.deviceInfo?.userAgent,
          status: 'success'
        });
      } catch (e) {
        console.error('Audit Log Error', e);
      }
    }
  });
  next();
};

exports.auditAction = async (userId, action, category, d = {}) => {
  try {
    await AuditLog.create({ userId, action, category, ...d });
  } catch (e) {
    console.error('Audit Action Error', e);
  }
};
