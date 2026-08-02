const mongoose = require('mongoose');

const sysSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
  category: { type: String, enum: ['general', 'security', 'email', 'ai', 'storage', 'notification'] },
  description: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isEncrypted: { type: Boolean, default: false }
}, { timestamps: true });

sysSettingsSchema.index({ key: 1 }, { unique: true });
sysSettingsSchema.index({ category: 1 });

module.exports = mongoose.model('SystemSettings', sysSettingsSchema);
