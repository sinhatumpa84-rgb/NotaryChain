import React from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';

const AuditLogs = () => {
  return (
    <DashboardLayout title="Audit Logs" subtitle="System-wide activity tracking">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 border-b border-slate-700 text-slate-400">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">User</th>
              <th className="p-4">Action</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {[
              { time: '2023-10-25 14:30:22', user: 'alice@corp.com', action: 'UPLOAD_DOCUMENT', ip: '192.168.1.1', status: 'SUCCESS' },
              { time: '2023-10-25 14:28:10', user: 'bob@bank.com', action: 'LOGIN', ip: '10.0.0.5', status: 'SUCCESS' },
              { time: '2023-10-25 13:15:00', user: 'unknown', action: 'LOGIN_FAILED', ip: '185.22.45.1', status: 'FAILED' }
            ].map((log, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-4 font-mono text-xs">{log.time}</td>
                <td className="p-4">{log.user}</td>
                <td className="p-4"><span className="text-indigo-400">{log.action}</span></td>
                <td className="p-4 font-mono text-xs">{log.ip}</td>
                <td className="p-4"><span className={log.status==='SUCCESS'?'text-emerald-400':'text-rose-400'}>{log.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};
export default AuditLogs;
