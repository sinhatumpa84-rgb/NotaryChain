import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationTriangle,
  HiOutlineCpuChip, HiOutlineArrowPath, HiOutlineLink,
  HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineBeaker,
  HiOutlineWifi, HiOutlineClock,
} from 'react-icons/hi2';
import { SiPolygon } from 'react-icons/si';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

/* ── Utilities ─────────────────────────────────────────────────────────────── */
const statusIcon = (status) => {
  if (status === 'pass') return <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
  if (status === 'fail') return <HiOutlineXCircle     className="w-5 h-5 text-rose-400    shrink-0" />;
  return                         <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
};

const statusColor = (status) => ({
  pass: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
  fail: 'bg-rose-500/10    border-rose-500/25    text-rose-300',
  warn: 'bg-amber-500/10   border-amber-500/25   text-amber-300',
}[status] ?? '');

const categoryLabel = (id) => {
  if (id <= 3)  return { label: 'Network',  icon: <HiOutlineWifi      className="w-4 h-4" /> };
  if (id <= 6)  return { label: 'Wallet',   icon: <HiOutlineShieldCheck className="w-4 h-4" /> };
  if (id <= 8)  return { label: 'Contract', icon: <HiOutlineCpuChip   className="w-4 h-4" /> };
  if (id <= 12) return { label: 'ABI',      icon: <HiOutlineDocumentText className="w-4 h-4" /> };
  if (id <= 15) return { label: 'Hashing',  icon: <HiOutlineBeaker    className="w-4 h-4" /> };
  if (id <= 18) return { label: 'Execute',  icon: <HiOutlineLink      className="w-4 h-4" /> };
  return                { label: 'Summary', icon: <HiOutlineCheckCircle className="w-4 h-4" /> };
};

/* ── Sub-components ────────────────────────────────────────────────────────── */
const StatPill = ({ value, label, color }) => (
  <div className={`flex flex-col items-center justify-center px-6 py-4 rounded-2xl border ${color}`}>
    <span className="text-3xl font-bold">{value}</span>
    <span className="text-xs mt-1 opacity-70 uppercase tracking-wider">{label}</span>
  </div>
);

const CheckRow = ({ check, index }) => {
  const cat = categoryLabel(check.id);
  return (
    <motion.div
      key={check.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-start gap-3 p-3.5 rounded-xl border ${statusColor(check.status)}`}
    >
      {statusIcon(check.status)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold opacity-60 flex items-center gap-1">
            {cat.icon} {cat.label}
          </span>
          <span className="text-sm font-medium">#{check.id} – {check.name}</span>
        </div>
        {check.detail && (
          <p className="text-xs mt-1 opacity-60 font-mono break-all leading-relaxed">{check.detail}</p>
        )}
      </div>
    </motion.div>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────────────── */
const BlockchainHealth = () => {
  const [report,   setReport]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [lastRun,  setLastRun]  = useState(null);
  const [filter,   setFilter]   = useState('all');  // all | pass | fail | warn

  const runCheck = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await axiosInstance.get('/blockchain/health');
      const data = res?.data?.data ?? res?.data ?? {};
      setReport(data);
      setLastRun(new Date());
      const { passed, failed, warned } = data.summary ?? {};
      if (failed === 0)         toast.success(`All ${passed} checks passed! ✅`);
      else if (failed <= 3)     toast(`${passed} passed, ${failed} failed`, { icon: '⚠️' });
      else                      toast.error(`${failed} checks failed`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Health check request failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = report?.checks?.filter(c => filter === 'all' || c.status === filter) ?? [];
  const score    = report
    ? Math.round((report.summary.passed / report.summary.total) * 100)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-10">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30">
              <SiPolygon className="w-6 h-6 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
              Blockchain Health Dashboard
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-14">
            Automated 19-point audit of your Polygon Amoy integration
          </p>
          {lastRun && (
            <p className="text-slate-500 text-xs ml-14 mt-1 flex items-center gap-1">
              <HiOutlineClock className="w-3 h-3" />
              Last run: {lastRun.toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          id="run-blockchain-health-check"
          onClick={runCheck}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <HiOutlineArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running Checks…' : 'Run Health Check'}
        </button>
      </motion.div>

      {/* ── Empty / Loading state ───────────────────────────────────────── */}
      {!report && !loading && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="p-6 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <HiOutlineCpuChip className="w-12 h-12 text-violet-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No report yet</h2>
          <p className="text-slate-500 max-w-md">
            Click <strong className="text-violet-400">Run Health Check</strong> to audit your Polygon Amoy blockchain integration across 19 verification points.
          </p>
        </motion.div>
      )}

      {loading && !report && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Running 19 blockchain checks…</p>
        </div>
      )}

      {/* ── Report ──────────────────────────────────────────────────────── */}
      {report && (
        <AnimatePresence>
          {/* Score + Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900 border border-white/10">
              <div className="relative w-24 h-24 mb-3">
                <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'}
                    strokeWidth="12"
                    strokeDasharray={`${score * 2.51} 251`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {score}%
                  </span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">Health Score</p>
            </div>

            <StatPill value={report.summary.passed} label="Passed" color="bg-emerald-500/10 border-emerald-500/25 text-emerald-300" />
            <StatPill value={report.summary.failed} label="Failed" color="bg-rose-500/10 border-rose-500/25 text-rose-300" />
            <StatPill value={report.summary.warned} label="Warnings" color="bg-amber-500/10 border-amber-500/25 text-amber-300" />
          </motion.div>

          {/* Network Info */}
          {report.network && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm"
            >
              {[
                { label: 'RPC',           value: report.network.rpcUrl         },
                { label: 'Chain ID',      value: report.network.chainId        },
                { label: 'Contract',      value: report.network.contractAddress },
                { label: 'Explorer',      value: report.network.explorerBase    },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider">{label}</p>
                  <p className="font-mono text-xs text-slate-300 break-all">
                    {value === 'NOT_SET'
                      ? <span className="text-rose-400">NOT SET</span>
                      : value}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'pass', 'fail', 'warn'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  filter === f
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {f === 'all' ? `All (${report.summary.total})` :
                 f === 'pass' ? `✅ Passed (${report.summary.passed})` :
                 f === 'fail' ? `❌ Failed (${report.summary.failed})` :
                 `⚠️ Warnings (${report.summary.warned})`}
              </button>
            ))}
          </div>

          {/* Check list */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-3"
          >
            {filtered.length === 0 ? (
              <p className="col-span-2 text-center text-slate-500 py-8">No checks match this filter.</p>
            ) : filtered.map((check, i) => (
              <CheckRow key={check.id} check={check} index={i} />
            ))}
          </motion.div>

          {/* Setup Guide if critical checks fail */}
          {report.summary.failed > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-8 p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20"
            >
              <h3 className="text-rose-300 font-semibold mb-3 flex items-center gap-2">
                <HiOutlineExclamationTriangle className="w-5 h-5" /> Setup Required
              </h3>
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                <li>Add <code className="text-violet-300">POLYGON_AMOY_RPC_URL</code> to your <code>.env</code> (free: <a href="https://rpc-amoy.polygon.technology" className="text-violet-400 underline" target="_blank" rel="noreferrer">rpc-amoy.polygon.technology</a>)</li>
                <li>Add <code className="text-violet-300">BLOCKCHAIN_PRIVATE_KEY</code> – the 0x-prefixed private key of your signer wallet</li>
                <li>Add <code className="text-violet-300">CONTRACT_ADDRESS</code> – deploy your NotaryChain contract on Amoy first</li>
                <li>Fund your wallet with testnet MATIC: <a href="https://faucet.polygon.technology" className="text-violet-400 underline" target="_blank" rel="noreferrer">faucet.polygon.technology</a></li>
                <li>Restart the backend server after updating <code>.env</code></li>
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default BlockchainHealth;
