import React from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { motion } from 'framer-motion';

const UserManagement = () => {
  return (
    <DashboardLayout title="User Management" subtitle="Manage system users and roles">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 border-b border-slate-700">
            <tr className="text-slate-400 text-sm">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Last Login</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Alice Smith', email: 'alice@corp.com', role: 'Company', status: 'Active' },
              { name: 'Bob Jones', email: 'bob@bank.com', role: 'Bank', status: 'Active' },
              { name: 'Charlie Notary', email: 'charlie@legal.com', role: 'Notary', status: 'Inactive' }
            ].map((u, i) => (
              <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.1 }} key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                <td className="p-4">
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-slate-400 text-xs">{u.email}</p>
                </td>
                <td className="p-4"><span className="px-2.5 py-1 text-xs rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{u.role}</span></td>
                <td className="p-4"><span className={`px-2.5 py-1 text-xs rounded-md ${u.status==='Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'} border`}>{u.status}</span></td>
                <td className="p-4 text-slate-400 text-sm">2 hours ago</td>
                <td className="p-4 text-indigo-400 text-sm cursor-pointer hover:text-indigo-300">Edit</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};
export default UserManagement;
