const OCR = require('./ocrService');
const Fraud = require('./fraudDetectionService');
const Doc = require('./documentAnalysisService');
const Id = require('./identityVerificationService');
const Sig = require('./signatureService');

const r = {
  ocr: new OCR(),
  fraud_detection: new Fraud(),
  summarization: new Doc(),
  identity_verification: new Id(),
  signature_verification: new Sig()
};

exports.aiServiceRegistry = r;
exports.processDocument = async (id, t, o) => r[t] ? r[t].processDocument(id, null, o) : null;
exports.getAvailableServices = () => Object.keys(r);
