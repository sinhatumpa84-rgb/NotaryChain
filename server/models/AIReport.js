const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  reportType: { type: String, enum: ['ocr', 'fraud_detection', 'tamper_detection', 'summarization', 'identity_verification', 'face_verification', 'liveness', 'deepfake_detection', 'signature_verification', 'comparison', 'classification', 'fraud_score'] },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  results: mongoose.Schema.Types.Mixed,
  confidence: { type: Number, min: 0, max: 100 },
  processingTime: Number,
  errorMessage: String,
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

aiReportSchema.index({ documentId: 1 });
aiReportSchema.index({ reportType: 1 });
aiReportSchema.index({ status: 1 });
aiReportSchema.index({ documentId: 1, reportType: 1 });

module.exports = mongoose.model('AIReport', aiReportSchema);
