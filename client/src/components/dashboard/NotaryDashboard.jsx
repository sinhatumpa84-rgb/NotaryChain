import React from 'react';
import DashboardLayout from './DashboardLayout';
import { HiOutlinePencilSquare, HiOutlineDocumentCheck } from 'react-icons/hi2';

const NotaryDashboard = () => {
  return (
    <DashboardLayout title="Notary Workspace" subtitle="Digital certification and signing">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Pending Signatures</h3>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm border border-amber-500/20">8 Awaiting</span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-700 bg-slate-900/30 flex justify-between items-center hover:border-indigo-500/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <HiOutlinePencilSquare size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Power of Attorney - John Doe</h4>
                    <p className="text-sm text-slate-400">Requested by: Legal Partners LLC</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                  Sign Now
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-indigo-500/20 backdrop-blur-xl flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/30">
            <HiOutlineDocumentCheck size={40} />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">1,042</h3>
          <p className="text-indigo-200">Total Certificates Issued</p>
          <div className="mt-6 w-full pt-6 border-t border-indigo-500/20">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">This Month</span>
              <span className="text-emerald-400 font-medium">+42 (+12%)</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotaryDashboard;
