import React from 'react';
import DashboardLayout from './DashboardLayout';
import { HiOutlineMagnifyingGlass, HiOutlineShieldExclamation, HiOutlineCheckBadge } from 'react-icons/hi2';

const BankDashboard = () => {
  return (
    <DashboardLayout title="Bank Verification Portal" subtitle="Review and verify incoming documents">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><HiOutlineMagnifyingGlass size={24}/></div>
            <h3 className="text-lg font-medium text-white">Pending Requests</h3>
          </div>
          <p className="text-4xl font-bold text-white">24</p>
          <p className="text-sm text-indigo-300 mt-2">12 High Priority</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><HiOutlineCheckBadge size={24}/></div>
            <h3 className="text-lg font-medium text-white">Approved Today</h3>
          </div>
          <p className="text-4xl font-bold text-white">15</p>
          <p className="text-sm text-emerald-300 mt-2">+5 from yesterday</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-600/20 to-red-600/20 border border-rose-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400"><HiOutlineShieldExclamation size={24}/></div>
            <h3 className="text-lg font-medium text-white">Fraud Alerts</h3>
          </div>
          <p className="text-4xl font-bold text-white">2</p>
          <p className="text-sm text-rose-300 mt-2">Requires immediate attention</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Verification Queue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="pb-3 font-medium">Document ID</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Risk Score</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'DOC-8492', company: 'Acme Corp', type: 'Financial Statement', risk: 'Low', rColor: 'text-emerald-400' },
                { id: 'DOC-1123', company: 'Global Tech LLC', type: 'Proof of Address', risk: 'High', rColor: 'text-rose-400' },
                { id: 'DOC-5591', company: 'Stark Industries', type: 'Identity Verification', risk: 'Medium', rColor: 'text-amber-400' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-white font-medium">{row.id}</td>
                  <td className="py-4 text-slate-300">{row.company}</td>
                  <td className="py-4 text-slate-300">{row.type}</td>
                  <td className={`py-4 ${row.rColor} font-medium`}>{row.risk}</td>
                  <td className="py-4">
                    <button className="px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm transition-colors border border-indigo-500/20">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BankDashboard;
