import React from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const data = [{name:'Mon',v:40},{name:'Tue',v:30},{name:'Wed',v:60},{name:'Thu',v:45},{name:'Fri',v:70},{name:'Sat',v:85},{name:'Sun',v:65}];
  return (
    <DashboardLayout title="Analytics & Reports" subtitle="Platform usage insights">
      <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl mb-6">
        <h3 className="text-white font-semibold mb-6">Verification Success Rate</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <XAxis dataKey="name" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip contentStyle={{backgroundColor:'#1e293b', border:'none', color:'#fff'}} />
              <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Analytics;
