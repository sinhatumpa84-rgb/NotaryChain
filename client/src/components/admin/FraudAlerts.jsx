import React from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { HiOutlineShieldExclamation } from 'react-icons/hi2';

const FraudAlerts = () => {
  return (
    <DashboardLayout title="Fraud Alerts" subtitle="AI-detected security risks">
      <div className="grid gap-4">
        {[1,2,3].map((i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="p-6 bg-slate-900/50 border border-rose-500/20 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500"><HiOutlineShieldExclamation size={32}/></div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">Suspicious Metadata <span className="px-2 py-1 text-xs bg-rose-500 text-white rounded-md">Critical</span></h3>
                <p className="text-slate-400 mt-1">Document DOC-9982 • Uploaded by unknown_user</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl">Dismiss</button>
              <button className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl">Investigate</button>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};
export default FraudAlerts;
