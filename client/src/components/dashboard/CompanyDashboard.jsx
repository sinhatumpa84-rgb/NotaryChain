import React from 'react';
import DashboardLayout from './DashboardLayout';
import { HiOutlineDocumentPlus, HiOutlineCheckCircle, HiOutlineClock, HiOutlineShare } from 'react-icons/hi2';
import Button from '../common/Button';

const CompanyDashboard = () => {
  return (
    <DashboardLayout 
      title="Company Portal" 
      subtitle="Manage your documents and verifications"
      actions={<Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 px-4 flex items-center gap-2"><HiOutlineDocumentPlus /> Upload New</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'My Documents', value: '42', icon: <HiOutlineDocumentPlus/>, color: 'text-indigo-500' },
          { title: 'Verified', value: '28', icon: <HiOutlineCheckCircle/>, color: 'text-emerald-500' },
          { title: 'Pending', value: '14', icon: <HiOutlineClock/>, color: 'text-amber-500' },
          { title: 'Shared', value: '5', icon: <HiOutlineShare/>, color: 'text-blue-500' }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl flex items-center gap-4 shadow-sm dark:shadow-none">
            <div className={`p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 ${stat.color}`}>
              {React.cloneElement(stat.icon, { className: 'w-8 h-8' })}
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-sm dark:shadow-none">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Documents</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Q3 Financial Report.pdf', status: 'Verified', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', date: '2 hours ago' },
                  { name: 'Vendor Contract_V2.docx', status: 'Pending', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', date: 'Yesterday' },
                  { name: 'Articles of Incorporation.pdf', status: 'Rejected', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', date: 'Oct 12, 2023' }
                ].map((doc, i) => (
                  <tr key={i} className="border-b border-slate-200/50 dark:border-slate-700/50 last:border-0">
                    <td className="py-4 text-slate-900 dark:text-white font-medium">{doc.name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-xs border ${doc.color}`}>{doc.status}</span>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 text-sm">{doc.date}</td>
                    <td className="py-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer text-sm font-semibold">View</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-sm dark:shadow-none flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Completion</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <p className="text-right text-sm text-indigo-600 dark:text-indigo-400 font-semibold">80% Complete</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2 text-emerald-500"><HiOutlineCheckCircle /> Email Verified</li>
              <li className="flex items-center gap-2 text-emerald-500"><HiOutlineCheckCircle /> Company Details Added</li>
              <li className="flex items-center gap-2 text-slate-400"><div className="w-4 h-4 rounded-full border border-slate-400" /> Identity Verification Pending</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
