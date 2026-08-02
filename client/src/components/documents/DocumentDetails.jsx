import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineShare,
  HiOutlineArrowDownTray,
  HiOutlineCheckBadge,
} from 'react-icons/hi2';
import AIInsightsPanel from './AIInsightsPanel';

const DEMO_FRAUD = {
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

const DocumentDetails = () => {
  const { id: documentId } = useParams();
  const [activeTab, setActiveTab] = useState('preview');

  const TABS = [
    { id: 'preview', label: 'Preview', icon: <HiOutlineDocumentText /> },
    { id: 'ai', label: 'AI Analysis', icon: <HiOutlineSparkles /> },
    { id: 'insights', label: 'AI Insights', icon: <HiOutlineCheckBadge /> },
    { id: 'audit', label: 'Audit Trail', icon: <HiOutlineClock /> },
    { id: 'verification', label: 'Verification', icon: <HiOutlineShieldCheck /> },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <HiOutlineDocumentText size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white dark:text-white text-slate-900 flex items-center gap-3 flex-wrap">
              Q3 Financial Report.pdf
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-semibold tracking-wide uppercase">
                ✓ Verified
              </span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Uploaded by Jane Doe · Oct 24, 2023 · ID: {documentId || 'DOC-908234'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-sm">
            <HiOutlineShare className="w-4 h-4" /> Share
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 text-sm">
            <HiOutlineArrowDownTray className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 dark:border-slate-800 border-slate-200 mb-8 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3.5 px-4 font-medium text-sm transition-all relative whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activetab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="min-h-[400px]"
        >
          {activeTab === 'preview' && (
            <div className="w-full h-[580px] bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <HiOutlineDocumentText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Document Preview Area</p>
                <p className="text-slate-500 text-sm mt-1">PDF / Image rendering</p>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <HiOutlineSparkles className="text-indigo-400" /> Fraud Detection Score
                </h3>
                <div className="text-5xl font-bold text-emerald-400 mb-2">
                  98<span className="text-2xl text-slate-500">/100</span>
                </div>
                <p className="text-slate-400 text-sm">Low risk. No tampering detected in metadata or pixels.</p>
                <div className="mt-4 w-full bg-slate-900 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
              <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
                <h3 className="text-white font-medium mb-4">Extracted Entities</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b border-slate-700/60 pb-2.5">
                    <span className="text-slate-400">Effective Date</span>
                    <span className="text-white font-medium">Oct 24, 2023</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-700/60 pb-2.5">
                    <span className="text-slate-400">Total Amount</span>
                    <span className="text-white font-medium">$45,000.00 / quarter</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-700/60 pb-2.5">
                    <span className="text-slate-400">Party A</span>
                    <span className="text-white font-medium">TechCorp Solutions Inc.</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Party B</span>
                    <span className="text-white font-medium">Acme Enterprises Ltd.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ── AI INSIGHTS TAB (New Groq-powered feature) ── */}
          {activeTab === 'insights' && (
            <AIInsightsPanel
              documentId={documentId}
              fraudMetadata={DEMO_FRAUD}
            />
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              {[
                { action: 'Document Uploaded', user: 'Jane Doe', time: 'Oct 24, 2023 · 10:14 AM', icon: '📤', color: 'text-blue-400' },
                { action: 'OCR Analysis Complete', user: 'AI System', time: 'Oct 24, 2023 · 10:14 AM', icon: '🤖', color: 'text-purple-400' },
                { action: 'Fraud Detection Passed', user: 'AI System', time: 'Oct 24, 2023 · 10:15 AM', icon: '🛡️', color: 'text-emerald-400' },
                { action: 'Sent for Notarization', user: 'Jane Doe', time: 'Oct 24, 2023 · 11:02 AM', icon: '✍️', color: 'text-amber-400' },
                { action: 'Notarized & Certified', user: 'Notary John Smith', time: 'Oct 24, 2023 · 2:30 PM', icon: '✅', color: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${item.color}`}>{item.action}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.user} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'OCR Confidence', value: '99%', status: 'Passed', color: 'emerald' },
                { label: 'Tamper Detection', value: 'Clean', status: 'Passed', color: 'emerald' },
                { label: 'Signature Verification', value: 'Pending', status: 'Pending', color: 'amber' },
              ].map(item => (
                <div key={item.label} className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{item.label}</p>
                  <p className="text-2xl font-bold text-white mb-1">{item.value}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DocumentDetails;
