const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const docSchema = new mongoose.Schema({
  uniqueDocId: { type: String, unique: true },
  title: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  originalFileName: { type: String, required: true },
  fileType: String,
  fileSize: Number,
  mimeType: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'pending_verification', 'under_review', 'approved', 'rejected', 'notarized'], default: 'draft' },
  currentVersion: { type: Number, default: 1 },
  versions: [{
    versionNumber: Number,
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    uploadedAt: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changeNotes: String
  }],
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['read', 'write', 'admin'] },
    sharedAt: Date,
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  hash: String,
  encryptionStatus: String,
  tags: [String],
  category: String,
  metadata: mongoose.Schema.Types.Mixed,
  assignedReviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: String,
  reviewedAt: Date,
  notarizedAt: Date,
  notaryCertificateUrl: String,
  expiresAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// uniqueDocId is uniquely indexed in schema definition
docSchema.index({ uploadedBy: 1 });
docSchema.index({ status: 1 });
docSchema.index({ isDeleted: 1 });
docSchema.index({ createdAt: 1 });
docSchema.index({ title: 'text', description: 'text' });

docSchema.pre('save', function(next) {
  if (this.isNew && !this.uniqueDocId) {
    this.uniqueDocId = uuidv4();
  }
  next();
});

module.exports = mongoose.model('Document', docSchema);
