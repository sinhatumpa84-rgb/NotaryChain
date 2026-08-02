import React from 'react';
import DashboardLayout from './DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineClock, HiOutlineExclamationTriangle } from 'react-icons/hi2';

const mockData = [
  { name: 'Mon', docs: 400, users: 240 },
  { name: 'Tue', docs: 300, users: 139 },
  { name: 'Wed', docs: 550, users: 980 },
  { name: 'Thu', docs: 278, users: 390 },
  { name: 'Fri', docs: 189, users: 480 },
  { name: 'Sat', docs: 239, users: 380 },
  { name: 'Sun', docs: 349, users: 430 },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout 
      title="Admin Overview" 
      subtitle={`Welcome back. Here's what's happening today.`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Users', value: '1,248', icon: <HiOutlineUsers/>, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Total Documents', value: '14,293', icon: <HiOutlineDocumentText/>, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { title: 'Pending Verifications', value: '84', icon: <HiOutlineClock/>, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'Fraud Alerts', value: '3', icon: <HiOutlineExclamationTriangle/>, color: 'text-rose-500', bg: 'bg-rose-500/10' }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                {React.cloneElement(stat.icon, { className: 'w-6 h-6' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Document Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                <Area type="monotone" dataKey="docs" stroke="#6366f1" fillOpacity={1} fill="url(#colorDocs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-6">User Registrations</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
        <div className="flex gap-4">
          {['API Server', 'Database', 'Storage Block'].map((sys, i) => (
             <div key={i} className="flex-1 p-4 rounded-xl bg-slate-900/50 border border-emerald-500/20 flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
               <div>
                 <p className="text-white font-medium">{sys}</p>
                 <p className="text-emerald-400 text-sm">Healthy • 99.9% Uptime</p>
               </div>
             </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
