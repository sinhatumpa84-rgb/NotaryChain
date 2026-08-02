module.exports = {
  ROLES: { ADMIN: 'admin', COMPANY: 'company', BANK: 'bank', NOTARY: 'notary' },
  DOCUMENT_STATUS: { DRAFT: 'draft', PENDING_VERIFICATION: 'pending_verification', UNDER_REVIEW: 'under_review', APPROVED: 'approved', REJECTED: 'rejected', NOTARIZED: 'notarized' },
  VERIFICATION_STATUS: { PENDING: 'pending', ASSIGNED: 'assigned', IN_REVIEW: 'in_review', APPROVED: 'approved', REJECTED: 'rejected', CANCELLED: 'cancelled' },
  AUDIT_CATEGORIES: { AUTH: 'auth', DOCUMENT: 'document', USER: 'user', SYSTEM: 'system', VERIFICATION: 'verification', ADMIN: 'admin' },
  NOTIFICATION_TYPES: { DOCUMENT_STATUS: 'document_status', VERIFICATION: 'verification', APPROVAL: 'approval', REJECTION: 'rejection', FRAUD_ALERT: 'fraud_alert', SYSTEM: 'system', WELCOME: 'welcome', SHARE: 'share' },
  AI_REPORT_TYPES: ['ocr', 'fraud_detection', 'tamper_detection', 'summarization', 'identity_verification', 'face_verification', 'liveness', 'deepfake_detection', 'signature_verification', 'comparison', 'classification', 'fraud_score'],
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'],
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 52428800
};
