import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import CompanyDashboard from '../components/dashboard/CompanyDashboard';
import BankDashboard from '../components/dashboard/BankDashboard';
import NotaryDashboard from '../components/dashboard/NotaryDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  
  if (!user) return null; // Or LoadingSkeleton

  const getDashboardContent = () => {
    switch (user.role) {
      case 'admin': return <AdminDashboard />;
      case 'company': return <CompanyDashboard />;
      case 'bank': return <BankDashboard />;
      case 'notary': return <NotaryDashboard />;
      default: return <CompanyDashboard />;
    }
  };

  return (
    <div className="text-slate-900 dark:text-white pb-12">
      {getDashboardContent()}
    </div>
  );
};

export default Dashboard;
