import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Settings = () => {
  return (
    <DashboardLayout title="Account Settings" subtitle="Manage your security and preferences">
      <div className="space-y-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Change Password</h3>
          <div className="space-y-4 max-w-md">
            <Input type="password" placeholder="Current Password" className="w-full bg-slate-800 border-slate-700 text-white" />
            <Input type="password" placeholder="New Password" className="w-full bg-slate-800 border-slate-700 text-white" />
            <Input type="password" placeholder="Confirm New Password" className="w-full bg-slate-800 border-slate-700 text-white" />
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl mt-2">Update Password</Button>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', desc: 'Receive daily summary emails' },
              { label: 'Document Alerts', desc: 'Get notified when status changes' },
              { label: 'Fraud Alerts', desc: 'Critical security alerts (Cannot be disabled)' }
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-white font-medium">{n.label}</h4>
                  <p className="text-slate-400 text-sm">{n.desc}</p>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${i===2 ? 'bg-indigo-500 opacity-50' : 'bg-indigo-600'}`}>
                  <div className="w-4 h-4 bg-white rounded-full translate-x-6 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-slate-900/50 border border-rose-500/20 rounded-3xl">
          <h3 className="text-lg font-bold text-rose-500 mb-2">Danger Zone</h3>
          <p className="text-slate-400 text-sm mb-4">Permanently delete your account and all associated data.</p>
          <Button className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/20 px-6 py-2 rounded-xl">Delete Account</Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
export default Settings;
