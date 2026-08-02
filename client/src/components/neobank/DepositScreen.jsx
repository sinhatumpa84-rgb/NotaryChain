import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineBuildingLibrary, HiCreditCard, HiCheck, HiClipboardDocument } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { createVirtualAccount } from '../../api/neobankApi';

export default function DepositScreen({ account }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('bank');

  const bankDetails = {
    bankName: 'Polygon Open Money Bank (Evolve Bank & Trust)',
    accountNumber: '9948201948',
    routingNumber: '021000021',
    accountType: 'Checking',
    wireRoutingNumber: '021000021'
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Account number copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center text-lg">
          🏦
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Bank & Card Top-Up</h2>
          <p className="text-[10px] text-slate-400">Direct deposit & card funding on Polygon</p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-white/5">
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'bank' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          US Virtual Bank
        </button>
        <button
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'card' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Debit Card Top-Up
        </button>
      </div>

      {activeTab === 'bank' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-primary-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Dedicated Virtual Account</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                Auto-Converts to USDC
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Bank Name</div>
                  <div className="font-semibold text-white text-xs">{bankDetails.bankName}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Account Number</div>
                  <div className="font-bold text-primary-300 text-sm">{bankDetails.accountNumber}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountNumber)}
                  className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  {copied ? <HiCheck className="w-4 h-4 text-emerald-400" /> : <HiClipboardDocument className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Routing Number</div>
                  <div className="font-semibold text-white">{bankDetails.routingNumber}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Account Type</div>
                  <div className="font-semibold text-white">{bankDetails.accountType}</div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Use these details to set up payroll direct deposit, ACH transfer, or domestic wire. Transfers arrive in 1 business day and automatically convert to your USDC balance.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <HiCreditCard className="w-5 h-5 text-violet-400" />
            <span>Debit Card Top-Up (Fiat-to-Crypto)</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Card Number (4532 **** **** ****)"
              className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <input
              type="number"
              placeholder="Amount USD ($100.00)"
              className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-semibold placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => toast.success('Card top-up initiated! $100.00 USDC credited.')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-violet-500/20 hover:opacity-95 transition-all"
          >
            Top-Up with Debit Card
          </button>
        </motion.div>
      )}
    </div>
  );
}
