const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  riskScore: { type: Number, min: 0, max: 100 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  indicators: [{ type: String, description: String, severity: String, confidence: Number }],
  status: { type: String, enum: ['pending', 'investigating', 'confirmed', 'dismissed'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  reviewNotes: String,
  aiReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIReport' },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

fraudReportSchema.index({ documentId: 1 });
fraudReportSchema.index({ riskScore: 1 });
fraudReportSchema.index({ status: 1 });
fraudReportSchema.index({ riskLevel: 1 });
fraudReportSchema.index({ riskScore: -1, status: 1 });

module.exports = mongoose.model('FraudReport', fraudReportSchema);
