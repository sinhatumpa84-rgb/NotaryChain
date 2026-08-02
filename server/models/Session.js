const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  ipAddress: String,
  browser: String,
  browserVersion: String,
  os: String,
  osVersion: String,
  device: String,
  deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'] },
  screenResolution: String,
  location: { city: String, region: String, country: String, lat: Number, lng: Number },
  loginTime: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  logoutTime: Date,
  userAgent: String
}, { timestamps: true });

sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ isActive: 1 });
sessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Session', sessionSchema);
