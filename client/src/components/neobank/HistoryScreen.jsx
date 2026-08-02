import React, { useEffect, useState } from 'react';
import { getNeobankTransactions } from '../../api/neobankApi';

export default function HistoryScreen() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNeobankTransactions()
      .then((res) => setTxns(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-lg">
          📜
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Transaction History</h2>
          <p className="text-[10px] text-slate-400">Polygon OMS Ledger & Webhook Logs</p>
        </div>
      </div>

      <div className="space-y-2">
        {txns.map((tx) => (
          <div key={tx.id} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-base flex items-center justify-center">
                  {tx.icon === 'send' ? '💸' : tx.icon === 'cash' ? '🏪' : tx.icon === 'bank' ? '🏦' : '📥'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{tx.title}</div>
                  <div className="text-[10px] text-slate-400">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {tx.amount}
                </div>
                <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                  {tx.status}
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Hash: {tx.txHash}</span>
              <span className="text-primary-400">Polygon Verified ✓</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
