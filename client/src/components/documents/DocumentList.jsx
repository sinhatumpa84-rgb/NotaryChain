import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocument, HiOutlineEllipsisVertical, HiOutlineFunnel } from 'react-icons/hi2';

const DocumentList = () => {
  const [docs] = useState([
    { id: 1, name: 'NDA_Corp_2023.pdf', status: 'Verified', category: 'Contract', date: 'Oct 12, 2023', size: '2.4 MB' },
    { id: 2, name: 'ID_Passport_JD.jpg', status: 'Pending', category: 'Identity', date: 'Oct 14, 2023', size: '1.1 MB' },
    { id: 3, name: 'Q3_Financials.xlsx', status: 'Rejected', category: 'Financial', date: 'Oct 15, 2023', size: '5.6 MB' },
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Verified': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Rejected': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-6">
        <div className="relative w-64">
          <input type="text" placeholder="Search documents..." className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
          <HiOutlineFunnel /> Filter
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr className="text-slate-400 text-sm">
              <th className="p-4 font-medium">Document Name</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Uploaded</th>
              <th className="p-4 font-medium">Size</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, i) => (
              <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={doc.id} className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors group cursor-pointer">
                <td className="p-4 flex items-center gap-3 text-white font-medium">
                  <div className="p-2 bg-slate-800 rounded-lg text-indigo-400"><HiOutlineDocument /></div>
                  {doc.name}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(doc.status)}`}>{doc.status}</span>
                </td>
                <td className="p-4 text-slate-400">{doc.category}</td>
                <td className="p-4 text-slate-400">{doc.date}</td>
                <td className="p-4 text-slate-400">{doc.size}</td>
                <td className="p-4 text-right">
                  <button className="p-2 text-slate-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><HiOutlineEllipsisVertical size={20}/></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DocumentList;
