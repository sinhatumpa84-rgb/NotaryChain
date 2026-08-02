import React from 'react';
import { HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';

const VerificationDetails = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-[600px] bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500">
        Document Preview Viewer
      </div>
      <div className="space-y-6">
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Verification Actions</h3>
          <textarea className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 mb-4" placeholder="Add review notes here..."></textarea>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"><HiOutlineCheck size={20}/> Approve</button>
            <button className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"><HiOutlineXMark size={20}/> Reject</button>
          </div>
        </div>
        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h3 className="text-white font-medium mb-3">AI Analysis Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Authenticity Score</span><span className="text-emerald-400 font-bold">98%</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Data Match</span><span className="text-emerald-400 font-bold">Yes</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Tamper Flags</span><span className="text-emerald-400 font-bold">0</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VerificationDetails;
