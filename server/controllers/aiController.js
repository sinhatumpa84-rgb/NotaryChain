const mongoose = require('mongoose');
const axios = require('axios');
const ai = require('../services/ai');
const r = require('../utils/apiResponse');
const AR = require('../models/AIReport');
const logger = require('../utils/logger');

// ─── Groq Configuration ──────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function callGroq(messages, temperature = 0.4, max_tokens = 1200) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }
  const res = await axios.post(
    GROQ_BASE_URL,
    { model: GROQ_MODEL, messages, temperature, max_tokens },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  return res.data.choices[0].message.content;
}

// ─── Simulated OCR text & fraud metadata for demo (used when no DB) ──────────
const DEMO_OCR_TEXT = `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of October 24, 2023 ("Effective Date") by and between:

Party A: TechCorp Solutions Inc., a Delaware corporation, having its principal office at 100 Wall Street, New York, NY 10005 ("Service Provider")

Party B: Acme Enterprises Ltd., a California corporation ("Client")

1. SERVICES: Service Provider agrees to provide software development and consulting services as described in Schedule A attached hereto.

2. PAYMENT TERMS: Client shall pay $45,000.00 USD per quarter, due within 30 days of invoice. Late payments accrue interest at 1.5% per month.

3. TERM: This Agreement commences on the Effective Date and continues for one (1) year unless terminated earlier pursuant to Section 8.

4. CONFIDENTIALITY: Both parties agree to maintain the confidentiality of all proprietary information disclosed during the term of this Agreement.

5. INTELLECTUAL PROPERTY: All work product created under this Agreement shall be the exclusive property of Client upon full payment.

6. LIMITATION OF LIABILITY: In no event shall either party be liable for indirect, incidental, or consequential damages.

7. GOVERNING LAW: This Agreement shall be governed by the laws of the State of New York.

8. TERMINATION: Either party may terminate this Agreement with 30 days written notice.

Signatures:
___________________________          ___________________________
John Doe, CEO                         Jane Smith, Director
TechCorp Solutions Inc.               Acme Enterprises Ltd.
Date: ___________                     Date: ___________`;

const DEMO_FRAUD_METADATA = {
  overallRiskScore: 98,
  riskLevel: 'low',
  ocrConsistency: 99,
  metadataIntegrity: 97,
  pixelAnalysis: 'clean',
  deepfakeScore: 2,
  faceVerification: 'not_applicable',
  signatureVerification: 'pending',
  flags: [],
};

// ─── POST /api/ai/groq-summarize ─────────────────────────────────────────────
exports.groqSummarize = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    // Try to get real OCR text from DB, fall back to demo
    let ocrText = DEMO_OCR_TEXT;
    let fraudMeta = DEMO_FRAUD_METADATA;

    if (mongoose.connection.readyState === 1 && documentId) {
      try {
        const report = await AR.findOne({ documentId, reportType: 'ocr', status: 'completed' });
        if (report?.results?.text) ocrText = report.results.text;
        const fraudReport = await AR.findOne({ documentId, reportType: 'fraud_detection', status: 'completed' });
        if (fraudReport?.results) fraudMeta = fraudReport.results;
      } catch (e) {
        logger.warn('Could not fetch DB reports, using demo text');
      }
    }

    const systemPrompt = `You are a document verification assistant for NotaryChain, a legal document notarization platform. 
Analyze the provided document text and return a JSON object ONLY (no markdown, no extra text) with exactly this structure:
{
  "summary": "3-4 sentence plain-language explanation of what this document is and what it does",
  "keyTerms": [
    { "label": "term name", "value": "extracted value or description" }
  ],
  "riskFlags": [
    { "severity": "high|medium|low|info", "flag": "description of the risk or notable item" }
  ],
  "trustScore": 85,
  "documentType": "Service Agreement / Contract / Invoice / etc"
}

Rules:
- keyTerms should include: parties involved, effective date, amounts, obligations, duration, termination terms (up to 8 items)  
- riskFlags: flag missing signatures/dates, vague terms, one-sided clauses, no expiry, unusually high liability limits, etc. (include 'info' for good signs)
- trustScore: 0-100 based on completeness and clarity of the document
- Be concise. keyTerms max 8 items, riskFlags max 6 items.`;

    const userPrompt = `Analyze this document:\n\n${ocrText.substring(0, 4000)}`;

    const raw = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    // Parse JSON response
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (e) {
      // If JSON parsing fails, return structured fallback
      parsed = {
        summary: raw.substring(0, 500),
        keyTerms: [],
        riskFlags: [{ severity: 'info', flag: 'Analysis complete - manual review recommended' }],
        trustScore: 75,
        documentType: 'Document'
      };
    }

    return res.json({ success: true, data: { ...parsed, fraudMetadata: fraudMeta } });
  } catch (err) {
    logger.error('Groq summarize error:', err.message);
    next(err);
  }
};

// ─── POST /api/ai/groq-chat ───────────────────────────────────────────────────
exports.groqChat = async (req, res, next) => {
  try {
    const { documentId, message, history = [], documentContext } = req.body;

    let ocrText = DEMO_OCR_TEXT;
    if (mongoose.connection.readyState === 1 && documentId) {
      try {
        const report = await AR.findOne({ documentId, reportType: 'ocr', status: 'completed' });
        if (report?.results?.text) ocrText = report.results.text;
      } catch (e) {}
    }

    // Use passed context or fall back to fetched/demo text
    const contextText = documentContext || ocrText;

    let systemPrompt;
    if (documentId || contextText) {
      systemPrompt = `You are NotaryChain's AI Document Assistant. A user is asking questions about a specific document.
Answer ONLY based on the document content provided below. If the answer is not in the document, say so clearly.
Be concise (2-3 sentences max per answer). Flag anything risky or unusual clearly.
Never make up document details.

DOCUMENT CONTENT:
${contextText.substring(0, 3500)}`;
    } else {
      systemPrompt = `You are NotaryChain's AI Assistant. NotaryChain is an enterprise legal document verification platform using AI for:
- Fraud detection and tamper analysis on uploaded documents
- OCR extraction and entity recognition
- Notarization workflows with digital audit trails
- Identity verification and face liveness checks
- Blockchain-backed document hashing (Polygon USDC settlement via Neobank)

Help users understand how to use the platform, guide them through uploading, verifying, or signing documents.
Be friendly, concise, and helpful. Keep answers under 3 sentences unless a detailed explanation is needed.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const reply = await callGroq(messages, 0.5, 600);

    return res.json({ success: true, data: { reply, role: 'assistant' } });
  } catch (err) {
    logger.error('Groq chat error:', err.message);
    next(err);
  }
};

// ─── POST /api/ai/groq-explain-flag ──────────────────────────────────────────
exports.groqExplainFlag = async (req, res, next) => {
  try {
    const { documentId, fraudMetadata } = req.body;

    const meta = fraudMetadata || DEMO_FRAUD_METADATA;

    const systemPrompt = `You are a document fraud detection explainer for NotaryChain.
Given fraud detection metadata, explain in plain English WHY a document received certain risk flags.
Be specific, clear, and actionable. Keep it under 150 words. Format as 2-3 clear paragraphs.`;

    const userPrompt = `Explain this fraud detection result:
Overall Risk Score: ${meta.overallRiskScore || meta.riskScore || 'N/A'}/100
Risk Level: ${meta.riskLevel || 'N/A'}
OCR Consistency: ${meta.ocrConsistency || 'N/A'}%
Metadata Integrity: ${meta.metadataIntegrity || 'N/A'}%
Pixel Analysis: ${meta.pixelAnalysis || 'N/A'}
Deepfake Score: ${meta.deepfakeScore || 0}/100
Face Verification: ${meta.faceVerification || 'N/A'}
Signature Verification: ${meta.signatureVerification || 'N/A'}
Flags Detected: ${JSON.stringify(meta.flags || [])}

Why was this document flagged and what should the user do?`;

    const explanation = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.3, 400);

    return res.json({ success: true, data: { explanation } });
  } catch (err) {
    logger.error('Groq explain flag error:', err.message);
    next(err);
  }
};

// ─── Existing AI service endpoints (unchanged) ────────────────────────────────
exports.processOCR = async (req, res, next) => { try { const id = await ai.processDocument(req.body.documentId, 'ocr'); r.success(res, { reportId: id }); } catch (x) { next(x); } };
exports.detectFraud = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.fraud_detection.analyzeDocument(req.body.documentId)); } catch (x) { next(x); } };
exports.detectTampering = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.summarization.detectTampering(req.body.documentId)); } catch (x) { next(x); } };
exports.summarizeDocument = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.summarization.summarize(req.body.documentId)); } catch (x) { next(x); } };
exports.verifyIdentity = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.identity_verification.verifyIdentity(req.user._id)); } catch (x) { next(x); } };
exports.verifyFace = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.identity_verification.verifyFace(req.user._id)); } catch (x) { next(x); } };
exports.checkLiveness = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.identity_verification.checkLiveness(req.user._id)); } catch (x) { next(x); } };
exports.detectDeepfake = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.identity_verification.detectDeepfake()); } catch (x) { next(x); } };
exports.verifySignature = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.signature_verification.verifySignature(req.body.documentId)); } catch (x) { next(x); } };
exports.compareDocuments = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.summarization.compare(req.body.doc1, req.body.doc2)); } catch (x) { next(x); } };
exports.classifyDocument = async (req, res, next) => { try { r.success(res, await ai.aiServiceRegistry.summarization.classify(req.body.documentId)); } catch (x) { next(x); } };
exports.calculateFraudScore = async (req, res, next) => { try { r.success(res, { score: 10 }); } catch (x) { next(x); } };
exports.getReport = async (req, res, next) => { try { r.success(res, await AR.findById(req.params.id)); } catch (x) { next(x); } };
exports.getDocumentReports = async (req, res, next) => { try { r.success(res, await AR.find({ documentId: req.params.documentId })); } catch (x) { next(x); } };
