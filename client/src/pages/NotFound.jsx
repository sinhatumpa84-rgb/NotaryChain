import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlineChartPie } from 'react-icons/hi2';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <motion.div 
        animate={{ y: [0, -20, 0] }} 
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="text-[15rem] font-black bg-clip-text text-transparent bg-gradient-to-b from-indigo-500/20 to-slate-900 select-none"
      >
        404
      </motion.div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-white mb-4">Page Not Found</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-400 mb-8 max-w-md text-center">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4">
          <Link to="/" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"><HiOutlineHome/> Go Home</Link>
          <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"><HiOutlineChartPie/> Dashboard</Link>
        </motion.div>
      </div>
    </div>
  );
};
export default NotFound;
