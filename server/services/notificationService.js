const Notification = require('../models/Notification');

exports.create = async (d) => await Notification.create(d);

exports.getByUser = async (userId, { page = 1, limit = 10, isRead }) => {
  let q = { userId };
  if (isRead !== undefined) q.isRead = isRead;
  const total = await Notification.countDocuments(q);
  const data = await Notification.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  return { data, total };
};

exports.getUnreadCount = async (userId) => await Notification.countDocuments({ userId, isRead: false });
exports.markAsRead = async (id, userId) => await Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true, readAt: Date.now() }, { new: true });
exports.markAllAsRead = async (userId) => await Notification.updateMany({ userId, isRead: false }, { isRead: true, readAt: Date.now() });
exports.deleteNotification = async (id, userId) => await Notification.findOneAndDelete({ _id: id, userId });
exports.createBulk = async (arr) => await Notification.insertMany(arr);

exports.notifyDocumentStatusChange = async (userId, title, s) => this.create({ userId, type: 'document_status', title: 'Document Status Updated', message: `${title} is now ${s}` });
exports.notifyVerificationAssigned = async (userId, title) => this.create({ userId, type: 'verification', title: 'Verification Assigned', message: `You have been assigned to verify ${title}` });
exports.notifyFraudAlert = async (userId, title, l) => this.create({ userId, type: 'fraud_alert', title: 'Fraud Alert', message: `Fraud detected on ${title} (Level: ${l})`, priority: 'urgent' });
exports.notifyApproval = async (userId, title) => this.create({ userId, type: 'approval', title: 'Document Approved', message: `${title} has been approved` });
exports.notifyRejection = async (userId, title, r) => this.create({ userId, type: 'rejection', title: 'Document Rejected', message: `${title} was rejected: ${r}` });
exports.notifyWelcome = async (userId, n) => this.create({ userId, type: 'welcome', title: 'Welcome', message: `Welcome ${n}!` });
exports.notifyDocumentShared = async (userId, title, by) => this.create({ userId, type: 'share', title: 'Document Shared', message: `${title} shared by ${by}` });
