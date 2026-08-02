const mongoose = require('mongoose');

const verificationReqSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['document_verification', 'identity_verification', 'notarization'] },
  status: { type: String, enum: ['pending', 'assigned', 'in_review', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  notes: String,
  reviewNotes: String,
  reviewedAt: Date,
  dueDate: Date,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

verificationReqSchema.index({ status: 1 });
verificationReqSchema.index({ assignedTo: 1 });
verificationReqSchema.index({ requestedBy: 1 });
verificationReqSchema.index({ status: 1, priority: -1 });

module.exports = mongoose.model('VerificationRequest', verificationReqSchema);
