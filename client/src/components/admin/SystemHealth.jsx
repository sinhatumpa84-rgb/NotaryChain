import React from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { motion } from 'framer-motion';

const SystemHealth = () => {
  const metrics = [
    { label: 'API Response Time', value: '45ms', status: 'optimal' },
    { label: 'Database Load', value: '24%', status: 'optimal' },
    { label: 'Memory Usage', value: '4.2GB / 8GB', status: 'warning' },
    { label: 'Storage', value: '45TB / 100TB', status: 'optimal' },
    { label: 'Active Sessions', value: '1,248', status: 'optimal' },
    { label: 'Error Rate (1h)', value: '0.01%', status: 'optimal' }
  ];

  return (
    <DashboardLayout title="System Health" subtitle="Real-time infrastructure monitoring">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i*0.1 }} key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400">{m.label}</p>
              <div className={`w-3 h-3 rounded-full ${m.status==='optimal'?'bg-emerald-500':'bg-amber-500'} animate-pulse`} />
            </div>
            <h3 className="text-3xl font-bold text-white">{m.value}</h3>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};
export default SystemHealth;
