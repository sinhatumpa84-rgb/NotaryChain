const router = require('express').Router();
const c = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

// ─── Groq-powered AI routes ────────────────────────────────────────────────
router.post('/groq-summarize', c.groqSummarize);
router.post('/groq-chat', c.groqChat);
router.post('/groq-explain-flag', c.groqExplainFlag);

// ─── Existing AI service routes (unchanged) ────────────────────────────────
router.post('/ocr', c.processOCR);
router.post('/fraud-detect', c.detectFraud);
router.post('/tamper-detect', c.detectTampering);
router.post('/summarize', c.summarizeDocument);
router.post('/identity-verify', c.verifyIdentity);
router.post('/face-verify', c.verifyFace);
router.post('/liveness', c.checkLiveness);
router.post('/deepfake-detect', c.detectDeepfake);
router.post('/signature-verify', c.verifySignature);
router.post('/compare', c.compareDocuments);
router.post('/classify', c.classifyDocument);
router.post('/fraud-score', c.calculateFraudScore);
router.get('/reports/:id', c.getReport);
router.get('/reports/document/:documentId', c.getDocumentReports);

module.exports = router;
