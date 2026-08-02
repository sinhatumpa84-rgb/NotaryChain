const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userRole: String,
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  action: { type: String, required: true },
  category: { type: String, enum: ['auth', 'document', 'user', 'system', 'verification', 'admin'] },
  ipAddress: String,
  browser: String,
  device: String,
  os: String,
  userAgent: String,
  screenResolution: String,
  location: { city: String, region: String, country: String, coordinates: [Number] },
  sessionId: String,
  previousValues: mongoose.Schema.Types.Mixed,
  newValues: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['success', 'failure', 'warning'] },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

auditSchema.index({ userId: 1 });
auditSchema.index({ action: 1 });
auditSchema.index({ createdAt: 1 });
auditSchema.index({ documentId: 1 });
auditSchema.index({ category: 1 });
auditSchema.index({ action: 1, createdAt: -1 });

auditSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function(next) {
  next(new Error('Audit logs are immutable'));
});

module.exports = mongoose.model('AuditLog', auditSchema);
