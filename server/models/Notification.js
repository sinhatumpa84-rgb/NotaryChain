const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['document_status', 'verification', 'approval', 'rejection', 'fraud_alert', 'system', 'welcome', 'share'] },
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  actionUrl: String,
  actionText: String,
  icon: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  metadata: mongoose.Schema.Types.Mixed,
  expiresAt: Date
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
