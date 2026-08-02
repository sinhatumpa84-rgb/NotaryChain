const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ipAddress: String,
  browser: String,
  browserVersion: String,
  os: String,
  osVersion: String,
  device: String,
  deviceType: String,
  location: { city: String, region: String, country: String },
  status: { type: String, enum: ['success', 'failure', 'blocked'] },
  failureReason: String,
  userAgent: String,
  sessionId: String
}, { timestamps: true });

loginHistorySchema.index({ userId: 1 });
loginHistorySchema.index({ userId: 1, createdAt: -1 });
loginHistorySchema.index({ ipAddress: 1 });
loginHistorySchema.index({ status: 1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
