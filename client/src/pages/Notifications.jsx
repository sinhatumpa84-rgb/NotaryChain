import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { HiOutlineBellAlert, HiOutlineDocumentCheck, HiOutlineUserGroup } from 'react-icons/hi2';

const Notifications = () => {
  const notifs = [
    { id: 1, title: 'Document Verified', msg: 'Your document NDA_Corp.pdf has been verified.', time: '2 hours ago', icon: <HiOutlineDocumentCheck/>, color: 'text-emerald-400 bg-emerald-400/10' },
    { id: 2, title: 'Action Required', msg: 'Please review pending ID verifications.', time: '5 hours ago', icon: <HiOutlineBellAlert/>, color: 'text-amber-400 bg-amber-400/10' },
    { id: 3, title: 'New Team Member', msg: 'Alice joined your organization.', time: '1 day ago', icon: <HiOutlineUserGroup/>, color: 'text-indigo-400 bg-indigo-400/10' },
  ];

  return (
    <DashboardLayout title="Notifications" actions={<button className="text-indigo-400 hover:text-indigo-300 font-medium">Mark all as read</button>}>
      <div className="space-y-4 max-w-4xl">
        {notifs.map((n, i) => (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.1 }} key={n.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-start gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className={`p-3 rounded-xl ${n.color}`}>{React.cloneElement(n.icon, {size: 24})}</div>
            <div className="flex-1">
              <h4 className="text-white font-medium">{n.title}</h4>
              <p className="text-slate-400 mt-1">{n.msg}</p>
              <span className="text-xs text-slate-500 mt-2 block">{n.time}</span>
            </div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};
export default Notifications;
