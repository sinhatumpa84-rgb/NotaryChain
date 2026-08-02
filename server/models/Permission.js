const mongoose = require('mongoose');

const permSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  resource: String,
  action: { type: String, enum: ['create', 'read', 'update', 'delete', 'manage', 'approve', 'reject', 'notarize'] },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

permSchema.index({ name: 1 }, { unique: true });
permSchema.index({ resource: 1, action: 1 }, { unique: true });

module.exports = mongoose.model('Permission', permSchema);
