import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineEye } from 'react-icons/hi2';

const VerificationQueue = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-800/50 border-b border-slate-700">
          <tr className="text-slate-400 text-sm">
            <th className="p-4 font-medium">Document</th>
            <th className="p-4 font-medium">Requester</th>
            <th className="p-4 font-medium">Priority</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-300">
          <tr className="border-b border-slate-800 hover:bg-slate-800/30">
            <td className="p-4 font-medium text-white">ID_Passport_V2.pdf</td>
            <td className="p-4">Acme Corp</td>
            <td className="p-4"><span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-xs border border-rose-500/20">Urgent</span></td>
            <td className="p-4">Pending Review</td>
            <td className="p-4 text-right">
              <Link to="/verifications/1" className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors">
                <HiOutlineEye/> Review
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default VerificationQueue;
