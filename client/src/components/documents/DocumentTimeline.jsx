import React from 'react';
import { motion } from 'framer-motion';

const DocumentTimeline = ({ documentId }) => {
  const events = [
    { date: 'Oct 24, 2023 - 14:30', title: 'Document Uploaded', user: 'Jane Doe', color: 'bg-indigo-500' },
    { date: 'Oct 24, 2023 - 14:35', title: 'AI Verification Completed', user: 'System', color: 'bg-emerald-500' },
    { date: 'Oct 25, 2023 - 09:15', title: 'Shared with Legal Team', user: 'Jane Doe', color: 'bg-blue-500' },
    { date: 'Oct 25, 2023 - 11:20', title: 'Approved by Bank', user: 'Bank Reviewer', color: 'bg-emerald-500' }
  ];

  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
      <h3 className="text-lg font-semibold text-white mb-6">Activity Timeline</h3>
      <div className="relative border-l border-slate-700 ml-3 space-y-8">
        {events.map((e, i) => (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="pl-6 relative">
            <div className={`absolute w-3 h-3 ${e.color} rounded-full -left-[6.5px] top-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-${e.color.split('-')[1]}-500/50`} />
            <p className="text-sm text-slate-400 mb-1">{e.date}</p>
            <p className="text-white font-medium">{e.title}</p>
            <p className="text-sm text-slate-500">by {e.user}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default DocumentTimeline;
