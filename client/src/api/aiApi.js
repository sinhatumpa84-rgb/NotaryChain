import api from './axios';

export const groqSummarize = (documentId) =>
  api.post('/ai/groq-summarize', { documentId });

export const groqChat = (documentId, message, history = [], documentContext = '') =>
  api.post('/ai/groq-chat', { documentId, message, history, documentContext });

export const groqExplainFlag = (documentId, fraudMetadata = null) =>
  api.post('/ai/groq-explain-flag', { documentId, fraudMetadata });

export const runOCR = (documentId) => api.post('/ai/ocr', { documentId });
export const detectFraud = (documentId) => api.post('/ai/fraud-detect', { documentId });
export const detectTampering = (documentId) => api.post('/ai/tamper-detect', { documentId });
export const classifyDocument = (documentId) => api.post('/ai/classify', { documentId });
export const getDocumentReports = (documentId) => api.get(`/ai/reports/document/${documentId}`);
